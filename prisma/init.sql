-- CreateTable
CREATE TABLE "resumes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "themeColor" TEXT,
    "sectionOrder" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "resume_personal_details" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "resumeId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL DEFAULT '',
    "title" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "location" TEXT NOT NULL DEFAULT '',
    "linkedin" TEXT NOT NULL DEFAULT '',
    "github" TEXT NOT NULL DEFAULT '',
    "portfolio" TEXT NOT NULL DEFAULT '',
    "photoUrl" TEXT,
    CONSTRAINT "resume_personal_details_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "resumes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "resume_summaries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "resumeId" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "resume_summaries_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "resumes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "resume_experiences" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "resumeId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "company" TEXT NOT NULL DEFAULT '',
    "jobTitle" TEXT NOT NULL DEFAULT '',
    "employmentType" TEXT NOT NULL DEFAULT '',
    "location" TEXT NOT NULL DEFAULT '',
    "startDate" TEXT NOT NULL DEFAULT '',
    "endDate" TEXT NOT NULL DEFAULT '',
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "responsibilities" TEXT NOT NULL DEFAULT '[]',
    "achievements" TEXT NOT NULL DEFAULT '[]',
    CONSTRAINT "resume_experiences_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "resumes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "resume_education" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "resumeId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "degree" TEXT NOT NULL DEFAULT '',
    "institution" TEXT NOT NULL DEFAULT '',
    "location" TEXT NOT NULL DEFAULT '',
    "startDate" TEXT NOT NULL DEFAULT '',
    "endDate" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "resume_education_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "resumes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "resume_skills" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "resumeId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "name" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT '',
    "proficiency" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "resume_skills_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "resumes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "resume_projects" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "resumeId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "name" TEXT NOT NULL DEFAULT '',
    "technologies" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "url" TEXT NOT NULL DEFAULT '',
    "githubUrl" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "resume_projects_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "resumes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "resume_certifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "resumeId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "name" TEXT NOT NULL DEFAULT '',
    "issuer" TEXT NOT NULL DEFAULT '',
    "date" TEXT NOT NULL DEFAULT '',
    "url" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "resume_certifications_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "resumes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "resume_additional_sections" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "resumeId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "kind" TEXT NOT NULL DEFAULT 'custom',
    "title" TEXT NOT NULL DEFAULT '',
    "items" TEXT NOT NULL DEFAULT '[]',
    CONSTRAINT "resume_additional_sections_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "resumes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "resumes_updatedAt_idx" ON "resumes"("updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "resume_personal_details_resumeId_key" ON "resume_personal_details"("resumeId");

-- CreateIndex
CREATE UNIQUE INDEX "resume_summaries_resumeId_key" ON "resume_summaries"("resumeId");

-- CreateIndex
CREATE INDEX "resume_experiences_resumeId_position_idx" ON "resume_experiences"("resumeId", "position");

-- CreateIndex
CREATE INDEX "resume_education_resumeId_position_idx" ON "resume_education"("resumeId", "position");

-- CreateIndex
CREATE INDEX "resume_skills_resumeId_position_idx" ON "resume_skills"("resumeId", "position");

-- CreateIndex
CREATE INDEX "resume_projects_resumeId_position_idx" ON "resume_projects"("resumeId", "position");

-- CreateIndex
CREATE INDEX "resume_certifications_resumeId_position_idx" ON "resume_certifications"("resumeId", "position");

-- CreateIndex
CREATE INDEX "resume_additional_sections_resumeId_position_idx" ON "resume_additional_sections"("resumeId", "position");

