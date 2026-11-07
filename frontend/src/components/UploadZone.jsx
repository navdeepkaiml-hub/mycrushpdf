import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";

export default function UploadZone({ accept, multiple, onFiles, hint, testId = "upload-zone", compact = false }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    onFiles(Array.from(e.dataTransfer.files || []));
  };

  return (
    <div
      data-testid={testId}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      role="button"
      tabIndex={0}
      aria-label={multiple ? "Choose files to upload" : "Choose a file to upload"}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); inputRef.current?.click(); } }}
      className={`group cursor-pointer rounded-2xl border-2 border-dashed text-center transition-colors ${compact ? "p-5" : "p-8 sm:p-12"} ${
        dragging ? "border-brand bg-brand/10" : "border-brand/30 bg-surface hover:border-brand hover:bg-brand/5"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        data-testid={`${testId}-input`}
        className="hidden"
        onChange={(e) => {
          onFiles(Array.from(e.target.files || []));
          e.target.value = "";
        }}
      />
      {!compact && (
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand text-white shadow-lg shadow-brand/25 transition-transform group-hover:-translate-y-0.5">
          <UploadCloud className="h-7 w-7" aria-hidden="true" />
        </span>
      )}
      <p className={`${compact ? "" : "mt-4"} text-base font-semibold text-ink`}>
        {compact ? "+ Add more files" : multiple ? "Drop your files here" : "Drop your file here"}
      </p>
      {!compact && (
        <p className="mt-1 text-sm text-slate-500">
          or <span className="font-semibold text-brand">choose from your device</span>
        </p>
      )}
      {hint && <p data-testid={`${testId}-hint`} className="mt-3 text-xs font-medium text-slate-500">{hint}</p>}
    </div>
  );
}
