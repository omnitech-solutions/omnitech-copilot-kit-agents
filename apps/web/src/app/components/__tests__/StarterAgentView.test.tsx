import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { CopilotKit } from "@copilotkit/react-core";
import type React from "react";

import { StarterAgentView } from "../StarterAgentView";

const renderWithCopilotKit = (ui: React.ReactElement) =>
  render(
    <CopilotKit runtimeUrl="/api/copilotkit" agent="starterAgent">
      {ui}
    </CopilotKit>,
  );

describe("StarterAgentView", () => {
  it("renders proverbs", () => {
    renderWithCopilotKit(<StarterAgentView themeColor="#000" />);
    expect(
      screen.getByText("CopilotKit may be new, but its the best thing since sliced bread."),
    ).toBeInTheDocument();
  });

  it("removes a proverb", async () => {
    renderWithCopilotKit(<StarterAgentView themeColor="#000" />);
    await userEvent.click(screen.getByRole("button", { name: "✕" }));
    expect(screen.getByText(/No proverbs yet/i)).toBeInTheDocument();
  });
});
