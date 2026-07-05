import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { ScoreDashboard } from "@/components/dashboard/documents/ScoreDashboard";
import { FeedbackPanel } from "@/components/dashboard/documents/FeedbackPanel";
import { RewriteViewer } from "@/components/dashboard/documents/RewriteViewer";
import { ReadinessBadge } from "@/components/dashboard/documents/ReadinessBadge";

export default async function DocumentReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { id } = await params;
  const document = await prisma.document.findUnique({
    where: {
      id,
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
  });

  if (!document) {
    redirect("/documents");
  }

  const review = document.reviews[0];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link 
            href="/documents" 
            className="text-slate-400 hover:text-slate-200 flex items-center gap-2 mb-2 text-sm transition-colors"
          >
            <Icon name="ArrowLeft" className="w-4 h-4" />
            Back to Documents
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-100">{document.name}</h1>
            {review && <ReadinessBadge status={review.scholarshipReadiness as any} />}
          </div>
          <p className="text-slate-400 mt-1">
            {document.type} • Uploaded on {document.createdAt.toLocaleDateString()}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <a
            href={document.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
          >
            <Icon name="ExternalLink" className="w-4 h-4" />
            View Original File
          </a>
        </div>
      </div>

      {!review ? (
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-primary-500/10 text-primary-500 rounded-full flex items-center justify-center mb-4">
            <Icon name="Loader" className="w-8 h-8 animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-slate-100 mb-2">Review in Progress</h2>
          <p className="text-slate-400 max-w-md">
            Our AI is currently analyzing your document. This usually takes less than a minute. Check back soon!
          </p>
        </div>
      ) : (
        <>
          {/* Score Dashboard */}
          <ScoreDashboard 
            overallScore={review.overallScore} 
            categoryScores={{
              clarity: review.clarityScore,
              grammar: review.grammarScore,
              structure: review.structureScore,
              impact: review.impactScore,
              relevance: review.relevanceScore,
            }} 
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Feedback & Suggestions */}
            <div>
              <h2 className="text-xl font-semibold text-slate-100 mb-4 flex items-center gap-2">
                <Icon name="MessageSquare" className="w-5 h-5 text-primary-500" />
                AI Analysis
              </h2>
              {(() => {
                const evalJson = typeof review.feedbackJson === 'object' && review.feedbackJson !== null 
                  ? (review.feedbackJson as any) 
                  : {};
                return (
                  <FeedbackPanel 
                    feedback={evalJson.summary || ""}
                    grammarIssues={evalJson.majorIssues || []}
                    contentSuggestions={evalJson.improvements || []}
                  />
                );
              })()}
            </div>

            {/* AI Rewrite Suggestions */}
            <div>
              <h2 className="text-xl font-semibold text-slate-100 mb-4 flex items-center gap-2">
                <Icon name="Wand" className="w-5 h-5 text-purple-500" />
                Enhanced Version
              </h2>
              <RewriteViewer 
                originalText={null}
                improvedText={review.rewrittenText}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
