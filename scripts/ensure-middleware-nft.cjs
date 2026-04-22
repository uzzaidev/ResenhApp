const fs = require("fs");
const path = require("path");

const targetPath = path.join(process.cwd(), ".next", "server", "middleware.js.nft.json");

function ensureDirectory(filePath) {
  const directory = path.dirname(filePath);
  fs.mkdirSync(directory, { recursive: true });
}

function writeFallbackFile(filePath) {
  const fallbackContent = {
    version: 1,
    files: [],
  };
  fs.writeFileSync(filePath, JSON.stringify(fallbackContent, null, 2), "utf8");
}

try {
  if (!fs.existsSync(targetPath)) {
    ensureDirectory(targetPath);
    writeFallbackFile(targetPath);
    console.log("[postbuild] Created missing middleware.js.nft.json fallback.");
  } else {
    console.log("[postbuild] middleware.js.nft.json already exists.");
  }
} catch (error) {
  console.error("[postbuild] Failed to ensure middleware.js.nft.json:", error);
  process.exit(1);
}
