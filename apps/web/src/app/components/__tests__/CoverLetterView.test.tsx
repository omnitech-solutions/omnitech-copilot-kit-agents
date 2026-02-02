import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { CopilotKit } from "@copilotkit/react-core";
import type React from "react";

import { CoverLetterView } from "../CoverLetterView";

const renderWithCopilotKit = (ui: React.ReactElement) =>
  render(
    <CopilotKit runtimeUrl="/api/copilotkit" agent="coverLetterAgent">
      {ui}
    </CopilotKit>,
  );

describe("CoverLetterView", () => {
  it("renders the cover letter form", () => {
    renderWithCopilotKit(<CoverLetterView />);
    expect(screen.getByText("Create Cover Letter")).toBeInTheDocument();
    expect(screen.getByLabelText(/Company name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Role title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Full job specification/i)).toBeInTheDocument();
  });

  it("updates fields via setState", async () => {
    renderWithCopilotKit(<CoverLetterView />);
    const input = screen.getByLabelText(/Company name/i) as HTMLInputElement;
    await userEvent.type(input, "Helcim");
    expect(input.value).toBe("Helcim");
  });

  it("accepts uploaded text files", async () => {
    const { container } = renderWithCopilotKit(<CoverLetterView />);
    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput).toBeTruthy();
    const file = new File(["Resume text"], "resume.txt", { type: "text/plain" });

    await userEvent.upload(fileInput as HTMLInputElement, file);
    expect(await screen.findByText("resume.txt")).toBeInTheDocument();
  });

  it("enables generate when required fields are filled", async () => {
    renderWithCopilotKit(<CoverLetterView />);
    await userEvent.type(screen.getByLabelText(/Company name/i), "Helcim");
    await userEvent.type(screen.getByLabelText(/Role title/i), "Staff Engineer");
    await userEvent.type(screen.getByLabelText(/Full job specification/i), "Build scalable systems");
    expect(
      screen.getByRole("button", { name: /Generate cover letters now/i }),
    ).not.toBeDisabled();
  });
});
