import { execFileSync } from 'node:child_process';

// The sub-path spec serves dist/, so every run rebuilds it from the current source.
export default function globalSetup() {
  execFileSync('./node_modules/.bin/vite', ['build'], { stdio: 'inherit' });
}
