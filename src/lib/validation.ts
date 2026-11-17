import { z } from "zod";

const s = (max = 2000) => z.string().max(max).default("");
const list = z.array(z.string().max(2000)).max(100).default([]);

export const resumeDataSchema = z.object({
  personal: z.object({
    fullName: s(200),
    title: s(300),
    email: s(200),
    phone: s(60),
    location: s(200),
    linkedin: s(300),
    github: s(300),
    portfolio: s(300),
    // small data URL only; keeps the DB row bounded
    photoUrl: z.string().max(300_000).nullable().optional(),
  }),
  summary: s(5000),
  experiences: z
    .array(
      z.object({
        id: z.string().max(80),
        company: s(200),
        jobTitle: s(200),
        employmentType: s(80),
        location: s(200),
        startDate: s(40),
        endDate: s(40),
        isCurrent: z.boolean().default(false),
        responsibilities: list,
        achievements: list,
      }),
    )
    .max(200),
  education: z
    .array(
      z.object({
        id: z.string().max(80),
        degree: s(300),
        institution: s(300),
        location: s(200),
        startDate: s(40),
        endDate: s(40),
        description: s(3000),
      }),
    )
    .max(100),
  skills: z
    .array(
      z.object({
        id: z.string().max(80),
        name: s(200),
        category: s(200),
        proficiency: s(80),
      }),
    )
    .max(500),
  projects: z
    .array(
      z.object({
        id: z.string().max(80),
        name: s(300),
        technologies: s(500),
        description: s(3000),
        url: s(500),
        githubUrl: s(500),
      }),
    )
    .max(100),
  certifications: z
    .array(
      z.object({
        id: z.string().max(80),
        name: s(300),
        issuer: s(300),
        date: s(40),
        url: s(500),
      }),
    )
    .max(100),
  additional: z
    .array(
      z.object({
        id: z.string().max(80),
        kind: z.enum([
          "achievements",
          "languages",
          "awards",
          "volunteer",
          "publications",
          "hobbies",
          "custom",
        ]),
        title: s(200),
        items: list,
      }),
    )
    .max(50),
});

export const createResumeSchema = z.object({
  name: z.string().trim().min(1).max(120),
  data: resumeDataSchema.optional(),
  useSample: z.boolean().optional(),
});

export const updateResumeSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  data: resumeDataSchema.optional(),
});
