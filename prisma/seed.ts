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

const SAMPLE_SCHOLARSHIPS = [
  {
    slug: "mext-japan",
    title: "MEXT Scholarship 2027",
    provider: "Government of Japan",
    country: "Japan",
    city: "Tokyo",
    university: "All National Japanese Universities",
    degreeLevel: DegreeLevel.MASTERS,
    fundingType: FundingType.FULLY_FUNDED,
    amountCovered: "Full Tuition, Monthly Stipend, Airfare, Accommodation Support",
    description: "Prestigious fully funded scholarship by the Japanese Government for undergraduate and postgraduate studies.",
    eligibility: "GPA 3.0+ required. Usually no language test required if educated in English. Age under 25 for UG, under 35 for Masters/PhD.",
    benefits: "Full tuition coverage, free accommodation, monthly living stipend, and round-trip flight tickets.",
    requiredGPA: 3.0,
    requiredIELTS: null,
    requiredTOEFL: null,
    applicationFee: 0,
    applicationLink: "https://www.studyinjapan.go.jp/",
    deadline: new Date("2027-05-30"),
    documentsRequired: ["Application Form", "Field of Study and Research Plan", "Academic Transcript", "Recommendation Letter"],
    fieldsOfStudy: ["All Fields", "Engineering", "Science", "Humanities", "Arts"],
    tags: ["MEXT", "Japan", "Fully Funded", "Government"],
    isActive: true,
  },
  {
    slug: "daad-germany",
    title: "DAAD Scholarships 2027",
    provider: "Government of Germany",
    country: "Germany",
    city: "Bonn",
    university: "All State-Recognized German Universities",
    degreeLevel: DegreeLevel.MASTERS,
    fundingType: FundingType.FULLY_FUNDED,
    amountCovered: "Tuition waiver, Monthly Stipend, Insurance, Travel Allowance",
    description: "Scholarships for postgraduate courses with relevance to developing countries.",
    eligibility: "GPA 2.8+ required. English proficiency depends on program. Often requires 2 years of work experience.",
    benefits: "Tuition support, monthly stipend, health insurance, and travel allowance.",
    requiredGPA: 2.8,
    requiredIELTS: 6.5,
    requiredTOEFL: 80,
    applicationFee: 0,
    applicationLink: "https://www.daad.de/en/",
    deadline: new Date("2027-08-31"),
    documentsRequired: ["DAAD Application Form", "Hand-signed CV (Europass)", "Hand-signed Letter of Motivation", "Academic Letter of Recommendation"],
    fieldsOfStudy: ["Development Fields", "Engineering", "Business", "Public Health", "Environmental Science"],
    tags: ["DAAD", "Germany", "Fully Funded", "Masters", "PhD"],
    isActive: true,
  },
  {
    slug: "chevening-uk",
    title: "Chevening Scholarship 2027",
    provider: "Government of the United Kingdom",
    country: "UK",
    city: "London",
    university: "All UK Universities",
    degreeLevel: DegreeLevel.MASTERS,
    fundingType: FundingType.FULLY_FUNDED,
    amountCovered: "Full Tuition Fees, Monthly Living Allowance, Return Flights, Arrival Grant",
    description: "The UK Government's global scholarship programme, funded by the Foreign, Commonwealth & Development Office.",
    eligibility: "Bachelor's degree required. English proficiency required. Must have at least 2 years of work experience.",
    benefits: "Full tuition fee coverage, living allowance, return economy flights, and visa fees.",
    requiredGPA: 3.0,
    requiredIELTS: 6.5,
    requiredTOEFL: 79,
    applicationFee: 0,
    applicationLink: "https://www.chevening.org/",
    deadline: new Date("2027-11-05"),
    documentsRequired: ["Two References", "SOP / Four Essays", "Passport Copy", "Biography"],
    fieldsOfStudy: ["All Fields", "Law", "Business", "Public Health", "Engineering"],
    tags: ["Chevening", "UK", "Fully Funded", "Masters"],
    isActive: true,
  },
  {
    slug: "erasmus-mundus-europe",
    title: "Erasmus Mundus Joint Master Degrees 2027",
    provider: "European Union",
    country: "Sweden",
    city: "Brussels",
    university: "Consortium of European Universities",
    degreeLevel: DegreeLevel.MASTERS,
    fundingType: FundingType.FULLY_FUNDED,
    amountCovered: "Full Tuition, Monthly Stipend, Travel & Installation costs",
    description: "Prestigious, integrated, international study programme, jointly delivered by an international consortium of HEIs.",
    eligibility: "Good academic record. Usually yes to IELTS. Open to students worldwide.",
    benefits: "Full tuition coverage, monthly stipend of 1,400 EUR, travel and installation grant.",
    requiredGPA: 3.0,
    requiredIELTS: 6.5,
    requiredTOEFL: 90,
    applicationFee: 0,
    applicationLink: "https://erasmus-plus.ec.europa.eu/",
    deadline: new Date("2027-02-15"),
    documentsRequired: ["CV (Europass)", "Motivation Letter", "Recommendation Letters", "Bachelor Diploma"],
    fieldsOfStudy: ["All Fields", "Science", "Humanities", "Data Science", "Engineering"],
    tags: ["Erasmus", "Europe", "Fully Funded", "Masters"],
    isActive: true,
  },
  {
    slug: "fulbright-usa",
    title: "Fulbright Foreign Student Program 2027",
    provider: "Government of the United States",
    country: "USA",
    city: "Washington DC",
    university: "All US Universities",
    degreeLevel: DegreeLevel.MASTERS,
    fundingType: FundingType.FULLY_FUNDED,
    amountCovered: "Full Tuition, Monthly Stipend, Health Insurance, Airfare",
    description: "Fully funded scholarship for international students to pursue Master's or PhD degrees in the USA.",
    eligibility: "Bachelor's degree required. English proficiency (TOEFL/IELTS) required. Work experience preferred.",
    benefits: "Tuition, monthly living stipend, health insurance, and round-trip flight tickets.",
    requiredGPA: 3.2,
    requiredIELTS: 7.0,
    requiredTOEFL: 90,
    applicationFee: 0,
    applicationLink: "https://foreign.fulbrightonline.org/",
    deadline: new Date("2027-06-01"),
    documentsRequired: ["Three Recommendation Letters", "Study Objectives Essay", "Personal Statement", "Transcripts"],
    fieldsOfStudy: ["All Fields", "Engineering", "Business", "Medicine", "Arts"],
    tags: ["Fulbright", "USA", "Fully Funded", "Masters", "PhD"],
    isActive: true,
  },
  {
    slug: "turkiye-burslari",
    title: "Türkiye Bursları Scholarship 2027",
    provider: "Government of Türkiye",
    country: "Türkiye",
    city: "Ankara",
    university: "All Turkish Universities",
    degreeLevel: DegreeLevel.MASTERS,
    fundingType: FundingType.FULLY_FUNDED,
    amountCovered: "Full Tuition, Accommodation, Monthly Stipend, Turkish Language Course, Flight Tickets",
    description: "A government-funded, competitive scholarship program awarded to outstanding students.",
    eligibility: "Good GPA (75% for Master's, 70% for Bachelor's). Usually no IELTS needed.",
    benefits: "University placement, tuition, accommodation, health insurance, 1-year language course, monthly stipend, flights.",
    requiredGPA: 3.0,
    requiredIELTS: null,
    requiredTOEFL: null,
    applicationFee: 0,
    applicationLink: "https://www.turkiyeburslari.gov.tr/",
    deadline: new Date("2027-02-20"),
    documentsRequired: ["Identity Document", "Academic Transcript", "SOP", "Recommendation Letter"],
    fieldsOfStudy: ["All Fields", "Engineering", "Business", "Medicine", "Arts"],
    tags: ["Türkiye", "Fully Funded", "Masters", "PhD"],
    isActive: true,
  },
  {
    slug: "csc-china",
    title: "Chinese Government Scholarship (CSC) 2027",
    provider: "Government of China",
    country: "China",
    city: "Beijing",
    university: "All Top Chinese Universities",
    degreeLevel: DegreeLevel.MASTERS,
    fundingType: FundingType.FULLY_FUNDED,
    amountCovered: "Full Tuition, Accommodation, Monthly Stipend, Medical Insurance",
    description: "Fully funded scholarship for international students sponsored by the Ministry of Education of China.",
    eligibility: "Good GPA. Often no IELTS required if studying in Chinese or English taught with certificate.",
    benefits: "Tuition waiver, free on-campus accommodation, comprehensive medical insurance, monthly stipend.",
    requiredGPA: 3.0,
    requiredIELTS: null,
    requiredTOEFL: null,
    applicationFee: 100,
    applicationLink: "https://www.campuschina.org/",
    deadline: new Date("2027-04-15"),
    documentsRequired: ["CSC Application Form", "Highest Diploma", "Study Plan", "Two Recommendation Letters"],
    fieldsOfStudy: ["All Fields", "Engineering", "Computer Science", "Business", "Science"],
    tags: ["CSC", "China", "Fully Funded", "Government"],
    isActive: true,
  },
  {
    slug: "gks-south-korea",
    title: "Global Korea Scholarship (GKS) 2027",
    provider: "Government of South Korea",
    country: "South Korea",
    city: "Seoul",
    university: "Participating Korean Universities",
    degreeLevel: DegreeLevel.MASTERS,
    fundingType: FundingType.FULLY_FUNDED,
    amountCovered: "Full Tuition, Airfare, Monthly Stipend, Language Course",
    description: "Designed to provide international students with opportunities to conduct advanced studies in Korea.",
    eligibility: "Good GPA (above 80% percentile). No IELTS required but yields bonus points. Age limit applies.",
    benefits: "Tuition fees, economy flights, monthly stipend, research allowance, medical insurance, language course.",
    requiredGPA: 3.2,
    requiredIELTS: null,
    requiredTOEFL: null,
    applicationFee: 0,
    applicationLink: "https://www.studyinkorea.go.kr/",
    deadline: new Date("2027-03-10"),
    documentsRequired: ["GKS Application Form", "Personal Statement", "Study Plan", "Recommendation Letter"],
    fieldsOfStudy: ["All Fields", "Engineering", "Data Science", "Business", "Arts"],
    tags: ["GKS", "Korea", "Fully Funded", "Masters"],
    isActive: true,
  },
  {
    slug: "australia-awards",
    title: "Australia Awards Scholarships 2027",
    provider: "Government of Australia",
    country: "Australia",
    city: "Canberra",
    university: "All Participating Australian Universities",
    degreeLevel: DegreeLevel.MASTERS,
    fundingType: FundingType.FULLY_FUNDED,
    amountCovered: "Full Tuition Fees, Return Air Travel, Establishment Allowance, Living Contribution",
    description: "Long-term development awards administered by the Department of Foreign Affairs and Trade.",
    eligibility: "Bachelor's degree required. IELTS 6.5+ required. 2 years of work experience required.",
    benefits: "Full tuition, establishment allowance, living expenses contribution (CLE), health cover.",
    requiredGPA: 3.0,
    requiredIELTS: 6.5,
    requiredTOEFL: 84,
    applicationFee: 0,
    applicationLink: "https://www.dfat.gov.au/",
    deadline: new Date("2027-04-30"),
    documentsRequired: ["Academic Transcripts", "Proof of Citizenship", "CV / Employment History", "Referee Reports"],
    fieldsOfStudy: ["Development Fields", "Public Health", "Environmental Science", "Law"],
    tags: ["Australia", "Fully Funded", "Masters"],
    isActive: true,
  },
  {
    slug: "commonwealth-uk",
    title: "Commonwealth Scholarship 2027",
    provider: "Commonwealth Scholarship Commission",
    country: "UK",
    city: "London",
    university: "All Participating UK Universities",
    degreeLevel: DegreeLevel.MASTERS,
    fundingType: FundingType.FULLY_FUNDED,
    amountCovered: "Full Tuition Fees, Monthly Stipend, Return Flights, Warm Clothing Allowance",
    description: "Fully funded awards for students from eligible Commonwealth countries for postgraduate studies.",
    eligibility: "Bachelor's degree required. IELTS required. Sometimes work experience is preferred.",
    benefits: "Tuition, monthly stipend, flights, study travel grant, thesis grant.",
    requiredGPA: 3.3,
    requiredIELTS: 6.5,
    requiredTOEFL: 90,
    applicationFee: 0,
    applicationLink: "https://cscuk.fcdo.gov.uk/",
    deadline: new Date("2027-10-15"),
    documentsRequired: ["References", "Admission Letter", "SOP Essay", "Personal Details"],
    fieldsOfStudy: ["Development Fields", "Engineering", "Public Health", "Science"],
    tags: ["Commonwealth", "UK", "Fully Funded", "Masters"],
    isActive: true,
  },
  {
    slug: "swedish-institute",
    title: "Swedish Institute Scholarship (SISGP) 2027",
    provider: "Swedish Institute",
    country: "Sweden",
    city: "Stockholm",
    university: "All Swedish Universities",
    degreeLevel: DegreeLevel.MASTERS,
    fundingType: FundingType.FULLY_FUNDED,
    amountCovered: "Full Tuition, Living Allowance (10,000 SEK/mo), Travel Grant, Insurance",
    description: "Highly competitive scholarship for global professionals from selected countries.",
    eligibility: "Bachelor's degree. IELTS required. Leadership and professional experience preferred.",
    benefits: "Tuition waiver, monthly stipend, travel grant of 15,000 SEK, insurance, membership in SI Network.",
    requiredGPA: 3.0,
    requiredIELTS: 6.5,
    requiredTOEFL: 90,
    applicationFee: 900,
    applicationLink: "https://si.se/en/",
    deadline: new Date("2027-02-28"),
    documentsRequired: ["CV", "Proof of Work and Leadership Experience", "References", "Copy of Passport"],
    fieldsOfStudy: ["Selected Programs", "Data Science", "Engineering", "Business", "Environmental Science"],
    tags: ["SI", "Sweden", "Fully Funded", "Masters"],
    isActive: true,
  },
  {
    slug: "ireland-government",
    title: "Government of Ireland Postgraduate Scholarship 2027",
    provider: "Irish Research Council",
    country: "Ireland",
    city: "Dublin",
    university: "All Participating Higher Education Institutions in Ireland",
    degreeLevel: DegreeLevel.MASTERS,
    fundingType: FundingType.FULLY_FUNDED,
    amountCovered: "Full Tuition Fees, Stipend of 19,000 EUR/yr, Research Expenses",
    description: "An established national initiative funded by the Department of Further and Higher Education.",
    eligibility: "Strong academic record. IELTS required. Open to all disciplines.",
    benefits: "Stipend of 19,000 EUR per annum, tuition fees up to 5,750 EUR, research expenses of 3,250 EUR.",
    requiredGPA: 3.2,
    requiredIELTS: 6.5,
    requiredTOEFL: 90,
    applicationFee: 0,
    applicationLink: "https://research.ie/",
    deadline: new Date("2027-10-20"),
    documentsRequired: ["Research Proposal", "Two Academic References", "Transcripts", "Personal Statement"],
    fieldsOfStudy: ["All Fields", "Humanities", "Science", "Business", "Engineering"],
    tags: ["Ireland", "Fully Funded", "Masters", "PhD"],
    isActive: true,
  },
  {
    slug: "swiss-government",
    title: "Swiss Government Excellence Scholarships 2027",
    provider: "Swiss Confederation",
    country: "Switzerland",
    city: "Bern",
    university: "All Swiss Cantonal Universities and Federal Institutes",
    degreeLevel: DegreeLevel.PHD,
    fundingType: FundingType.FULLY_FUNDED,
    amountCovered: "Monthly Stipend, Tuition fees, Health Insurance, Airfare",
    description: "Scholarships for postgraduate researchers and PhD students in all academic fields.",
    eligibility: "Master's degree required. IELTS/TOEFL required. Research experience required.",
    benefits: "Monthly stipend of 1,920 CHF, health insurance, flights, and accommodation guidance.",
    requiredGPA: 3.5,
    requiredIELTS: 7.0,
    requiredTOEFL: 100,
    applicationFee: 0,
    applicationLink: "https://www.sbfi.admin.ch/",
    deadline: new Date("2027-12-01"),
    documentsRequired: ["Research Proposal", "Letter from Swiss Host Professor", "Two References", "Transcripts"],
    fieldsOfStudy: ["Research", "Engineering", "Science", "Medicine"],
    tags: ["Switzerland", "Fully Funded", "PhD", "Research"],
    isActive: true,
  },
  {
    slug: "gates-cambridge",
    title: "Gates Cambridge Scholarship 2027",
    provider: "Bill & Melinda Gates Foundation",
    country: "UK",
    city: "Cambridge",
    university: "University of Cambridge",
    degreeLevel: DegreeLevel.MASTERS,
    fundingType: FundingType.FULLY_FUNDED,
    amountCovered: "Full Cost of Study (Tuition, Maintenance, Travel, Discretionary Funds)",
    description: "Fully funded scholarships for outstanding applicants from countries outside the UK.",
    eligibility: "Excellent academic record. IELTS required. Evidence of leadership capacity.",
    benefits: "University composition fee, maintenance allowance of 18,744 GBP/yr, flights, and visa costs.",
    requiredGPA: 3.7,
    requiredIELTS: 7.5,
    requiredTOEFL: 110,
    applicationFee: 0,
    applicationLink: "https://www.gatescambridge.org/",
    deadline: new Date("2027-10-10"),
    documentsRequired: ["Gates Reference", "Research Proposal", "SOP Essay", "Academic Transcripts"],
    fieldsOfStudy: ["All Fields", "Engineering", "Science", "Humanities", "Business"],
    tags: ["Gates", "Cambridge", "Fully Funded", "Masters", "PhD"],
    isActive: true,
  },
  {
    slug: "rhodes-uk",
    title: "Rhodes Scholarship 2027",
    provider: "Rhodes Trust",
    country: "UK",
    city: "Oxford",
    university: "University of Oxford",
    degreeLevel: DegreeLevel.MASTERS,
    fundingType: FundingType.FULLY_FUNDED,
    amountCovered: "Full Tuition Fees, Living Stipend, Flights, Visa and Health Cover",
    description: "The oldest and perhaps most prestigious international scholarship program in the world.",
    eligibility: "Excellent academic record. IELTS required. Exceptional leadership. Age usually under 25.",
    benefits: "Oxford composition fees, stipend of 18,180 GBP/yr, return flights, health surcharge cover.",
    requiredGPA: 3.7,
    requiredIELTS: 7.5,
    requiredTOEFL: 110,
    applicationFee: 0,
    applicationLink: "https://www.rhodeshouse.ox.ac.uk/",
    deadline: new Date("2027-10-01"),
    documentsRequired: ["Five to Eight Reference Letters", "Personal Statement", "Academic CV", "Proof of Age"],
    fieldsOfStudy: ["All Fields", "Humanities", "Science", "Law", "Medicine"],
    tags: ["Rhodes", "Oxford", "Fully Funded", "Masters", "PhD"],
    isActive: true,
  }
];

async function main() {
  console.log("Cleaning up existing scholarships...");
  await prisma.savedScholarship.deleteMany();
  await prisma.scholarshipAnalytics.deleteMany();
  await prisma.scholarshipMatch.deleteMany();
  await prisma.document.deleteMany(); 
  await prisma.scholarship.deleteMany();

  console.log("Seeding sample scholarships...");
  await prisma.scholarship.createMany({
    data: SAMPLE_SCHOLARSHIPS as any
  });

  console.log("Seeding additional randomized scholarships...");

  const batchSize = 100;
  const total = 900;

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

    console.log(`Seeded ${i + batchSize} additional scholarships`);
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
