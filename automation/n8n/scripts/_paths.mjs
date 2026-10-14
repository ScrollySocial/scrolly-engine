import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as loadDotenv } from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// automation/n8n/scripts/_paths.mjs -> automation/ -> repo root -> "Scrolly Organic Engine" vault
export const AUTOMATION_DIR = path.resolve(__dirname, '..', '..');
export const REPO_ROOT = path.resolve(AUTOMATION_DIR, '..');

// Every script in this directory is invoked two ways: directly (cwd already
// automation/ or repo root) and via bridge-server.mjs's execFile, which sets
// cwd to THIS directory (automation/n8n/scripts) -- where plain `import
// 'dotenv/config'` would look for .env and never find the real one. Loading
// it here, once, by absolute path, makes every script that imports
// _paths.mjs reliably see automation/.env regardless of how it was invoked.
// dotenv never overwrites a var that's already set, so this is harmless even
// in scripts (e.g. check-pending-intakes.mjs) that also load it themselves.
// quiet is required, not cosmetic -- dotenv's default "tip" banner writes to
// stdout, and every one of these scripts' stdout is parsed as JSON by
// bridge-server.mjs (JSON.parse(out)); an unsuppressed banner line breaks
// that parse. Set as the global env-var switch (not just the local
// quiet:true option below) because some scripts in this directory ALSO have
// their own bare `import 'dotenv/config'` line later in the same file --
// DOTENV_CONFIG_QUIET is dotenv's documented process-wide suppression flag,
// so it silences those too, not just this call.
process.env.DOTENV_CONFIG_QUIET = 'true';
loadDotenv({ path: path.join(AUTOMATION_DIR, '.env'), quiet: true });
export const VAULT_DIR = path.join(REPO_ROOT, 'Scrolly Organic Engine');
export const CLIENTS_DIR = path.join(VAULT_DIR, 'clients');
export const TEMPLATE_DIR = path.join(VAULT_DIR, 'methodology', 'engagement-template');

export function engagementDir(slug) {
  return path.join(CLIENTS_DIR, slug, 'discover');
}
