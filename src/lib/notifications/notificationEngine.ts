import prisma from "@/lib/prisma";

// Mock email sending function to represent Resend/SendGrid abstraction
async function sendEmail(to: string, subject: string, html: string) {
  // In production, this uses Resend.
  console.log("-----------------------------------------");
  console.log(`[EMAIL DISPATCHED] To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body: ${html}`);
  console.log("-----------------------------------------");
}

export async function scheduleDeadlineReminders(userId: string) {
  const userDeadlines = await prisma.userDeadline.findMany({
    where: { userId },
    include: { deadline: true }
  });

  const now = Date.now();
  const offsets = [30, 14, 7, 3, 1, 0]; // Days before deadline

  for (const ud of userDeadlines) {
    for (const offset of offsets) {
      const remindAt = new Date(ud.deadline.deadlineDate.getTime() - (offset * 24 * 60 * 60 * 1000));
      
      // Skip if the remind date has already passed
      if (remindAt.getTime() < now) continue;

      // Idempotency check
      const existing = await prisma.deadlineReminder.findFirst({
        where: {
          userId,
          deadlineId: ud.id,
          remindAt: {
            gte: new Date(remindAt.getTime() - 1000 * 60 * 60), // within an hour
            lte: new Date(remindAt.getTime() + 1000 * 60 * 60)
          }
        }
      });

      if (!existing) {
        await prisma.deadlineReminder.create({
          data: {
            userId,
            deadlineId: ud.id,
            remindAt,
            channel: "EMAIL",
            sent: false
          }
        });
      }
    }
  }
}

export async function processDueReminders() {
  const dueReminders = await prisma.deadlineReminder.findMany({
    where: {
      sent: false,
      remindAt: { lte: new Date() }
    },
    include: {
      user: { select: { email: true, name: true } },
      userDeadline: {
        include: {
          scholarship: { select: { title: true } },
          deadline: { select: { deadlineDate: true, title: true } }
        }
      }
    }
  });

  for (const reminder of dueReminders) {
    if (!reminder.user.email) continue;

    const schName = reminder.userDeadline.scholarship.title;
    const deadlineName = reminder.userDeadline.deadline.title;
    const daysLeft = Math.ceil((reminder.userDeadline.deadline.deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    let subject = `Reminder: ${schName} Deadline approaching!`;
    if (daysLeft <= 3) subject = `URGENT: ${schName} Deadline in ${daysLeft} days!`;

    const html = `
      <h3>Hello ${reminder.user.name || 'Scholar'},</h3>
      <p>This is a reminder that the <strong>${deadlineName}</strong> for <strong>${schName}</strong> is due in ${daysLeft} days.</p>
      <p>Deadline Date: ${reminder.userDeadline.deadline.deadlineDate.toLocaleDateString()}</p>
      <p>Please log in to your dashboard to review your roadmap and ensure all documents are submitted.</p>
      <a href="https://scholarx.app/dashboard">Go to Dashboard</a>
    `;

    // Send email
    await sendEmail(reminder.user.email, subject, html);

    // Create In-App Notification
    await prisma.notification.create({
      data: {
        userId: reminder.userId,
        type: "DEADLINE_ALERT",
        message: `${daysLeft === 0 ? 'Today is the deadline' : `Only ${daysLeft} days left`} for ${schName} (${deadlineName}).`,
        readStatus: false
      }
    });

    // Mark as sent
    await prisma.deadlineReminder.update({
      where: { id: reminder.id },
      data: { sent: true }
    });
  }

  // Also process missed deadlines
  await markMissedDeadlines();
}

async function markMissedDeadlines() {
  const missed = await prisma.userDeadline.findMany({
    where: {
      status: { notIn: ["COMPLETED", "SUBMITTED", "MISSED"] },
      deadline: {
        deadlineDate: { lt: new Date() }
      }
    },
    include: {
      scholarship: { select: { title: true } }
    }
  });

  for (const ud of missed) {
    await prisma.userDeadline.update({
      where: { id: ud.id },
      data: { status: "MISSED" }
    });

    // Penalize Tree Growth / create activity log
    await prisma.notification.create({
      data: {
        userId: ud.userId,
        type: "DEADLINE_MISSED",
        message: `You missed the deadline for ${ud.scholarship.title}. Your progress score has been slightly penalized.`,
        readStatus: false
      }
    });

    // Fetch user and deduct
    const user = await prisma.user.findUnique({ where: { id: ud.userId } });
    if (user) {
      const newPercent = Math.max(0, user.growthPercent - 5);
      await prisma.user.update({
        where: { id: user.id },
        data: { growthPercent: newPercent }
      });
    }
  }
}
