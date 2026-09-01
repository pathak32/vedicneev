"use client";

import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, Card, CardContent, cn } from "@vedicneev/ui";
import {
  applyHomography,
  computeHomography,
  detectFiducialCorners,
  evaluateOmrSheet,
  sampleBubbleFillRatio,
  toGrayscale,
  type HomographyMatrix,
  type MarkingScheme,
  type OmrAnswerKeyEntry,
  type OmrQuestionScan,
  type OmrResponseOutcome,
  type OmrSheetEvaluationSummary,
  type OmrSheetSpec,
  type Point,
} from "@vedicneev/engine";
import { AlertTriangle, Camera, CheckCircle2, RotateCcw, Upload, XCircle } from "lucide-react";

import type { ExamSessionData } from "@/lib/exam/types";
import { omrOptionToQuestionOptionId, orderedQuestionIdsForSession } from "@/lib/exam/omr-bridge";
import { useTestStore } from "@/lib/stores/useTestStore";

/** Darkness ratio (0-1) above which a bubble is considered "marked". */
const FILL_THRESHOLD = 0.42;

const OUTCOME_COLOR: Record<OmrResponseOutcome, string | null> = {
  CORRECT: "#22c55e",
  INCORRECT: "#ef4444",
  INVALID_MULTIPLE_FILL: "#eab308",
  UNATTEMPTED: null,
};

export interface OmrScannerProps {
  examId: string;
  session: ExamSessionData;
  spec: OmrSheetSpec;
  answerKey: OmrAnswerKeyEntry[];
  scheme: MarkingScheme;
}

type ScanMode = "camera" | "upload";
type ScanStage = "idle" | "processing" | "done" | "error";

