// Mock CSS imports at the Node.js level
if (typeof require !== 'undefined') {
  require.extensions['.css'] = () => '';
}

export default function setup() {
  // Global setup for Vitest
}
