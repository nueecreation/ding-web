// Postinstall: copies prisma_schema_build_bg.wasm to where the prisma CLI expects it.
// This fixes missing-wasm errors that occur when npm cache extraction is incomplete
// or when the filesystem casing (DIng vs ding) causes __dirname mismatches on macOS.
const fs = require("fs");
const path = require("path");

const dest = path.join(
  __dirname,
  "..",
  "node_modules",
  "prisma",
  "build",
  "prisma_schema_build_bg.wasm"
);

if (fs.existsSync(dest)) {
  console.log("Prisma wasm: OK");
  process.exit(0);
}

const candidates = [
  path.join(
    __dirname,
    "..",
    "node_modules",
    "@prisma",
    "prisma-schema-wasm",
    "src",
    "prisma_schema_build_bg.wasm"
  ),
  path.join(
    __dirname,
    "..",
    "node_modules",
    "@prisma",
    "prisma-schema-wasm",
    "prisma_schema_build_bg.wasm"
  ),
];

for (const src of candidates) {
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log("Prisma wasm: fixed (copied from", src, ")");
    process.exit(0);
  }
}

console.log(
  "Prisma wasm: not found in expected locations. Run npm install to re-fetch."
);
