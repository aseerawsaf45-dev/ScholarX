import prisma from './prisma';
import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
const MODEL = "BAAI/bge-large-en-v1.5";

async function getQueryEmbedding(text: string): Promise<number[]> {
  try {
    if (!process.env.HUGGINGFACE_API_KEY) {
      // Return mock embedding if no key is provided
      return Array.from({ length: 1536 }, () => Math.random() * 2 - 1);
    }
    const result = await hf.featureExtraction({
      model: MODEL,
      inputs: text,
    });
    let vector = result as number[];
    if (vector.length < 1536) {
      const padded = new Array(1536).fill(0);
      for(let i=0; i<vector.length; i++) padded[i] = vector[i];
      vector = padded;
    }
    return vector;
  } catch (error) {
    console.error("Error generating query embedding:", error);
    return Array.from({ length: 1536 }, () => Math.random() * 2 - 1);
  }
}

export type SimilaritySearchParams = {
  query: string;
  filters?: {
    country?: string | null;
    degree?: string | null;
  };
  topK?: number;
};

export async function similaritySearch({ query, filters, topK = 10 }: SimilaritySearchParams) {
  const embedding = await getQueryEmbedding(query);

  let countryFilter = filters?.country ? `%${filters.country}%` : null;
  let degreeFilter = filters?.degree ? filters.degree.toUpperCase() : null;

  // We use `1 - (embedding <=> vector)` to convert cosine distance to cosine similarity
  // Note: the `embedding` column must not be NULL for the distance calculation to work. 
  // We'll filter out rows where embedding is NULL.
  const scholarships = await prisma.$queryRaw`
    SELECT id, title, provider, country, "degreeLevel", "fundingType", 
           1 - (embedding <=> ${embedding}::vector) as similarity
    FROM "Scholarship"
    WHERE 
      embedding IS NOT NULL
      AND (${countryFilter}::text IS NULL OR country ILIKE ${countryFilter})
      AND (${degreeFilter}::text IS NULL OR "degreeLevel"::text = ${degreeFilter})
    ORDER BY embedding <=> ${embedding}::vector
    LIMIT ${topK}
  `;

  return scholarships;
}