export function OmrScanner({ examId, session, spec, answerKey, scheme }: OmrScannerProps) {
  const router = useRouter();
  const [mode, setMode] = useState<ScanMode>("camera");
  const [stage, setStage] = useState<ScanStage>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<OmrSheetEvaluationSummary | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  // Captured frame + fitted homography, held until the preview <canvas> actually
  // mounts (it's conditionally rendered on stage === "done") so the draw effect
  // below has something to draw once the ref is live.
  const pendingPreviewRef = useRef<{ sourceCanvas: HTMLCanvasElement; homography: HomographyMatrix } | null>(
    null
  );

  // Camera lifecycle: acquire the stream while in camera mode and no photo has been captured yet.
  useEffect(() => {
    if (mode !== "camera" || stage !== "idle") return;
    let cancelled = false;

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch {
        if (!cancelled) setErrorMessage("Couldn't access the camera. Try Upload Photo instead.");
      }
    }

    start();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [mode, stage]);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  function processImage(sourceCanvas: HTMLCanvasElement) {
    setStage("processing");
    setErrorMessage(null);
    stopCamera();

    const ctx = sourceCanvas.getContext("2d");
    if (!ctx) {
      setErrorMessage("Could not read the captured image.");
      setStage("error");
      return;
    }

    const imageData = ctx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
    const gray = toGrayscale(imageData.data, sourceCanvas.width, sourceCanvas.height);

    const fiducialResult = detectFiducialCorners(gray);
    if (!fiducialResult) {
      setErrorMessage(
        "Couldn't find the 4 black corner markers. Make sure the whole sheet is in frame, well-lit, and roughly upright, then try again."
      );
      setStage("error");
      return;
    }

    const idealCorners = spec.fiducials.map((f) => ({ x: f.x, y: f.y })) as [Point, Point, Point, Point];
    const homography = computeHomography(idealCorners, fiducialResult.corners);

    const markedByQuestion = new Map<number, string[]>();
    for (const bubble of spec.bubbles) {
      const fillRatio = sampleBubbleFillRatio(gray, homography, { x: bubble.x, y: bubble.y });
      if (fillRatio > FILL_THRESHOLD) {
        const list = markedByQuestion.get(bubble.questionNumber) ?? [];
        list.push(bubble.option);
        markedByQuestion.set(bubble.questionNumber, list);
      }
    }

    const scans: OmrQuestionScan[] = Array.from({ length: spec.totalQuestions }, (_, i) => ({
      questionNumber: i + 1,
      markedOptions: (markedByQuestion.get(i + 1) ?? []) as OmrQuestionScan["markedOptions"],
    }));

    const summary = evaluateOmrSheet(scans, answerKey, scheme);
    pendingPreviewRef.current = { sourceCanvas, homography };
    setEvaluation(summary);
    setStage("done");
  }

  const drawAnnotatedPreview = useCallback(
    (sourceCanvas: HTMLCanvasElement, homography: HomographyMatrix, summary: OmrSheetEvaluationSummary) => {
      const previewCanvas = previewCanvasRef.current;
      if (!previewCanvas) return;
      previewCanvas.width = sourceCanvas.width;
      previewCanvas.height = sourceCanvas.height;
      const ctx = previewCanvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(sourceCanvas, 0, 0);

      for (const response of summary.responses) {
        const color = OUTCOME_COLOR[response.outcome];
        if (!color) continue;
        const optionsToHighlight =
          response.outcome === "INVALID_MULTIPLE_FILL"
            ? response.markedOptions
            : response.selectedOption
              ? [response.selectedOption]
              : [];
        for (const option of optionsToHighlight) {
          const bubble = spec.bubbles.find(
            (b) => b.questionNumber === response.questionNumber && b.option === option
          );
          if (!bubble) continue;
          const pixel = applyHomography(homography, { x: bubble.x, y: bubble.y });
          ctx.beginPath();
          ctx.arc(pixel.x, pixel.y, Math.max(8, sourceCanvas.width * 0.008), 0, Math.PI * 2);
          ctx.strokeStyle = color;
          ctx.lineWidth = Math.max(2, sourceCanvas.width * 0.002);
          ctx.stroke();
        }
      }
    },
    [spec]
  );

  // The preview <canvas> only mounts once stage flips to "done"; draw into it
  // here, after that mount has actually happened, instead of racing it above.
  useEffect(() => {
    if (stage !== "done" || !evaluation || !pendingPreviewRef.current) return;
    const { sourceCanvas, homography } = pendingPreviewRef.current;
    drawAnnotatedPreview(sourceCanvas, homography, evaluation);
  }, [stage, evaluation, drawAnnotatedPreview]);

  function handleCapture() {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    processImage(canvas);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        processImage(canvas);
      }
      URL.revokeObjectURL(objectUrl);
    };
    img.onerror = () => {
      setErrorMessage("Could not load that image file.");
      setStage("error");
      URL.revokeObjectURL(objectUrl);
    };
    img.src = objectUrl;
  }

  function handleRetry() {
    pendingPreviewRef.current = null;
    setEvaluation(null);
    setErrorMessage(null);
    setStage("idle");
  }

  function handleConfirm() {
    if (!evaluation) return;
    const orderedIds = orderedQuestionIdsForSession(session);
    const selectedOptionsByQuestionId: Record<string, string | undefined> = {};

    for (const response of evaluation.responses) {
      const questionId = orderedIds[response.questionNumber - 1];
      if (!questionId) continue;
      const question = session.questionsById[questionId];
      if (!question) continue;
      selectedOptionsByQuestionId[questionId] = response.selectedOption
        ? omrOptionToQuestionOptionId(question, response.selectedOption)
        : undefined;
    }

    useTestStore.getState().loadExternalSubmission(session, selectedOptionsByQuestionId);
    router.push(`/exam/${examId}/results`);
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4 md:p-8">
      <div>
        <h1 className="text-lg font-bold text-foreground">Scan OMR Sheet</h1>
        <p className="text-sm text-muted-foreground">
          Line up the printed sheet&apos;s 4 black corner markers with the guide, then capture — or upload a photo.
        </p>
      </div>

      {stage !== "done" ? (
        <div className="flex gap-2">
          <Button
            type="button"
            variant={mode === "camera" ? "default" : "outline"}
            onClick={() => {
              setMode("camera");
              setStage("idle");
              setErrorMessage(null);
            }}
          >
            <Camera className="h-4 w-4" />
            Use Camera
          </Button>
          <Button type="button" variant={mode === "upload" ? "default" : "outline"} asChild>
            <label className="cursor-pointer">
              <Upload className="h-4 w-4" />
              Upload Photo
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
          </Button>
        </div>
      ) : null}

      {errorMessage ? (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {errorMessage}
        </div>
      ) : null}

      {mode === "camera" && stage === "idle" ? (
        <Card className="overflow-hidden">
          <div className="relative aspect-[3/4] w-full bg-black">
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
            {/* Alignment overlay: corner brackets roughly matching an A4-portrait sheet. */}
            <div className="pointer-events-none absolute inset-[6%] border-2 border-dashed border-white/70">
              {(["top-0 left-0", "top-0 right-0", "bottom-0 left-0", "bottom-0 right-0"] as const).map((pos) => (
                <span
                  key={pos}
                  className={cn(
                    "absolute h-6 w-6 border-primary",
                    pos.includes("top") ? "top-0 border-t-4" : "bottom-0 border-b-4",
                    pos.includes("left") ? "left-0 border-l-4" : "right-0 border-r-4"
                  )}
                />
              ))}
            </div>
          </div>
          <CardContent className="p-3">
            <Button type="button" className="w-full" onClick={handleCapture}>
              <Camera className="h-4 w-4" />
              Capture
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {stage === "processing" ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Reading bubbles…</p>
      ) : null}

      {stage === "done" && evaluation ? (
        <div className="flex flex-col gap-4">
          <canvas ref={previewCanvasRef} className="w-full rounded-lg border border-border" />

          <div className="grid grid-cols-2 gap-2 text-center text-sm sm:grid-cols-4">
            <div className="flex flex-col items-center gap-1 rounded-lg bg-emerald-500/10 p-3 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
              {evaluation.correctCount} Correct
            </div>
            <div className="flex flex-col items-center gap-1 rounded-lg bg-red-500/10 p-3 text-red-600">
              <XCircle className="h-4 w-4" />
              {evaluation.incorrectCount} Incorrect
            </div>
            <div className="flex flex-col items-center gap-1 rounded-lg bg-muted p-3 text-muted-foreground">
              {evaluation.unattemptedCount} Blank
            </div>
            <div className="flex flex-col items-center gap-1 rounded-lg bg-amber-500/10 p-3 text-amber-600">
              <AlertTriangle className="h-4 w-4" />
              {evaluation.invalidCount} Ambiguous
              <Badge variant="outline" className="text-[10px]">
                multi-fill
              </Badge>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Total marks: <span className="font-semibold text-foreground">{evaluation.totalMarks}</span>
          </p>

          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={handleRetry}>
              <RotateCcw className="h-4 w-4" />
              Rescan
            </Button>
            <Button type="button" className="flex-1" onClick={handleConfirm}>
              Confirm &amp; Generate Diagnostic Report
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
