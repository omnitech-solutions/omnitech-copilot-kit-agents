import "../../test/setupCSS";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// Mock CopilotKit components to avoid runtime sync issues
vi.mock("@copilotkit/react-core", () => ({
  CopilotKit: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useCopilotAction: vi.fn(),
  useCoAgent: vi.fn(() => ({
    state: { proverbs: [] },
    setState: vi.fn(),
  })),
}));

vi.mock("@copilotkit/react-ui", () => ({
  CopilotSidebar: ({ children, labels, defaultOpen, clickOutsideToClose }: any) => (
    <div data-testid="copilot-sidebar">
      <div data-testid="sidebar-title">{labels?.title}</div>
      <div data-testid="sidebar-initial">{labels?.initial}</div>
    </div>
  ),
  CopilotKitCSSProperties: {} as any,
}));

import Page from "../page";

describe("CopilotKitPage", () => {
  it("renders the default view", () => {
    render(<Page />);
    expect(screen.getByText("CopilotKit")).toBeInTheDocument();
    expect(screen.getByText("Agent / Task")).toBeInTheDocument();
    expect(screen.getByText("OmniTech Custom Agents")).toBeInTheDocument();
  });
});
