// Shim for @next/env when running scripts with tsx
// Payload's loadEnv.js tries to import @next/env but tsx breaks the interop.
// Since we load env vars manually in load-env.ts, this is a no-op shim.
export function loadEnvConfig() {
  return { loadedEnvFiles: [], combinedEnv: process.env };
}

export default { loadEnvConfig };
