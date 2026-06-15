import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { format } from "date-fns";
import { SimilarScholarships } from "@/components/scholarships/details/SimilarScholarships";
import Link from "next/link";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const scholarship = await prisma.scholarship.findUnique({ where: { slug } });
  
  if (!scholarship) return { title: "Not Found" };
  
  return {
    title: `${scholarship.title} | ScholarX`,
    description: scholarship.description,
  };
}

export default async function ScholarshipDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  const scholarship = await prisma.scholarship.findUnique({
    where: { slug }
  });

  if (!scholarship) {
    notFound();
  }

  // Increment view asynchronously
  prisma.scholarship.update({
    where: { id: scholarship.id },
    data: { viewCount: { increment: 1 } }
  }).catch(e => console.error(e));

  prisma.scholarshipAnalytics.create({
    data: { scholarshipId: scholarship.id, views: 1 }
  }).catch(e => console.error(e));

  const matchScore = 92; // Mock for now, should come from Eligibility Engine

  return (
    <div className="max-w-7xl mx-auto w-full space-y-8 pb-12 animate-in fade-in duration-500">
      
      {/* Back Link */}
      <Link href="/scholarships" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
        <Icon name="ArrowLeft" size={16} className="mr-2" /> Back to Explorer
      </Link>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 via-background to-background rounded-3xl p-8 sm:p-12 border border-primary/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Icon name="GraduationCap" className="w-[200px] h-[200px]" />
        </div>
        
        <div className="relative z-10 max-w-3xl">
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground shadow-sm">
              {scholarship.fundingType.replace(/_/g, " ")}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-muted text-muted-foreground border border-border">
              {scholarship.degreeLevel}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-green-500/10 text-green-600 border border-green-500/20">
              {matchScore}% Match
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold mb-4 leading-tight">
            {scholarship.title}
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Offered by <span className="font-semibold text-foreground">{scholarship.provider}</span> at <span className="font-semibold text-foreground">{scholarship.university || "Various Universities"}</span>
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <a href={scholarship.applicationLink} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="rounded-xl px-8 h-12 text-base font-semibold shadow-lg shadow-primary/20">
                Apply Now <Icon name="ExternalLink" size={16} className="ml-2" />
              </Button>
            </a>
            <Button size="lg" variant="outline" className="rounded-xl px-8 h-12 text-base">
              <Icon name="BookmarkPlus" size={16} className="mr-2" /> Save
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content & Sticky Sidebar */}
      <div className="flex flex-col lg:flex-row gap-12">
        
        {/* Left Column - Details */}
        <div className="flex-1 space-y-12">
          <section className="space-y-4">
            <h2 className="text-2xl font-heading font-semibold flex items-center">
              <Icon name="Info" className="mr-3 text-primary" /> Overview
            </h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
              <p>{scholarship.description}</p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-heading font-semibold flex items-center">
              <Icon name="Gift" className="mr-3 text-primary" /> Benefits
            </h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
              <p>{scholarship.benefits}</p>
              {scholarship.amountCovered && (
                <p className="font-semibold mt-4 text-foreground">Estimated Value: {scholarship.amountCovered}</p>
              )}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-heading font-semibold flex items-center">
              <Icon name="ShieldCheck" className="mr-3 text-primary" /> Eligibility
            </h2>
            <div className="bg-muted/30 rounded-2xl p-6 border border-border">
              <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground leading-relaxed mb-6">
                <p>{scholarship.eligibility}</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-background rounded-xl p-4 border border-border shadow-sm text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Min GPA</p>
                  <p className="font-bold text-lg">{scholarship.requiredGPA || "N/A"}</p>
                </div>
                <div className="bg-background rounded-xl p-4 border border-border shadow-sm text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">IELTS</p>
                  <p className="font-bold text-lg">{scholarship.requiredIELTS || "N/A"}</p>
                </div>
                <div className="bg-background rounded-xl p-4 border border-border shadow-sm text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">TOEFL</p>
                  <p className="font-bold text-lg">{scholarship.requiredTOEFL || "N/A"}</p>
                </div>
                <div className="bg-background rounded-xl p-4 border border-border shadow-sm text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">App Fee</p>
                  <p className="font-bold text-lg">{scholarship.applicationFee ? `$${scholarship.applicationFee}` : "Free"}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-heading font-semibold flex items-center">
              <Icon name="Files" className="mr-3 text-primary" /> Required Documents
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(scholarship.documentsRequired as string[]).map((doc, i) => (
                <li key={i} className="flex items-center p-3 rounded-lg bg-muted/50 border border-border">
                  <Icon name="Check" size={16} className="text-green-500 mr-3 shrink-0" />
                  <span className="text-sm font-medium">{doc}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Right Column - Sticky Sidebar */}
        <div className="w-full lg:w-80 flex-none space-y-6">
          <div className="sticky top-24 space-y-6">
            
            <div className="bg-background rounded-2xl p-6 border border-border shadow-sm">
              <h3 className="font-semibold text-lg mb-6 flex items-center">
                <Icon name="Calendar" className="mr-2 text-primary" /> Important Dates
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-border">
                  <span className="text-muted-foreground text-sm">Deadline</span>
                  <span className="font-bold">
                    {scholarship.deadline ? format(new Date(scholarship.deadline), "MMMM d, yyyy") : "Varies"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">Status</span>
                  <span className="inline-flex items-center px-2 py-1 rounded bg-green-500/10 text-green-500 text-xs font-bold uppercase">
                    Open Now
                  </span>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <a href={scholarship.applicationLink} target="_blank" rel="noopener noreferrer" className="block w-full">
                  <Button className="w-full h-12 text-base font-semibold">
                    Apply on Provider Site
                  </Button>
                </a>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 h-12">
                    <Icon name="BookmarkPlus" size={16} className="mr-2" /> Save
                  </Button>
                  <Button variant="outline" className="flex-1 h-12">
                    <Icon name="Share2" size={16} className="mr-2" /> Share
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-primary/5 rounded-2xl p-6 border border-primary/20">
              <h3 className="font-semibold text-lg mb-2 text-primary flex items-center">
                <Icon name="Sparkles" className="mr-2" /> AI Match Analysis
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Based on your profile, you are an excellent candidate for this scholarship. Your IELTS score is above the requirement.
              </p>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div className="bg-green-500 h-full" style={{ width: `${matchScore}%` }} />
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Similar Scholarships Section */}
      <div className="pt-12 border-t border-border mt-16">
        <h2 className="text-2xl font-heading font-semibold mb-8">Similar Scholarships</h2>
        <SimilarScholarships scholarshipId={scholarship.id} />
      </div>

    </div>
  );
}
