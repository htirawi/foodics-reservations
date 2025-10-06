/**
 * @file global-setup.ts
 * @summary Module: tests/e2e/setup/global-setup.ts
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
import dotenv from "dotenv";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { runSafetyPreflight } from "./safety-preflight";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, "../../../.env.e2e");
dotenv.config({ path: envPath });
async function globalSetup(): Promise<void> {
    runSafetyPreflight();
    console.log("\u2705 E2E global setup complete");
}
export default globalSetup;
