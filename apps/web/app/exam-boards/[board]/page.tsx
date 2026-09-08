import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BOARD_DATA, type BoardType } from "@/lib/marketing/examBoards";
import { ExamBoardDetail } from "@/components/marketing/ExamBoardDetail";

const BOARD_TITLES: Record<BoardType, string> = {
  jnvst: "JNVST",
  aissee: "AISSEE",
  rms: "RMS",
};

export function generateStaticParams() {
  return (Object.keys(BOARD_DATA) as BoardType[]).map((board) => ({ board }));
}

export async function generateMetadata({ params }: { params: { board: string } }): Promise<Metadata> {
  const board = params.board as BoardType;
  if (!(board in BOARD_DATA)) return {};
  return {
    title: `${BOARD_TITLES[board]} Exam Pattern, Eligibility & Marking Scheme`,
    description: `Full ${BOARD_TITLES[board]} exam pattern, eligibility criteria, section-wise marking scheme, and a direct link to a live mock — Class 6 and Class 9.`,
  };
}

export default function ExamBoardPage({ params }: { params: { board: string } }) {
  const board = params.board as BoardType;
  if (!(board in BOARD_DATA)) notFound();
  return <ExamBoardDetail board={board} />;
}
