"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";

type ChecklistItem = {
  id: string;
  label: string;
  checked: boolean;
};

const initialItems: ChecklistItem[] = [
  { id: "cv", label: "CV / Resume", checked: false },
  { id: "sop", label: "Statement of Purpose", checked: false },
  { id: "transcript", label: "Academic Transcript", checked: false },
  { id: "recommendation", label: "Recommendation Letter", checked: false },
  { id: "english", label: "English Test Score", checked: false },
];

export default function DocumentsPage() {
  const [items, setItems] = useState(initialItems);

  const toggleItem = (id: string) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)));
  };

  const completedCount = items.filter((item) => item.checked).length;
  const progress = items.length === 0 ? 0 : Math.round((completedCount / items.length) * 100);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Document Checklist</h1>
        <p className="mt-1 text-muted-foreground">
          Track the documents you need for your applications.
        </p>
      </div>

      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Mandatory documents for all scholarship programs</h2>
            <p className="mt-1 text-sm text-muted-foreground">Check or uncheck items as you prepare them.</p>
          </div>
          <span className="text-sm font-semibold text-primary">{progress}%</span>
        </div>

        <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className={`flex items-start space-x-3 rounded-2xl p-2 transition-colors ${item.checked ? "opacity-60" : "hover:bg-muted/50"}`}
            >
              <Checkbox
                id={item.id}
                checked={item.checked}
                onCheckedChange={() => toggleItem(item.id)}
                className="mt-0.5"
              />
              <div className="grid min-w-0 flex-1 gap-1.5 leading-none">
                <label
                  htmlFor={item.id}
                  className={`cursor-pointer text-sm font-medium leading-tight ${item.checked ? "line-through text-muted-foreground" : "text-foreground"}`}
                >
                  {item.label}
                </label>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
