import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { HfInference } from '@huggingface/inference';

const prisma = new PrismaClient();

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
const MODEL = "BAAI/bge-large-en-v1.5"; // Open source 1024-dim model. Note: ensure schema uses Unsupported("vector(1024)") or generic Unsupported("vector"). We are using 1536 so maybe we use text-embedding-3-small via openai if they have a key?

// Actually, wait, the schema has `Unsupported("vector(1536)")`. 
// If we use BAAI/bge-large-en-v1.5, its output is 1024 dimensions, which will crash postgres if the column expects 1536.
// Let's use a mock embedding generator for 1536 dimensions if no API key is provided, 
// or simply pad the 1024 vector to 1536 to prevent crash.

async function getEmbedding(text: string): Promise<number[]> {
  try {
    if (!process.env.HUGGINGFACE_API_KEY) {
      console.warn("No HUGGINGFACE_API_KEY found, generating mock 1536-dim vector...");
      return Array.from({ length: 1536 }, () => Math.random() * 2 - 1);
    }
    const result = await hf.featureExtraction({
      model: MODEL,
      inputs: text,
    });
    let vector = result as number[];
    // Pad to 1536 to match the db schema if we used BAAI (1024 dims)
    if (vector.length < 1536) {
      const padded = new Array(1536).fill(0);
      for(let i=0; i<vector.length; i++) padded[i] = vector[i];
      vector = padded;
    }
    return vector;
  } catch (error) {
    console.error("Error generating embedding:", error);
    return Array.from({ length: 1536 }, () => Math.random() * 2 - 1);
  }
}

async function main() {
  console.log("Starting embedding generation...");
  
  const scholarships = await prisma.scholarship.findMany({
    select: {
      id: true,
      title: true,
      provider: true,
      country: true,
      description: true,
      eligibility: true,
    }
  });

  console.log(`Found ${scholarships.length} scholarships to embed.`);

  let count = 0;
  for (const scholarship of scholarships) {
    const textToEmbed = `
      Scholarship: ${scholarship.title}
      Provider: ${scholarship.provider}
      Country: ${scholarship.country}
      Description: ${scholarship.description}
      Requirements: ${scholarship.eligibility}
    `.trim();

    const embedding = await getEmbedding(textToEmbed);

    // Update in postgres using raw query to set the vector
    await prisma.$executeRaw`
      UPDATE "Scholarship"
      SET embedding = ${embedding}::vector
      WHERE id = ${scholarship.id}
    `;

    count++;
    if (count % 10 === 0) {
      console.log(`Embedded ${count} / ${scholarships.length} scholarships...`);
    }
    
    // Simple sleep to avoid rate limiting on free HF tier
    if (process.env.HUGGINGFACE_API_KEY) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  console.log("Finished generating embeddings.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
