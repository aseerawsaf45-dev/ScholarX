import mammoth from 'mammoth';
import Tesseract from 'tesseract.js';

export function preprocessText(text: string): string {
  // Normalize text: Remove headers/footers (naive), fix spacing, remove noise
  let cleaned = text.replace(/\\r\\n/g, '\\n');
  cleaned = cleaned.replace(/\\n{3,}/g, '\\n\\n'); // Fix spacing
  cleaned = cleaned.replace(/[\x00-\x09\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, ''); // Remove control characters/noise
  
  // Basic naive header/footer removal by ignoring lines that look like page numbers
  cleaned = cleaned.split('\\n')
    .filter(line => !/^\\s*(Page )?\\d+\\s*$/i.test(line))
    .join('\\n');

  return cleaned.trim();
}

export async function parseDocumentFromUrl(url: string, fileType: string): Promise<{ extractedText: string, pageCount?: number }> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch document: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const type = fileType.toLowerCase();

    let rawText = "";
    let pageCount = undefined;

    if (type.includes('pdf')) {
      const pdfParse = require('pdf-parse');
      const data = await pdfParse(buffer);
      rawText = data.text;
      pageCount = data.numpages;
    } 
    else if (type.includes('word') || type.includes('docx') || type.includes('document')) {
      const result = await mammoth.extractRawText({ buffer });
      rawText = result.value;
    } 
    else if (type.includes('image') || type.includes('png') || type.includes('jpeg') || type.includes('jpg')) {
      const result = await Tesseract.recognize(buffer, 'eng');
      rawText = result.data.text;
    } else {
      rawText = buffer.toString('utf-8');
    }

    return { 
      extractedText: preprocessText(rawText),
      pageCount 
    };

  } catch (error) {
    console.error("Document parsing error:", error);
    throw new Error("Failed to parse document content.");
  }
}
