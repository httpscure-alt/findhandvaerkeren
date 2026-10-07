/**
 * Writes one JSON file per white-label agency to public/wl-data/.
 * The files are only served to a signed-in session for that agency (see lib/wlAuth/core.js),
 * which keeps every agency's portfolio out of the public JS bundle.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { agencyDemoData } from '../lib/whitelabel/agencyDemoData';
import { WL_BRANDS } from '../lib/wlAuth/core.js';

const outDir = join(process.cwd(), 'public', 'wl-data');
mkdirSync(outDir, { recursive: true });
for (const brand of WL_BRANDS) {
  writeFileSync(join(outDir, `${brand}.json`), JSON.stringify(agencyDemoData(brand)));
}
console.log(`wl-data: wrote ${WL_BRANDS.length} agency files to public/wl-data`);
