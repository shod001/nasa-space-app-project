// Copies static assets into the standalone build so `npm start` works anywhere.
// Cross-platform: uses Node.js (no `cp` needed) — works on Mac, Linux, Windows, Vercel.
import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const standalone = join(root, '.next', 'standalone');

if (!existsSync(standalone)) {
  console.error('No .next/standalone found — run "npm run build" first.');
  process.exit(1);
}

mkdirSync(join(standalone, '.next'), { recursive: true });

const staticSrc = join(root, '.next', 'static');
if (existsSync(staticSrc)) {
  cpSync(staticSrc, join(standalone, '.next', 'static'), { recursive: true });
  console.log('Copied .next/static -> standalone');
}

const publicSrc = join(root, 'public');
if (existsSync(publicSrc)) {
  cpSync(publicSrc, join(standalone, 'public'), { recursive: true });
  console.log('Copied public -> standalone');
}

console.log('Standalone build ready. Run: npm start');
