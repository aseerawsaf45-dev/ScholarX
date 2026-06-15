import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { ReadinessBadge } from "@/components/dashboard/documents/ReadinessBadge";

export default async function DocumentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const documents = await prisma.document.findMany({
    where: {
      userId: user.id,
    },
    include: {
      reviews: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">My Documents</h1>
          <p className="text-slate-400 mt-1">Manage your uploaded application documents and AI reviews.</p>
        </div>
        <Link 
          href="/upload" 
          className="bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-lg shadow-primary-500/20"
        >
          <Icon name="Upload" className="w-5 h-5" />
          Upload Document
        </Link>
      </div>

      {documents.length === 0 ? (
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4 text-slate-500">
            <Icon name="FileText" className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-semibold text-slate-200 mb-2">No documents yet</h2>
          <p className="text-slate-400 max-w-md mb-6">
            Upload your CV, Statement of Purpose, or other application documents to get instant AI feedback and improvements.
          </p>
          <Link 
            href="/upload" 
            className="text-primary-400 hover:text-primary-300 font-medium flex items-center gap-2"
          >
            Upload your first document <Icon name="ArrowRight" className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => {
            const latestReview = doc.reviews[0];
            return (
              <Link 
                key={doc.id} 
                href={`/documents/${doc.id}`}
                className="bg-slate-900/50 hover:bg-slate-800/80 backdrop-blur-xl border border-slate-800 hover:border-slate-700 rounded-2xl p-6 transition-all group flex flex-col"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-slate-800/50 rounded-xl text-slate-400 group-hover:text-primary-400 group-hover:bg-primary-500/10 transition-colors">
                    <Icon name="FileText" className="w-6 h-6" />
                  </div>
                  {latestReview ? (
                    <div className="flex flex-col items-end gap-2">
                      <span className={`text-xl font-bold ${
                        latestReview.overallScore >= 80 ? 'text-emerald-500' : 
                        latestReview.overallScore >= 60 ? 'text-yellow-500' : 'text-red-500'
                      }`}>
                        {latestReview.overallScore}
                        <span className="text-xs text-slate-500 ml-1">/100</span>
                      </span>
                      <ReadinessBadge status={latestReview.scholarshipReadiness as any} />
                    </div>
                  ) : (
                    <span className="px-2.5 py-1 text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full flex items-center gap-1.5">
                      <Icon name="Loader" className="w-3 h-3 animate-spin" />
                      Processing
                    </span>
                  )}
                </div>
              
              <h3 className="font-semibold text-slate-200 truncate mb-1 group-hover:text-primary-400 transition-colors">
                {doc.name}
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                {doc.type}
              </p>
              
              <div className="mt-auto pt-4 border-t border-slate-800 flex items-center justify-between text-sm">
                <span className="text-slate-400">
                  {doc.createdAt.toLocaleDateString()}
                </span>
                <span className="text-primary-400 font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0">
                  View Analysis <Icon name="ArrowRight" className="w-4 h-4" />
                </span>
              </div>
            </Link>
          )})}
        </div>
      )}
    </div>
  );
}
