// frontend/src/components/Dropzone.tsx
import { useState, useRef, type ReactNode } from 'react';
import { UploadCloud, X, FileText, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface FileItem {
  name: string;
  type: string;
  size: string;
}

interface DropzoneProps {
  label: string;
  description?: string;
  required?: boolean;
  multiple?: boolean;
  accept?: string;
  maxSizeMB?: number;  // ← NEW
  onFilesChange?: (files: FileItem[]) => void;
  onFilesSelected?: (files: File[]) => void;
}

export function Dropzone({
  label,
  description,
  required,
  multiple = true,
  accept = '.pdf,.doc,.docx',
  maxSizeMB = 25,        // ← NEW default
  onFilesChange,
  onFilesSelected,
}: DropzoneProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;

    const MAX_SIZE = maxSizeMB * 1024 * 1024;
    const realFiles: File[] = [];
    const rejectedFiles: string[] = [];

    Array.from(fileList).forEach((file) => {
      if (file.size > MAX_SIZE) {
        rejectedFiles.push(`${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB)`);
      } else {
        realFiles.push(file);
      }
    });

    if (rejectedFiles.length > 0) {
      toast.error(
        `These files are too large (max ${maxSizeMB}MB): ${rejectedFiles.join(', ')}`,
        { duration: 6000 }
      );
    }

    if (realFiles.length === 0) return;

    const newFiles: FileItem[] = realFiles.map((f) => ({
      name: f.name,
      type: f.name.split('.').pop()?.toUpperCase() || 'FILE',
      size:
        f.size > 1024 * 1024
          ? `${(f.size / 1024 / 1024).toFixed(1)} MB`
          : `${Math.round(f.size / 1024)} KB`,
    }));

    const updated = multiple ? [...files, ...newFiles] : newFiles;
    const updatedRealFiles = multiple ? [...realFiles] : realFiles;

    setFiles(updated);
    onFilesChange?.(updated);
    onFilesSelected?.(updatedRealFiles);
  };

  const removeFile = (idx: number) => {
    const updated = files.filter((_, i) => i !== idx);
    setFiles(updated);
    onFilesChange?.(updated);
    // Note: for accuracy, also update real files if you need removal tracking
  };

   return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      {description && (
        <p className="mb-2 text-xs text-muted-foreground">{description}</p>
      )}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors',
          dragging
            ? 'border-accent bg-accent/5'
            : 'border-border hover:border-accent/50 hover:bg-secondary/30'
        )}
      >
        <UploadCloud className="mb-2 h-7 w-7 text-muted-foreground" />
        <p className="text-sm font-medium">Click to upload or drag & drop</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {accept.replace(/\./g, '').toUpperCase()} · Max {maxSizeMB}MB
        </p>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          multiple={multiple}
          accept={accept}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map((file, idx) => (
            <li
              key={idx}
              className="flex items-center gap-2.5 rounded-md border border-border/60 bg-secondary/30 px-3 py-2 text-sm"
            >
              {file.type === 'PDF' ? (
                <FileText className="h-4 w-4 text-rose-500" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-success" />
              )}
              <span className="flex-1 truncate font-medium">{file.name}</span>
              <span className="text-xs text-muted-foreground">{file.size}</span>
              <button
                onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                className="rounded-sm p-0.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}