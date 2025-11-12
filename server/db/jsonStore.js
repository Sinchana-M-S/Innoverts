const fs = require("fs-extra");
const path = require("path");

const dataPath = path.join(__dirname, "..", "data");

const readJSON = async (file) => {
  const filePath = path.join(dataPath, file);
  await fs.ensureFile(filePath);
  const content = await fs.readFile(filePath, "utf-8");
  if (!content) return [];
  const parsedContent = JSON.parse(content);
  return parsedContent.items || [];
};

const writeJSON = async (file, data) => {
  const filePath = path.join(dataPath, file);
  const contentToWrite = {
    items: data,
    meta: {
      lastUpdated: new Date().toISOString(),
      count: data.length,
    },
  };
  await fs.writeJson(filePath, contentToWrite, { spaces: 2 });
};

module.exports = { readJSON, writeJSON };
