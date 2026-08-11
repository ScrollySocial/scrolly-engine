import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// automation/n8n/scripts/_paths.mjs -> automation/ -> repo root -> "Scrolly Organic Engine" vault
export const AUTOMATION_DIR = path.resolve(__dirname, '..', '..');
export const REPO_ROOT = path.resolve(AUTOMATION_DIR, '..');
export const VAULT_DIR = path.join(REPO_ROOT, 'Scrolly Organic Engine');
export const CLIENTS_DIR = path.join(VAULT_DIR, 'clients');
export const TEMPLATE_DIR = path.join(VAULT_DIR, 'methodology', 'engagement-template');

export function engagementDir(slug) {
  return path.join(CLIENTS_DIR, slug, 'discover');
}
