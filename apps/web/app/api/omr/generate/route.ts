import { NextRequest, NextResponse } from "next/server";

import { ExamType } from "@vedicneev/db";
import { generateOmrSheetSpec, type OmrExamType } from "@vedicneev/engine";

import { generateOfflineMockSession, getOfflineMockSessionByCode } from "@/lib/exam/offlineOmrService";
import { escapeHtml, renderOmrPrintHtml } from "@/lib/omr/renderOmrPrintHtml";

// Draws real questions and (in the "generate" branch) writes a new
// OfflineMockSession row — never cache or statically collect this route.
export const dynamic = "force-dynamic";

const VALID_EXAM_TYPES = new Set<string>(Object.values(ExamType));
const MAX_TOTAL_QUESTIONS = 200;

type ResponseFormat = "json" | "html";

type ParsedRequest =
  | { kind: "lookup"; serialCode: string; format: ResponseFormat }
  | { kind: "generate"; examType: ExamType; classLevel: number; totalQuestions: number; format: ResponseFormat };

interface RawParams {
  serialCode?: string;
  examType?: string;
  classLevel?: string;
  totalQuestions?: string;
  format?: string;
}

/**
 * Shared query-string/JSON-body parsing for both HTTP verbs below. A
 * `serialCode` means "reprint this exact set" and short-circuits every
 * other field (see getOfflineMockSessionByCode — it never redraws
 * questions); otherwise examType/classLevel/totalQuestions must all be
 * present and valid to draw a fresh set.
 */
function parseParams(raw: RawParams): ParsedRequest | { error: string } {
  const format: ResponseFormat = raw.format === "html" ? "html" : "json";
  const serialCode = raw.serialCode?.trim();

  if (serialCode) {
    return { kind: "lookup", serialCode, format };
  }

  if (!raw.examType || !VALID_EXAM_TYPES.has(raw.examType)) {
    return { error: `"examType" must be one of: ${[...VALID_EXAM_TYPES].join(", ")}.` };
  }

  const classLevel = Number(raw.classLevel);
  if (!Number.isInteger(classLevel) || classLevel < 1 || classLevel > 12) {
    return { error: `"classLevel" must be an integer between 1 and 12.` };
  }

  const totalQuestions = Number(raw.totalQuestions);
  if (!Number.isInteger(totalQuestions) || totalQuestions < 1 || totalQuestions > MAX_TOTAL_QUESTIONS) {
    return { error: `"totalQuestions" must be an integer between 1 and ${MAX_TOTAL_QUESTIONS}.` };
  }

  return { kind: "generate", examType: raw.examType as ExamType, classLevel, totalQuestions, format };
}

const OMR_EXAM_TYPES = new Set<OmrExamType>(["JNVST", "AISSEE", "RMS", "OTHER"]);

/**
 * OmrSheetSpec's geometry type predates the DPS exam type and doesn't carry
 * a dedicated preset for it. `examType` on the spec is purely cosmetic
 * (never used in the bubble-position math — see generateOmrSheetSpec), so
 * falling back to "OTHER"'s layout for DPS is safe rather than a real gap.
 */
function toOmrExamType(examType: ExamType): OmrExamType {
  return OMR_EXAM_TYPES.has(examType as OmrExamType) ? (examType as OmrExamType) : "OTHER";
}

function errorResponse(message: string, status: number, format: ResponseFormat): NextResponse {
  if (format === "html") {
    return new NextResponse(`<!doctype html><title>OMR set error</title><p>${escapeHtml(message)}</p>`, {
      status,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
  return NextResponse.json({ error: message }, { status });
}

/**
 * Not a real student session yet (this app has no server-side auth session
 * to check — see the same gap called out on /api/exams/jnvst/generate-mock),
 * so every set generated here is anonymous (OfflineMockSession.userId stays
 * null) until that auth project lands.
 */
async function handle(parsed: ParsedRequest): Promise<NextResponse> {
  const result =
    parsed.kind === "lookup"
      ? await getOfflineMockSessionByCode(parsed.serialCode)
      : await generateOfflineMockSession({
          examType: parsed.examType,
          classLevel: parsed.classLevel,
          totalQuestions: parsed.totalQuestions,
        });

  if ("error" in result) {
    const status = parsed.kind === "lookup" ? 404 : 503;
    return errorResponse(result.error, status, parsed.format);
  }

  const { session } = result;
  const warnings = "warnings" in result ? result.warnings : [];

  const omrSpec = generateOmrSheetSpec({
    examType: toOmrExamType(session.examType),
    totalQuestions: session.totalQuestions,
  });

  if (parsed.format === "html") {
    const html = renderOmrPrintHtml(omrSpec, {
      serialCode: session.serialCode,
      examLabel: session.examType,
      classLevel: session.classLevel,
    });
    return new NextResponse(html, { status: 200, headers: { "content-type": "text/html; charset=utf-8" } });
  }

  return NextResponse.json({ success: true, session, omrSpec, warnings });
}

/**
 * GET reads examType/classLevel/totalQuestions/serialCode/format from the
 * query string — deliberately supported (not just POST) so
 * `/api/omr/generate?examType=JNVST&classLevel=6&totalQuestions=80&format=html`
 * is a plain link a browser tab (or an <a href>) can open directly for
 * printing, which a POST-only endpoint couldn't offer.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const parsed = parseParams({
    serialCode: searchParams.get("serialCode") ?? undefined,
    examType: searchParams.get("examType") ?? undefined,
    classLevel: searchParams.get("classLevel") ?? undefined,
    totalQuestions: searchParams.get("totalQuestions") ?? undefined,
    format: searchParams.get("format") ?? undefined,
  });
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
  return handle(parsed);
}

function toOptionalString(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return undefined;
}

/** POST accepts the same fields as a JSON body — the structured-data path for programmatic callers. */
export async function POST(request: NextRequest) {
  const body: unknown = await request.json().catch(() => ({}));
  const record = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};

  const parsed = parseParams({
    serialCode: toOptionalString(record.serialCode),
    examType: toOptionalString(record.examType),
    classLevel: toOptionalString(record.classLevel),
    totalQuestions: toOptionalString(record.totalQuestions),
    format: toOptionalString(record.format),
  });
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
  return handle(parsed);
}
