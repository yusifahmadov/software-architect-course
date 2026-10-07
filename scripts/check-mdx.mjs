import { readFile } from "node:fs/promises";
import { compile } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";

const files = process.argv.slice(2);
if (!files.length) {
  console.error("usage: node scripts/check-mdx.mjs <file.mdx> [...]");
  process.exit(2);
}

const KNOWN = new Set(["Callout", "Diagram", "Exercise", "Hint", "Solution", "Recap", "Term", "Terms", "Quiz"]);
let failed = false;

for (const f of files) {
  const src = await readFile(f, "utf8");
  try {
    await compile(src, { remarkPlugins: [remarkGfm] });
    const unknown = [...src.matchAll(/<([A-Z][A-Za-z]*)/g)].map((m) => m[1]).filter((n) => !KNOWN.has(n));
    const problems = [];
    if (unknown.length) problems.push(`unknown components: ${[...new Set(unknown)].join(", ")}`);
    if (!/export const meta\s*=/.test(src)) problems.push("missing `export const meta`");
    if (/[–—]/.test(src)) problems.push("contains an em or en dash");
    if (/^# /m.test(src.replace(/```[\s\S]*?```/g, ""))) problems.push("contains an h1");
    const commented = [...src.matchAll(/```go\n([\s\S]*?)```/g)]
      .flatMap((m) => m[1].split("\n").filter((l, i) => !(i === 0 && /^\s*\/\/\s*file:/.test(l))))
      .filter((l) => /\/\//.test(l.replace(/"(?:[^"\\]|\\.)*"|`[^`]*`/g, '""')));
    if (commented.length) problems.push(`${commented.length} comment line(s) in Go code`);
    const words = src.replace(/```[\s\S]*?```/g, "").split(/\s+/).filter(Boolean).length;
    if (problems.length) {
      failed = true;
      console.log(`✗ ${f}: ${problems.join("; ")}`);
    } else {
      console.log(`✓ ${f} (${words} words outside code)`);
    }
  } catch (e) {
    failed = true;
    console.log(`✗ ${f}: ${e.message}`);
  }
}

process.exit(failed ? 1 : 0);
