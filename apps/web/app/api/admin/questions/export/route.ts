import { NextResponse } from "next/server";

import { getAuthenticatedAdmin } from "@/lib/admin/user";
import { getAllQuestionsForExport, questionsToCsv } from "@/lib/admin/questionExport";

export const dynamic = "force-dynamic";

/** Full question-bank dump for manual audit — see questionExport.ts. `?format=csv` downloads a file; anything else (including omitted) returns JSON. */
export async function GET(request: Request) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const format = new URL(request.url).searchParams.get("format");
  const questions = await getAllQuestionsForExport();

  if (format === "csv") {
    return new NextResponse(questionsToCsv(questions), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="questions-export.csv"',
      },
    });
  }

  return NextResponse.json({ questions });
}
