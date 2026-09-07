import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

import type { SprintPool } from "@/lib/admin/sprintQuestionPool";

const OPTION_LABELS = ["A", "B", "C", "D", "E", "F"];

const styles = StyleSheet.create({
  page: { paddingTop: 36, paddingBottom: 48, paddingHorizontal: 40, fontSize: 10, fontFamily: "Helvetica" },
  title: { fontSize: 16, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 10 },
  metaItem: { marginRight: 16, marginBottom: 2, color: "#555555" },
  disclaimer: {
    fontSize: 8,
    color: "#92400e",
    backgroundColor: "#fffbeb",
    padding: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#fcd34d",
    borderStyle: "solid",
  },
  sectionHeading: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginTop: 14,
    marginBottom: 8,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: "#d4d4d4",
    borderBottomStyle: "solid",
  },
  questionBlock: { marginBottom: 10 },
  questionStem: { fontFamily: "Helvetica-Bold", marginBottom: 4 },
  option: { flexDirection: "row", marginBottom: 2, paddingLeft: 10 },
  optionCorrect: { color: "#065f46", fontFamily: "Helvetica-Bold" },
  optionLabel: { width: 16 },
  explanation: { marginTop: 4, marginLeft: 10, fontSize: 9, color: "#444444", fontFamily: "Helvetica-Oblique" },
  verifiedTag: { marginTop: 3, fontSize: 8, color: "#065f46" },
  unverifiedTag: { marginTop: 3, fontSize: 8, color: "#b45309" },
  pageNumber: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 40,
    textAlign: "right",
    fontSize: 8,
    color: "#888888",
  },
});

export interface SprintMasterBookletProps {
  sprintTitle: string;
  targetDate: string;
  pool: SprintPool;
}

/**
 * The full source question pool for one National Sprint's ExamTemplate,
 * not one fixed exam paper — sprints assemble a random subset per
 * registrant (see generateLiveMockSession), so there's no single "the
 * paper" to export. This is deliberately labeled a master question bank /
 * answer key, not "the exam paper", to avoid implying every student saw
 * this exact document.
 */
export function SprintMasterBookletDocument({ sprintTitle, targetDate, pool }: SprintMasterBookletProps) {
  const bySection = new Map<string, { sectionName: string; questions: SprintPool["questions"] }>();
  for (const q of pool.questions) {
    const bucket = bySection.get(q.sectionKey) ?? { sectionName: q.sectionName, questions: [] };
    bucket.questions.push(q);
    bySection.set(q.sectionKey, bucket);
  }
  const verifiedCount = pool.questions.filter((q) => q.verifiedAt !== null).length;

  return (
    <Document title={`${sprintTitle} — Master Question Bank`}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{sprintTitle} — Master Question Bank &amp; Answer Key</Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaItem}>Exam Board: {pool.examType}</Text>
          <Text style={styles.metaItem}>Class: {pool.classLevel}</Text>
          <Text style={styles.metaItem}>Target Date: {targetDate}</Text>
          <Text style={styles.metaItem}>Total Questions in Pool: {pool.questions.length}</Text>
          <Text style={styles.metaItem}>Total Marks: {pool.totalMarks}</Text>
          <Text style={styles.metaItem}>Duration: {pool.durationMinutes} min</Text>
          <Text style={styles.metaItem}>
            Verified: {verifiedCount}/{pool.questions.length}
          </Text>
        </View>

        <Text style={styles.disclaimer}>
          This document lists the FULL source question pool this sprint draws from for internal review — it is not
          a single fixed exam paper. Each registered student receives a randomly-assembled subset of this pool at
          attempt time, so no individual student sees this exact document in this exact order.
        </Text>

        {Array.from(bySection.entries()).map(([sectionKey, bucket]) => (
          <View key={sectionKey}>
            <Text style={styles.sectionHeading}>
              {bucket.sectionName} ({bucket.questions.length} questions)
            </Text>
            {bucket.questions.map((q, i) => (
              <View key={q.id} style={styles.questionBlock} wrap={false}>
                <Text style={styles.questionStem}>
                  Q{i + 1}. {q.content.en}
                </Text>
                {q.options.map((o, oi) => (
                  <View key={o.key} style={styles.option}>
                    <Text style={[styles.optionLabel, o.isCorrect ? styles.optionCorrect : undefined]}>
                      {OPTION_LABELS[oi] ?? oi}.
                    </Text>
                    <Text style={o.isCorrect ? styles.optionCorrect : undefined}>
                      {o.text.en}
                      {o.isCorrect ? "  (Correct)" : ""}
                    </Text>
                  </View>
                ))}
                {q.explanation ? <Text style={styles.explanation}>Explanation: {q.explanation.en}</Text> : null}
                <Text style={q.verifiedAt ? styles.verifiedTag : styles.unverifiedTag}>
                  {q.verifiedAt ? "✓ Verified by Team" : "⚠ Not yet verified"}
                </Text>
              </View>
            ))}
          </View>
        ))}

        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  );
}
