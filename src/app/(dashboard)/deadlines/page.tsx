import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { DeadlineTracker } from "@/features/deadlines/DeadlineTracker";

export default async function DeadlinesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 h-[calc(100vh-8rem)] flex flex-col">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Deadlines</h1>
        <p className="text-slate-400 mt-1">Track your upcoming scholarship applications and deadlines.</p>
      </div>

      <div className="flex-1 min-h-0">
        <DeadlineTracker />
      </div>
    </div>
  );
}
