import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BOARD_DATA, type BoardType } from "@/lib/marketing/examBoards";
import { COMING_SOON_BOARD_DATA, type ComingSoonBoardType } from "@/lib/marketing/comingSoonBoards";
import { ExamBoardDetail } from "@/components/marketing/ExamBoardDetail";
import { ComingSoonBoardDetail } from "@/components/marketing/ComingSoonBoardDetail";

const BOARD_TITLES: Record<BoardType, string> = {
  jnvst: "JNVST",
  aissee: "AISSEE",
  rms: "RMS",
};

export function generateStaticParams() {
  return [
    ...(Object.keys(BOARD_DATA) as BoardType[]).map((board) => ({ board })),
    ...(Object.keys(COMING_SOON_BOARD_DATA) as ComingSoonBoardType[]).map((board) => ({ board })),
  ];
}

export async function generateMetadata({ params }: { params: { board: string } }): Promise<Metadata> {
  const board = params.board;
  if (board in BOARD_DATA) {
    const title = BOARD_TITLES[board as BoardType];
    return {
      title: `${title} Exam Pattern, Eligibility & Marking Scheme`,
      description: `Full ${title} exam pattern, eligibility criteria, section-wise marking scheme, and a direct link to a live mock — Class 6 and Class 9.`,
    };
  }
  if (board in COMING_SOON_BOARD_DATA) {
    const info = COMING_SOON_BOARD_DATA[board as ComingSoonBoardType];
    return {
      title: `${info.name} — Exam Pattern & Syllabus`,
      description: info.description,
    };
  }
  return {};
}

export default function ExamBoardPage({ params }: { params: { board: string } }) {
  const board = params.board;
  if (board in BOARD_DATA) return <ExamBoardDetail board={board as BoardType} />;
  if (board in COMING_SOON_BOARD_DATA) return <ComingSoonBoardDetail board={board as ComingSoonBoardType} />;
  notFound();
}
