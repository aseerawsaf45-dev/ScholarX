import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  documentUploader: f({ 
    pdf: { maxFileSize: "8MB" },
    image: { maxFileSize: "4MB" },
    text: { maxFileSize: "4MB" } // For docx/txt
  })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for url:", file.url);
      
      // We will handle the document parsing in a separate API route or background job 
      // when the user triggers the document analysis, but we can also do it here.
      // For now we just return the URL.
      return { url: file.url, name: file.name };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
