import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { DeadlineTracker } from "@/features/deadlines/DeadlineTracker";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";

export default async function DeadlinesPage() {
  const headerList = await headers();
  let userId = headerList.get('x-user-id');

  if (!userId) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/auth/login");
    userId = user!.id;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Deadlines</h1>
          <p className="text-muted-foreground mt-1">Track your upcoming scholarship applications and deadlines.</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard">
            <Icon name="ArrowLeft" className="mr-2" size={16} /> Back to Dashboard
          </Link>
        </Button>
      </div>

      <div className="flex-1 min-h-0">
        <DeadlineTracker />
      </div>
    </div>
  );
}
