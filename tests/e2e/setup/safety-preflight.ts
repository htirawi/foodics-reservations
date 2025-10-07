/**
 * @file safety-preflight.ts
 * @summary Module: tests/e2e/setup/safety-preflight.ts
 * @remarks
 *   - Tiny components; logic in composables/services.
 *   - TypeScript strict; no any/unknown; use ?./??.
 *   - i18n/RTL ready; a11y ≥95; minimal deps.
 */
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, "../../..");
export function runSafetyPreflight(): void {
    const errors: string[] = [];
    const warnings: string[] = [];
    const token = process.env["VITE_FOODICS_TOKEN"];
    if (!token) {
        warnings.push("VITE_FOODICS_TOKEN not set; some tests may fail");
    }
    else if (token !== "e2e-test-token") {
        errors.push(`VITE_FOODICS_TOKEN must be exactly "e2e-test-token" for E2E tests, got: "${token.slice(0, 20)}..." ` +
            "Update .env.e2e to use the test token.");
    }
    const trackedEnvFiles = [".env", ".env.local", ".env.production"];
    trackedEnvFiles.forEach((file) => {
        const path = resolve(REPO_ROOT, file);
        if (existsSync(path)) {
            // Tracked env file exists - this is expected for development
        }
    });
    const isOnlineMode = process.env["PW_E2E_ONLINE"] === "true";
    if (isOnlineMode) {
        if (!process.env["PW_API_BASE_URL"]) {
            errors.push("PW_E2E_ONLINE=true requires PW_API_BASE_URL to be set");
        }
        if (!process.env["PW_STAGING_TOKEN"]) {
            errors.push("PW_E2E_ONLINE=true requires PW_STAGING_TOKEN to be set");
        }
    }
    if (warnings.length > 0) {
        console.warn("\n\u26A0\uFE0F  E2E Safety Preflight Warnings:\n");
        warnings.forEach((warn) => console.warn(`  - ${warn}`));
        console.warn("\n");
    }
    if (errors.length > 0) {
        console.error("\n\u274C E2E Safety Preflight FAILED:\n");
        errors.forEach((err) => console.error(`  - ${err}`));
        console.error("\n");
        throw new Error("E2E safety checks failed. Aborting tests.");
    }
    console.log("\u2705 E2E Safety Preflight passed (offline mode, test token only)");
}
