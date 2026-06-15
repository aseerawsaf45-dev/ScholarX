import "dotenv/config";
import { FundingType, DegreeLevel } from "@prisma/client";
import { faker } from "@faker-js/faker";
import prisma from "../src/lib/prisma";

const COUNTRIES = [
  "Germany", "Canada", "USA", "UK", "Australia", 
  "Sweden", "Netherlands", "Japan", "South Korea", "China"
];

const FIELDS_OF_STUDY = [
  "Computer Science", "Engineering", "Business", "Medicine", 
  "Architecture", "Arts", "Data Science", "Law", "Public Health", "Environmental Science"
];

const PROVIDERS = [
  "Government", "University", "Private Foundation", "Corporate", "International Organization"
];

const UNIVERSITIES = [
  "Technical University of Munich", "University of Toronto", "MIT", "Oxford University", 
  "University of Melbourne", "KTH Royal Institute of Technology", "Delft University of Technology", 
  "University of Tokyo", "Seoul National University", "Tsinghua University",
  "Stanford University", "Cambridge University", "ETH Zurich", "National University of Singapore"
];

async function main() {
  console.log("Cleaning up existing scholarships...");
  await prisma.savedScholarship.deleteMany();
  await prisma.scholarshipAnalytics.deleteMany();
  await prisma.scholarshipMatch.deleteMany();
  await prisma.document.deleteMany(); // Since document might relation to scholarship
  await prisma.scholarship.deleteMany();

  console.log("Seeding 1000+ scholarships...");

  const batchSize = 100;
  const total = 1000;

  for (let i = 0; i < total; i += batchSize) {
    const scholarships = Array.from({ length: batchSize }).map(() => {
      const country = faker.helpers.arrayElement(COUNTRIES);
      const degreeLevel = faker.helpers.enumValue(DegreeLevel);
      const fundingType = faker.helpers.enumValue(FundingType);
      
      const university = faker.helpers.arrayElement(UNIVERSITIES);
      const provider = faker.helpers.arrayElement(PROVIDERS);
      const title = `${university} ${faker.helpers.arrayElement(["Excellence", "Merit", "Global", "Future Leaders", "Innovation"])} Scholarship 2027`;

      const fields = faker.helpers.arrayElements(FIELDS_OF_STUDY, faker.number.int({ min: 1, max: 4 }));
      
      const deadline = faker.date.future({ years: 2 });
      
      return {
        slug: faker.helpers.slugify(`${title} ${faker.string.uuid()}`).toLowerCase(),
        title,
        provider,
        country,
        city: faker.location.city(),
        university,
        degreeLevel,
        fundingType,
        amountCovered: fundingType === "FULLY_FUNDED" ? "Full Tuition + Stipend" : `$${faker.number.int({ min: 5000, max: 50000 })}`,
        description: `This is a prestigious scholarship provided by ${provider} at ${university}. It aims to support outstanding students pursuing a ${degreeLevel} degree in ${fields.join(", ")}.`,
        eligibility: `Applicants must have a strong academic record. Minimum GPA required is ${faker.number.float({ min: 3.0, max: 4.0, fractionDigits: 1 })}.`,
        benefits: `Covers tuition fees, travel allowance, and a monthly stipend.`,
        requiredGPA: faker.number.float({ min: 2.5, max: 4.0, fractionDigits: 1 }),
        requiredIELTS: faker.helpers.arrayElement([6.0, 6.5, 7.0, 7.5, 8.0, null]),
        requiredTOEFL: faker.helpers.arrayElement([80, 90, 100, 110, null]),
        applicationFee: faker.helpers.arrayElement([0, 50, 100]),
        applicationLink: faker.internet.url(),
        deadline,
        documentsRequired: ["Transcript", "Statement of Purpose", "Recommendation Letters", "Passport Copy"],
        fieldsOfStudy: fields,
        tags: ["International", degreeLevel, country],
        isActive: true,
        viewCount: faker.number.int({ min: 0, max: 5000 }),
        saveCount: faker.number.int({ min: 0, max: 1000 }),
      };
    });

    await prisma.scholarship.createMany({
      data: scholarships
    });

    console.log(`Seeded ${i + batchSize} scholarships`);
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
