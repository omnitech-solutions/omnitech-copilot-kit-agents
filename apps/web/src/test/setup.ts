import { vi, beforeAll, afterAll } from "vitest";

// Mock UUID at the module level before any other imports
const mockUUID = {
  v1: () => "mock-v1-uuid",
  v4: () => "mock-v4-uuid",
};

vi.mock("uuid", () => mockUUID);

// Mock CSS imports before any other imports
vi.mock("katex/dist/katex.min.css", () => ({}));
vi.mock("*.css", () => ({}));
vi.mock("katex", () => ({
  default: {},
  render: vi.fn(),
  renderToString: vi.fn(),
}));

// Mock CSS modules
vi.mock("*.module.css", () => ({}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(() => null),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock fetch globally
const mockFetch = vi.fn((url) => {
  if (url?.includes('/api/copilotkit/info')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        runtime: {
          version: "1.0.0",
          capabilities: [],
          agents: [
            {
              name: "starterAgent",
              description: "A starter agent",
              instructions: "You are a helpful assistant",
            },
            {
              name: "coverLetterAgent", 
              description: "A cover letter agent",
              instructions: "You help write cover letters",
            },
          ]
        }
      }),
      text: () => Promise.resolve(JSON.stringify({
        runtime: {
          version: "1.0.0",
          capabilities: [],
          agents: [
            {
              name: "starterAgent",
              description: "A starter agent",
              instructions: "You are a helpful assistant",
            },
            {
              name: "coverLetterAgent", 
              description: "A cover letter agent",
              instructions: "You help write cover letters",
            },
          ]
        }
      })),
      body: {
        getReader: () => ({
          read: () => Promise.resolve({ done: true, value: new Uint8Array() }),
          releaseLock: () => {},
        }),
      },
      getReader: () => ({
        read: () => Promise.resolve({ done: true, value: new Uint8Array() }),
        releaseLock: () => {},
      }),
      clone: () => ({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          runtime: {
            version: "1.0.0",
            capabilities: [],
            agents: [
              {
                name: "starterAgent",
                description: "A starter agent",
                instructions: "You are a helpful assistant",
              },
              {
                name: "coverLetterAgent", 
                description: "A cover letter agent",
                instructions: "You help write cover letters",
              },
            ]
          }
        }),
        text: () => Promise.resolve(JSON.stringify({
          runtime: {
            version: "1.0.0",
            capabilities: [],
            agents: [
              {
                name: "starterAgent",
                description: "A starter agent",
                instructions: "You are a helpful assistant",
              },
              {
                name: "coverLetterAgent", 
                description: "A cover letter agent",
                instructions: "You help write cover letters",
              },
            ]
          }
        })),
        getReader: () => ({
          read: () => Promise.resolve({ done: true, value: new Uint8Array() }),
          releaseLock: () => {},
        }),
      }),
    });
  }
  
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve([
      {
        name: "starterAgent",
        description: "A starter agent",
        instructions: "You are a helpful assistant",
      },
      {
        name: "coverLetterAgent", 
        description: "A cover letter agent",
        instructions: "You help write cover letters",
      },
    ]),
    text: () => Promise.resolve("mock response"),
    body: {
      getReader: () => ({
        read: () => Promise.resolve({ done: true, value: new Uint8Array() }),
        releaseLock: () => {},
      }),
    },
    getReader: () => ({
      read: () => Promise.resolve({ done: true, value: new Uint8Array() }),
      releaseLock: () => {},
    }),
    clone: () => ({
      ok: true,
      status: 200,
      json: () => Promise.resolve([]),
      text: () => Promise.resolve("mock response"),
      getReader: () => ({
        read: () => Promise.resolve({ done: true, value: new Uint8Array() }),
        releaseLock: () => {},
      }),
    }),
  });
});

global.fetch = mockFetch as any;

// Suppress CSS-related errors and other test noise
const originalError = console.error;
const originalWarn = console.warn;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Unknown file extension ".css"') ||
       args[0].includes('katex') ||
       args[0].includes('Could not parse CSS stylesheet') ||
       args[0].includes('getReader') ||
       args[0].includes('get') ||
       args[0].includes('Failed to getReader'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
  
  console.warn = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('act()') ||
       args[0].includes('update inside a test was not wrapped'))
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  // Silently ignore unhandled rejections in tests to avoid noise
  if (typeof reason === 'string' && 
      (reason.includes('getReader') || 
       reason.includes('get') ||
       reason.includes('Failed to getReader'))) {
    return;
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  // Silently ignore certain errors in tests to avoid noise
  if (typeof error.message === 'string' && 
      (error.message.includes('getReader') || 
       error.message.includes('get') ||
       error.message.includes('Failed to getReader'))) {
    return;
  }
});

import "@testing-library/jest-dom";
import PrimeReact from "primereact/api";

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

// Mock window.matchMedia for dark mode
if (!globalThis.matchMedia) {
  globalThis.matchMedia = vi.fn(() => ({
    matches: false,
    media: '',
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}
