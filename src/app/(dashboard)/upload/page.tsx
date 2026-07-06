"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState("PDF");
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!file) {
      setMessage("Please choose a file first.");
      return;
    }

    setIsUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", name || file.name);
    formData.append("type", type);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed.");
      }

      setMessage("Upload complete. Redirecting to your documents...");
      router.push("/documents");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Upload a document</h1>
          <p className="text-muted-foreground mt-1">
            Add a CV, statement of purpose, or other application file to your profile.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/documents">Back to documents</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Document details</CardTitle>
          <CardDescription>Choose a file and give it a short name before uploading.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">Document name</label>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="My CV"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Document type</label>
              <select
                value={type}
                onChange={(event) => setType(event.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="PDF">PDF</option>
                <option value="CV">CV</option>
                <option value="Statement of Purpose">Statement of Purpose</option>
                <option value="Transcript">Transcript</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Choose file</label>
              <input
                type="file"
                onChange={(event) => setFile(event.target.files?.[0] || null)}
                className="w-full rounded-xl border border-dashed border-border bg-muted/30 px-3 py-6 text-sm"
              />
            </div>

            <Button type="submit" disabled={isUploading} className="flex items-center gap-2">
              <Icon name="Upload" className="h-4 w-4" />
              {isUploading ? "Uploading..." : "Upload document"}
            </Button>

            {message ? (
              <p className="text-sm text-muted-foreground">{message}</p>
            ) : null}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
