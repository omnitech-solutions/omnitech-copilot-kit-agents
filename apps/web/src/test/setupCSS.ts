// Mock CSS imports
import { vi } from "vitest";

// Mock KaTeX CSS specifically
vi.mock("katex/dist/katex.min.css", () => ({}));

// Mock all CSS files
vi.mock("*.css", () => ({}));

// Mock CSS modules
vi.mock("*.module.css", () => ({}));

// Mock katex itself
vi.mock("katex", () => ({
  default: {},
  render: vi.fn(),
  renderToString: vi.fn(),
}));
