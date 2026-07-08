import "dotenv/config";
import prisma from "../src/lib/prisma";
import { HfInference } from "@huggingface/inference";

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
const MODEL = "BAAI/bge-large-en-v1.5";

// Your database currently uses vector(1536), so we pad the
// 1024-dimensional BGE embeddings to 1536.
async function getEmbedding(text: string): Promise<number[]> {
  try {
    if (!process.env.HUGGINGFACE_API_KEY) {
      console.warn("No HUGGINGFACE_API_KEY found, generating mock embedding...");
      return Array.from({ length: 1536 }, () => Math.random() * 2 - 1);
    }

    const result = await hf.featureExtraction({
      model: MODEL,
      inputs: text,
    });

    let vector = result as number[];

    if (vector.length < 1536) {
      vector = [
        ...vector,
        ...new Array(1536 - vector.length).fill(0),
      ];
    } else if (vector.length > 1536) {
      vector = vector.slice(0, 1536);
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
    },
  });

  console.log(`Found ${scholarships.length} scholarships.`);

  let count = 0;

  for (const scholarship of scholarships) {
    try {
      const textToEmbed = `
Scholarship: ${scholarship.title}
Provider: ${scholarship.provider}
Country: ${scholarship.country}
Description: ${scholarship.description ?? ""}
Eligibility: ${scholarship.eligibility ?? ""}
      `.trim();

      const embedding = await getEmbedding(textToEmbed);

      await prisma.$executeRaw`
        UPDATE "Scholarship"
        SET embedding = ${embedding}::vector
        WHERE id = ${scholarship.id}
      `;

      count++;

      if (count % 10 === 0 || count === scholarships.length) {
        console.log(`Embedded ${count}/${scholarships.length}`);
      }

      // Avoid Hugging Face free-tier rate limits
      if (process.env.HUGGINGFACE_API_KEY) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    } catch (err) {
      console.error(`Failed to embed scholarship ${scholarship.id}:`, err);
    }
  }

  console.log("Embedding generation complete.");

  const stats = await prisma.$queryRaw<
    { total: bigint; embedded: bigint }[]
  >`
    SELECT
      COUNT(*) AS total,
      COUNT(embedding) AS embedded
    FROM "Scholarship";
  `;

  console.log(stats);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });