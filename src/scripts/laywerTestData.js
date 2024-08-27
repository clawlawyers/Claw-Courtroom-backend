const { faker } = require('@faker-js/faker');
const { UserService } = require('../services');
const connectDB = require('../config/db-config');


const lawyerExpertiseSentences = [
    "Specialized in high-profile corporate litigation cases.",
    "Expertise in navigating complex family law matters with sensitivity.",
    "Seasoned criminal defense attorney with a focus on white-collar crime.",
    "Experienced in intellectual property disputes and patent litigation.",
    "Leading advocate for personal injury cases, ensuring fair compensation.",
    "Specializes in employment law, representing both employers and employees.",
    "Distinguished for expertise in real estate and property law.",
    "Proven track record in successfully handling immigration cases.",
    "Recognized authority in environmental law and regulatory compliance.",
    "Skilled in commercial and contract law, facilitating business transactions.",
    "Focused on medical malpractice cases with a commitment to patient rights.",
    "Renowned expert in entertainment law and intellectual property rights.",
    "Leading practitioner in estate planning and probate law.",
    "Experienced in handling complex civil rights and discrimination cases.",
    "Specialized in technology law, including data privacy and cybersecurity.",
    "Expert litigator in construction law and contractor disputes.",
    "Renowned for expertise in maritime and admiralty law.",
    "Distinguished for proficiency in tax law and IRS dispute resolution.",
    "Seasoned advocate for clients in bankruptcy and debt restructuring.",
    "Leading expert in international law, facilitating cross-border legal matters.",
    "Expertise in intellectual property law, protecting clients' creative assets.",
    "Distinguished for successful representation in insurance and coverage disputes.",
    "Specialized in employment discrimination cases, advocating for equal rights.",
    "Proven track record in successfully handling complex real estate transactions.",
    "Leading practitioner in health law, addressing medical ethics and regulations.",
    "Expertise in cybersecurity law, ensuring clients' digital assets are secure.",
    "Renowned for proficiency in securities law and investment disputes.",
    "Focused on consumer protection cases, safeguarding against fraud and unfair practices.",
    "Distinguished for expertise in aviation law, handling accidents and regulations.",
    "Seasoned advocate for LGBTQ+ rights and issues related to family law.",
    "Leading expert in immigration law, assisting clients with visas and green cards.",
    "Specialized in entertainment contracts, representing artists and performers.",
    "Proven success in handling complex international trade and customs cases.",
    "Recognized for proficiency in product liability cases, ensuring consumer safety.",
    "Skilled in municipal law, advising local governments on legal matters.",
    "Expertise in construction defect litigation, representing builders and homeowners.",
    "Distinguished for successful resolution of complex intellectual property disputes.",
    "Specialized in environmental litigation, addressing pollution and conservation issues.",
    "Leading practitioner in sports law, representing athletes and sports organizations."
];


// Function to generate test data
function generateTestData() {
    const testData = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        gender: faker.helpers.arrayElement(['male', 'female']),
        email: faker.internet.email(),
        barCouncilId: faker.string.uuid(),
        barCouncilNo: faker.number.int(),
        barCouncilYear: faker.number.int({ min: 1980, max: 2022 }),
        state: "gujarat",
        city: "ahmedabad",
        searchTag: faker.helpers.arrayElement(lawyerExpertiseSentences),
        pincode: 320008,
        id_url: faker.image.url(),
        phoneNumber: faker.string.numeric(10),
        verified: true,
        registered: true,
    };

    return testData;
}

async function main() {
    await connectDB();
    for (let i = 0; i < 20; i++) {
        const testData = generateTestData();
        await UserService.createUser(testData);
    }
    process.exit();
}

main();