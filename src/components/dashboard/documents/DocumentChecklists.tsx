"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Checkbox } from "@/components/ui/checkbox";

interface Scholarship {
  id: string;
  title: string;
  provider: string;
}

interface DocumentChecklistsProps {
  savedScholarships: { scholarship: Scholarship }[];
}

export function DocumentChecklists({ savedScholarships }: DocumentChecklistsProps) {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const saved = localStorage.getItem("document_checklist_state");
    if (saved) {
      try {
        setCheckedItems(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const handleToggle = (key: string, checked: boolean) => {
    const updated = { ...checkedItems, [key]: checked };
    setCheckedItems(updated);
    localStorage.setItem("document_checklist_state", JSON.stringify(updated));
  };

  const mandatoryDocs = [
    { id: "passport", title: "Valid Passport", desc: "Must be valid for at least 1-2 years from target intake." },
    { id: "transcripts", title: "Official Transcripts & Certificates", desc: "Certified copies of high school/university records." },
    { id: "english", title: "English Language Proficiency Certificate", desc: "Official IELTS, TOEFL, or Duolingo score card." },
    { id: "cv", title: "Curriculum Vitae (CV) / Resume", desc: "EuroPass or standard academic format resume." },
    { id: "sop", title: "Statement of Purpose (SOP)", desc: "A compelling essay explaining your academic goals and why this scholarship." },
    { id: "recommendation", title: "Recommendation Letters (2-3)", desc: "From academic professors or work supervisors." }
  ];

  const getSpecificRequirements = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes("erasmus")) {
      return [
        { id: "europass_cv", title: "Europass CV Format", desc: "CV must comply strictly with the Europass template." },
        { id: "proof_residence", title: "Proof of Residence", desc: "A certificate verifying you live outside the EU (e.g. municipality certificate)." },
        { id: "motivation_letter", title: "Erasmus Motivation Letter", desc: "Tailored motivation letter addressing the joint consortium." }
      ];
    }
    if (t.includes("fulbright")) {
      return [
        { id: "study_objectives", title: "Study Objectives Essay", desc: "Detailed proposal explaining what you plan to study/research." },
        { id: "personal_statement", title: "Personal Statement Essay", desc: "A narrative essay detailing your personal growth and motivation." },
        { id: "rec_letters_3", title: "3 Reference Letters", desc: "Three professional/academic reference letters." }
      ];
    }
    if (t.includes("eiffel")) {
      return [
        { id: "career_project", title: "Career Project Outline", desc: "A 1-2 page essay on your professional goals post-study." },
        { id: "grading_scale", title: "University Grading Scale", desc: "An official explanation of your university's GPA system." }
      ];
    }
    return [
      { id: "study_plan", title: "Study Plan / Research Proposal", desc: "Required for post-graduate applications describing your objectives." },
      { id: "financial_proof", title: "Financial Capability / Income Proof", desc: "Proof of family income or sponsor funds." }
    ];
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
      
      {/* Left: Mandatory Checklist */}
      <Card className="border border-border/80 bg-card/50 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Icon name="ShieldCheck" className="text-primary" size={20} />
            Mandatory Documents (All Scholarships)
          </CardTitle>
          <CardDescription>
            These core documents are required for almost every international scholarship program.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mandatoryDocs.map((doc) => {
            const key = `mandatory_${doc.id}`;
            return (
              <div key={doc.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                <Checkbox 
                  id={key} 
                  checked={!!checkedItems[key]} 
                  onCheckedChange={(checked) => handleToggle(key, !!checked)}
                  className="mt-1"
                />
                <div className="grid gap-1.5 leading-none">
                  <label htmlFor={key} className={`text-sm font-semibold cursor-pointer ${checkedItems[key] ? "line-through text-muted-foreground" : "text-foreground"}`}>
                    {doc.title}
                  </label>
                  <p className="text-xs text-muted-foreground">{doc.desc}</p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Right: Scholarship-Specific Checklists */}
      <Card className="border border-border/80 bg-card/50 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Icon name="GraduationCap" className="text-primary" size={20} />
            Scholarship-Specific Checklists
          </CardTitle>
          <CardDescription>
            Additional required documents based on your saved scholarships.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {savedScholarships.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              <Icon name="Bookmark" className="mx-auto mb-2 opacity-50" size={24} />
              Save scholarships in the Explorer to see their specific document checklists here.
            </div>
          ) : (
            savedScholarships.map(({ scholarship }) => {
              const reqs = getSpecificRequirements(scholarship.title);
              return (
                <div key={scholarship.id} className="space-y-3 pb-4 border-b border-border/40 last:border-0 last:pb-0">
                  <h4 className="text-sm font-bold text-primary flex items-center gap-1.5">
                    <Icon name="ChevronRight" size={14} />
                    {scholarship.title}
                  </h4>
                  <div className="space-y-3 pl-4">
                    {reqs.map((req) => {
                      const key = `spec_${scholarship.id}_${req.id}`;
                      return (
                        <div key={req.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/20 transition-colors">
                          <Checkbox 
                            id={key} 
                            checked={!!checkedItems[key]} 
                            onCheckedChange={(checked) => handleToggle(key, !!checked)}
                            className="mt-0.5"
                          />
                          <div className="grid gap-1 leading-none">
                            <label htmlFor={key} className={`text-xs font-semibold cursor-pointer ${checkedItems[key] ? "line-through text-muted-foreground" : "text-foreground"}`}>
                              {req.title}
                            </label>
                            <p className="text-[11px] text-muted-foreground">{req.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
