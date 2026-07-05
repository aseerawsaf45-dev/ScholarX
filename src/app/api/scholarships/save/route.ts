import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const saved = await prisma.savedScholarship.findMany({
      where: { userId: user.id },
      include: {
        scholarship: true
      }
    });

    return NextResponse.json(saved.map(s => s.scholarship));
  } catch (error) {
    console.error("GET saved scholarships error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const { scholarshipId } = await request.json();
    if (!scholarshipId) return new NextResponse("Missing scholarshipId", { status: 400 });

    const existing = await prisma.savedScholarship.findUnique({
      where: {
        userId_scholarshipId: {
          userId: user.id,
          scholarshipId
        }
      }
    });

    if (existing) {
      await prisma.savedScholarship.delete({
        where: {
          userId_scholarshipId: {
            userId: user.id,
            scholarshipId
          }
        }
      });
      return NextResponse.json({ saved: false });
    } else {
      await prisma.savedScholarship.create({
        data: {
          userId: user.id,
          scholarshipId,
          status: "saved"
        }
      });
      return NextResponse.json({ saved: true });
    }
  } catch (error) {
    console.error("POST save scholarship error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
