import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const name = formData.get("name")?.toString() || file?.name || "Uploaded document";
    const type = formData.get("type")?.toString() || "Other";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const filePath = `/uploads/${user.id}/${fileName}`;

    const safeFileUrl = `/uploads/${user.id}/${fileName}`;

    await prisma.document.create({
      data: {
        userId: user.id,
        name,
        type,
        fileUrl: safeFileUrl,
      },
    });

    return NextResponse.json({ success: true, fileUrl: safeFileUrl });
  } catch (error) {
    console.error("Upload API error", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
