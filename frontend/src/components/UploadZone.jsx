import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";

export default function UploadZone({ accept, multiple, onFiles, testId = "upload-zone" }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length) onFiles(files);
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
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click(); }}
      className={`group cursor-pointer rounded-3xl border-2 border-dashed p-10 text-center transition-all sm:p-14 ${
        dragging ? "border-indigo-500 bg-indigo-50" : "border-indigo-300 bg-indigo-50/40 hover:border-indigo-500 hover:bg-indigo-50"
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
          const files = Array.from(e.target.files || []);
          if (files.length) onFiles(files);
          e.target.value = "";
        }}
      />
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 transition-transform group-hover:scale-105">
        <UploadCloud className="h-8 w-8" />
      </span>
      <p className="mt-5 text-lg font-semibold text-slate-900">
        {multiple ? "Drop your files here" : "Drop your file here"}
      </p>
      <p className="mt-1 text-sm text-slate-500">
        or <span className="font-medium text-indigo-600">click to browse</span> from your device
      </p>
    </div>
  );
}
