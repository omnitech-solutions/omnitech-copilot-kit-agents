import "@testing-library/jest-dom";
import PrimeReact from "primereact/api";
import { vi } from "vitest";

PrimeReact.unstyled = true;
PrimeReact.ripple = false;

if (!globalThis.URL.createObjectURL) {
  globalThis.URL.createObjectURL = vi.fn(() => "blob:mock-url");
}

if (!globalThis.URL.revokeObjectURL) {
  globalThis.URL.revokeObjectURL = vi.fn();
}

if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

vi.mock("katex/dist/katex.min.css", () => ({}));
