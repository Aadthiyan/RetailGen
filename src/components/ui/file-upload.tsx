"use client";

import React, { useRef, useCallback } from "react";

type AcceptMap = Record<string, string[]>;

type FileUploadProps = {
  onUpload: (files: File[]) => Promise<void> | void;
  disabled?: boolean;
  accept?: AcceptMap;
  multiple?: boolean;
};

export function FileUpload({ onUpload, disabled, accept, multiple = true }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const arr = Array.from(files);
      await onUpload(arr);
    },
    [onUpload]
  );

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    // reset value so same file can be selected again
    if (inputRef.current) inputRef.current.value = "";
  };

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    if (disabled) return;
    handleFiles(e.dataTransfer.files);
  };

  const onDragOver: React.DragEventHandler = (e) => e.preventDefault();

  const acceptAttr = accept
    ? Object.entries(accept)
        .map(([k, exts]) => `${k},${exts.join(",")}`)
        .join(",")
    : undefined;

  return (
    <div>
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        className={"w-full p-6 border-2 border-dashed rounded-md text-center cursor-pointer " + (disabled ? "opacity-60 pointer-events-none" : "")}
        onClick={() => inputRef.current?.click()}
        role="button"
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          multiple={multiple}
          onChange={onChange}
          accept={acceptAttr}
          disabled={disabled}
        />
        <div className="text-sm text-gray-600">Drag & drop files here, or click to select</div>
      </div>
    </div>
  );
}

export default FileUpload;
