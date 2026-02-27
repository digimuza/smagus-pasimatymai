import * as fs from 'fs';
import * as path from 'path';
import Module from 'module';

// Load .env.local manually
const envPath = path.resolve(__dirname, '../.env.local');

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex);
    const value = trimmed.slice(eqIndex + 1);
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

// Patch @next/env to work with tsx (tsx breaks the default import interop)
const originalResolveFilename = (Module as any)._resolveFilename;
(Module as any)._resolveFilename = function (request: string, ...args: any[]) {
  if (request === '@next/env') {
    // Return a path to our shim instead
    return path.resolve(__dirname, 'next-env-shim.ts');
  }
  return originalResolveFilename.call(this, request, ...args);
};
