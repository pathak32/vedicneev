const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.previousYearQuestion.findMany({
    where: { classLevel: 6, examType: { in: ["JNVST", "AISSEE", "RMS"] } },
    include: { section: true },
    orderBy: [{ examType: "asc" }, { paperNumber: "asc" }, { section: { order: "asc" } }, { key: "asc" }],
  });

  const withBn = [];
  const withoutBn = [];
  for (const r of rows) {
    const hasBn = typeof r.questionJson?.bn === "string" && r.questionJson.bn.trim().length > 0;
    (hasBn ? withBn : withoutBn).push(r);
  }

  const summarize = (list) => {
    const byBoardPaper = {};
    for (const r of list) {
      const k = `${r.examType} paper${r.paperNumber}`;
      byBoardPaper[k] = byBoardPaper[k] || {};
      byBoardPaper[k][r.section.key] = (byBoardPaper[k][r.section.key] || 0) + 1;
    }
    return byBoardPaper;
  };

  console.log("Total class-6 rows (JNVST/AISSEE/RMS):", rows.length);
  console.log("With bn:", withBn.length, JSON.stringify(summarize(withBn), null, 2));
  console.log("Without bn:", withoutBn.length, JSON.stringify(summarize(withoutBn), null, 2));

  const outDir = path.join(__dirname, "pyq-bn-export");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "with-bn-reference.json"), JSON.stringify(withBn, null, 2));
  fs.writeFileSync(path.join(outDir, "without-bn.json"), JSON.stringify(withoutBn, null, 2));
  console.log("Wrote", outDir);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
