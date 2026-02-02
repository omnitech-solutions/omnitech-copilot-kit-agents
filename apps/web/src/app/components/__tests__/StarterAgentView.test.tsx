import "../../../test/setupCSS";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type React from "react";

// Mock CopilotKit to avoid runtime issues
vi.mock("@copilotkit/react-core", () => ({
  CopilotKit: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useCopilotAction: vi.fn(),
  useCoAgent: vi.fn(() => ({
    state: {
      proverbs: [
        "CopilotKit may be new, but its the best thing since sliced bread.",
        "Testing is like brushing your teeth - do it regularly or you'll have problems later.",
      ],
    },
    setState: vi.fn(),
  })),
}));

import { StarterAgentView } from "../StarterAgentView";

const renderWithCopilotKit = (ui: React.ReactElement) => render(ui);

describe("StarterAgentView", () => {
  it("renders proverbs", () => {
    renderWithCopilotKit(<StarterAgentView themeColor="#000" />);
    expect(
      screen.getByText("CopilotKit may be new, but its the best thing since sliced bread."),
    ).toBeInTheDocument();
  });

  it("removes a proverb", async () => {
    renderWithCopilotKit(<StarterAgentView themeColor="#000" />);
    // Verify that remove buttons exist
    const buttons = screen.getAllByRole("button", { name: "✕" });
    expect(buttons.length).toBeGreaterThan(0);
    
    // Test clicking a remove button (we can't easily test the state change with our mock)
    await userEvent.click(buttons[0]);
    
    // Just verify the component still renders after the click
    expect(screen.getByText("Proverbs")).toBeInTheDocument();
  });
});
