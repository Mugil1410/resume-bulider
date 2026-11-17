export interface Personal {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
  photoUrl?: string | null;
}

export interface Experience {
  id: string;
  company: string;
  jobTitle: string;
  employmentType: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  responsibilities: string[];
  achievements: string[];
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency: string;
}

export interface Project {
  id: string;
  name: string;
  technologies: string;
  description: string;
  url: string;
  githubUrl: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url: string;
}

export type AdditionalKind =
  | "achievements"
  | "languages"
  | "awards"
  | "volunteer"
  | "publications"
  | "hobbies"
  | "custom";

export interface AdditionalSection {
  id: string;
  kind: AdditionalKind;
  title: string;
  items: string[];
}

export interface ResumeData {
  personal: Personal;
  summary: string;
  experiences: Experience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  additional: AdditionalSection[];
}

export interface ResumeRecord {
  id: string;
  name: string;
  updatedAt: string;
  createdAt: string;
  data: ResumeData;
}

export interface ResumeListItem {
  id: string;
  name: string;
  fullName: string;
  title: string;
  updatedAt: string;
  createdAt: string;
}

export const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

export const emptyResume = (): ResumeData => ({
  personal: {
    fullName: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    portfolio: "",
    photoUrl: null,
  },
  summary: "",
  experiences: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  additional: [],
});
