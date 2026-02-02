import type { Plugin } from "vite";

export function cssMockPlugin(): Plugin {
  const virtualId = "\0virtual:css-mock";

  return {
    name: "css-mock",
    enforce: "pre",
    resolveId(id: string, importer: string | undefined) {
      // Handle all CSS files including KaTeX
      if (id.endsWith(".css") || id.includes("katex") || id.includes(".min.css")) {
        return virtualId;
      }
      return null;
    },
    load(id: string) {
      if (id === virtualId) {
        return "export default {};";
      }
      return null;
    },
    transform(code: string, id: string) {
      // Transform any CSS imports to empty objects
      if (id.endsWith(".css") || id.includes("katex")) {
        return {
          code: "export default {};",
          map: null,
        };
      }
      return null;
    },
  };
}
