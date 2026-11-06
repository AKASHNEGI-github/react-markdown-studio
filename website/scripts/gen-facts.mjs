// Collects verifiable facts about the package (tarball size, test count) so the
// website states measured numbers instead of hand-typed ones. Writes
// src/generated/facts.json. Failures degrade to null, never to made-up values.
import { execSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const out = join(root, "website", "src", "generated", "facts.json");
const facts = { packedKB: null, unpackedKB: null, files: null, tests: null, generatedAt: new Date().toISOString() };

try {
  const [info] = JSON.parse(
    execSync("npm pack --dry-run --json --ignore-scripts", {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }),
  );
  facts.packedKB = Math.round((info.size / 1024) * 10) / 10;
  facts.unpackedKB = Math.round((info.unpackedSize / 1024) * 10) / 10;
  facts.files = info.entryCount;
} catch (e) {
  console.warn("facts: could not measure package size:", e.message);
}

try {
  const report = join(root, "website", "src", "generated", ".vitest-report.json");
  try {
    execSync(`npx vitest run --reporter=json --outputFile="${report}"`, { cwd: root, stdio: "ignore" });
  } catch {
    /* a failing test still writes the report; we only record the count of tests that passed */
  }
  const parsed = JSON.parse(readFileSync(report, "utf8"));
  facts.tests = parsed.numPassedTests;
  if (parsed.numFailedTests > 0) throw new Error(`${parsed.numFailedTests} test(s) failing`);
  rmSync(report, { force: true });
} catch (e) {
  console.warn("facts: could not record test count:", e.message);
  facts.tests = null;
}

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(facts, null, 2) + "\n");
console.log("facts:", JSON.stringify(facts));
