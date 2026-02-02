import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Page from "../page";

describe("CopilotKitPage", () => {
  it("renders the default view", () => {
    render(<Page />);
    expect(screen.getByText("CopilotKit")).toBeInTheDocument();
    expect(screen.getByText("Agent / Task")).toBeInTheDocument();
    expect(screen.getByText("Proverbs")).toBeInTheDocument();
  });
});
