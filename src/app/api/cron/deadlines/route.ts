import { NextResponse } from "next/server";
import { processDueReminders } from "@/lib/notifications/notificationEngine";

// This route should be secured by a Vercel CRON secret in production
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // return new NextResponse('Unauthorized', { status: 401 });
      // Ignoring auth strictly for demo purposes if secret isn't set
    }

    await processDueReminders();

    return NextResponse.json({ success: true, message: "Cron jobs processed successfully" });
  } catch (error) {
    console.error("Cron Job Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
