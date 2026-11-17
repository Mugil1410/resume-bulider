import { ResumeData, uid } from "./types";

// Sample content taken verbatim from the uploaded resume PDF (Hemalatha S).
// Nothing here is invented; every field is editable in the app.
export const sampleResume = (): ResumeData => {
  const skill = (category: string, names: string[]) =>
    names.map((name) => ({ id: uid(), name, category, proficiency: "" }));

  return {
    personal: {
      fullName: "Hemalatha S",
      title: "Software Test Engineer | QA Automation",
      email: "s.hemalatha.1110@gmail.com",
      phone: "+91 93631 28624",
      location: "Chennai",
      linkedin: "linkedin.com/in/hemalatha-sureshbabu-4310aa230",
      github: "github.com/Hemalatha110",
      portfolio: "",
      photoUrl: null,
    },
    summary:
      "Software Test Engineer with 3+ years of experience in manual and automated testing of web applications, APIs and AI-powered consumer devices. Builds UI test automation with Playwright, JavaScript and the Page Object Model, and test automation in Python with Pytest. At Amazon, tested the Astro home robot, including speech recognition and LLM-integrated features, and received a Performance Award for finding critical issues in a new Alexa feature. Experienced in owning testing end to end within Agile/Scrum teams.",
    experiences: [
      {
        id: uid(),
        company: "BlindMatrix Pvt. Ltd.",
        jobTitle: "Software Test Engineer",
        employmentType: "",
        location: "Chennai",
        startDate: "Jan 2026",
        endDate: "",
        isCurrent: true,
        responsibilities: [
          "Owned end-to-end testing of CRM application modules independently, covering requirement analysis, test planning, test case design and execution.",
          "Built and maintained a reusable UI automation framework using Playwright and JavaScript, structured with the Page Object Model (POM) for maintainability.",
          "Performed functional, regression, smoke and integration testing; logged, tracked and verified defects across the development lifecycle.",
          "Stabilized automated test suites by handling dynamic web elements and applying reliable waits and assertions; worked with developers to improve release stability.",
        ],
        achievements: [],
      },
      {
        id: uid(),
        company: "Amazon",
        jobTitle: "Associate, Quality Services",
        employmentType: "",
        location: "Chennai",
        startDate: "Oct 2023",
        endDate: "Dec 2025",
        isCurrent: false,
        responsibilities: [
          "Tested Amazon Astro, a consumer home robot, validating speech recognition and LLM-integrated features for real-world performance.",
          "Automated test cases in Python using the Pytest framework over 2+ years.",
          "Planned and executed 500+ tests across web, API, device, end-to-end, functional, performance, KPI, smoke and sanity testing.",
          "Triaged 500+ defects, raising multiple Blocker, Critical and Must-Fix issues, and drove 200+ defects in team-owned components to resolution with stakeholders in Jira.",
          "Served as Point of Contact for owned domain components, defining their test scope and coverage.",
          "Participated in sprint planning, Scrum calls and retrospectives; delivered weekly status reports and tracked defect closure.",
        ],
        achievements: [
          "Received a Performance Award for testing the new Alexa Domains feature and identifying critical issues.",
        ],
      },
    ],
    education: [
      {
        id: uid(),
        degree: "MBA, Business Data Analytics",
        institution: "University of Madras",
        location: "",
        startDate: "Jan 2025",
        endDate: "Dec 2026",
        description: "",
      },
      {
        id: uid(),
        degree: "B.Tech, Information Technology",
        institution: "P.B. College of Engineering, Anna University",
        location: "",
        startDate: "Aug 2019",
        endDate: "May 2023",
        description: "",
      },
    ],
    skills: [
      ...skill("Test Automation", [
        "Playwright",
        "Pytest",
        "Page Object Model (POM)",
        "Framework Development",
        "CI/CD",
      ]),
      ...skill("Programming", ["JavaScript", "Python", "SQL", "Core Java", "HTML", "CSS"]),
      ...skill("Testing Types", [
        "Functional",
        "Regression",
        "Integration",
        "Smoke",
        "Sanity",
        "End-to-End (E2E)",
        "API",
        "Performance",
        "Device",
        "AI/LLM",
      ]),
      ...skill("QA Process", [
        "Test Planning and Strategy",
        "Test Case Design",
        "Defect Management",
        "Root Cause Analysis",
        "Agile/Scrum",
      ]),
      ...skill("Tools", ["Jira", "TestRail", "Postman", "Confluence", "GitHub"]),
    ],
    projects: [],
    certifications: [
      { id: uid(), name: "Software Testing", issuer: "QSpiders", date: "", url: "" },
      { id: uid(), name: "Python Intermediate", issuer: "SoloLearn", date: "", url: "" },
      { id: uid(), name: "Front End Development", issuer: "Great Learning", date: "", url: "" },
      { id: uid(), name: "Database Management Systems", issuer: "Great Learning", date: "", url: "" },
    ],
    additional: [],
  };
};
