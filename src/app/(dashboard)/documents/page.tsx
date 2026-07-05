import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { DocumentChecklists } from "@/components/dashboard/documents/DocumentChecklists";

import { headers } from "next/headers";

export default async function DocumentsPage() {
  const headerList = await headers();
  let userId = headerList.get('x-user-id');

  if (!userId) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/auth/login");
    userId = user.id;
  }

  const savedScholarships = await prisma.savedScholarship.findMany({
    where: {
      userId: userId,
    },
    include: {
      scholarship: true,
    },
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Documents</h1>
          <p className="text-muted-foreground mt-1">Manage your document verification checklist and view AI analysis ratings.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Button variant="outline" asChild>
            <Link href="/dashboard">
              <Icon name="ArrowLeft" className="mr-2" size={16} /> Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>

      {/* Document Checklists Tracker */}
      <DocumentChecklists savedScholarships={savedScholarships} />
    </div>
  );
}
