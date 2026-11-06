// Fails the build if the published package grows past its budget, so an
// accidental dependency or asset never ships unnoticed.
import { execSync } from "node:child_process";

const BUDGET = { packedKB: 140, unpackedKB: 700 };
const [info] = JSON.parse(execSync("npm pack --dry-run --json --ignore-scripts", { encoding: "utf8" }));
const packedKB = info.size / 1024;
const unpackedKB = info.unpackedSize / 1024;
console.log(
  `package size: ${packedKB.toFixed(1)} kB packed, ${unpackedKB.toFixed(1)} kB unpacked, ${info.entryCount} files`,
);
if (packedKB > BUDGET.packedKB || unpackedKB > BUDGET.unpackedKB) {
  console.error(`over budget (${BUDGET.packedKB} kB packed / ${BUDGET.unpackedKB} kB unpacked)`);
  process.exit(1);
}
