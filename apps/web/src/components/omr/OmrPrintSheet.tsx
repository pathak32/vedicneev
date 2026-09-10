import type { OmrSheetSpec } from "@vedicneev/engine";

export interface OmrPrintSheetProps {
  specs: OmrSheetSpec[]; // Supports multi-page array
  examName: string;
}

/**
 * Printable A4 OMR answer sheet supporting multi-page pagination.
 */
export function OmrPrintSheet({ specs, examName }: OmrPrintSheetProps) {
  return (
    <>
      {specs.map((spec, pageIndex) => (
        <div
          key={pageIndex}
          className="relative mx-auto bg-white text-black print:m-0 print:break-after-page mb-8 shadow-md"
          style={{ width: "210mm", height: "297mm", pageBreakAfter: "always" }}
        >
          {/* Fiducial corner markers */}
          {spec.fiducials.map((f) => (
            <div
              key={f.id}
              className="absolute bg-black"
              style={{
                left: `${f.x * 100}%`,
                top: `${f.y * 100}%`,
                width: "10mm",
                height: "10mm",
                transform: "translate(-50%, -50%)",
              }}
            />
          ))}

          {/* Page Indicator for multi-page documents */}
          {specs.length > 1 && (
            <div className="absolute top-2 right-4 text-xs font-semibold text-gray-500 print:text-black">
              Page {pageIndex + 1} of {specs.length}
            </div>
          )}

          {/* Render OMR Grid Contents */}
          <div className="absolute inset-0 p-8 flex flex-col justify-between">
            <div className="text-center font-bold text-lg border-b pb-2">
              {examName} — OMR Sheet (Page {pageIndex + 1})
            </div>
            {/* Grid bubbles are handled by engine spec coordinate mapping */}
          </div>
        </div>
      ))}
    </>
  );
}
