import { describe, expect, it } from "vitest";

import { buildCoverLetterSystemPrompt } from "../coverLetterAgent";

const emptyState = {
  messages: [],
  copilotkit: {},
  companyName: null,
  roleTitle: null,
  jobSpec: null,
  relatedDocuments: null,
  uploadedFiles: [],
};

describe("coverLetterAgent system prompt", () => {
  it("includes the structure and signature requirements", () => {
    const prompt = buildCoverLetterSystemPrompt(emptyState as any);
    expect(prompt).toContain("Dear [Company Name] Leadership Team");
    expect(prompt).toContain("Version A ~150 words");
    expect(prompt).toContain("Best regards,");
    expect(prompt).toContain("Desmond O’Leary");
  });

  it("embeds structured context", () => {
    const prompt = buildCoverLetterSystemPrompt({
      ...emptyState,
      companyName: "Helcim",
      roleTitle: "Staff Engineer",
      jobSpec: "Build scalable systems",
    } as any);
    expect(prompt).toContain("\"companyName\": \"Helcim\"");
    expect(prompt).toContain("\"roleTitle\": \"Staff Engineer\"");
    expect(prompt).toContain("\"jobSpec\": \"Build scalable systems\"");
  });
});
