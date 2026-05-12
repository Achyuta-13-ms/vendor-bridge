"use client";

import React, { useState, useCallback } from 'react';
import { cn } from "@/lib/utils";
import axios from 'axios';
import { UploadCloud, CheckCircle2, XCircle, File as FileIcon, X, Loader2 } from "lucide-react";
import { Button } from "./button";


interface FileUploadProps {
  onUpload: (url: string) => void;
  accept?: string;
  className?: string;
  label?: string;
  path?: string;
  initialUrl?: string;
}

export function FileUpload({ onUpload, accept = ".pdf,.jpg,.png", className, label = "Upload Document", path = "temp", initialUrl }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">(initialUrl ? "success" : "idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const processFile = useCallback(async (file: File) => {
    // Client-side validation
    const MAX_SIZE = 4 * 1024 * 1024; // 4MB
    const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

    if (file.size > MAX_SIZE) {
      setStatus("error");
      setErrorMessage("File too large. Please upload a file under 4 MB.");
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setStatus("error");
      setErrorMessage("Invalid file type. Please upload a PDF, JPG, or PNG.");
      return;
    }

    setFile(file);
    setStatus("uploading");
    setProgress(0);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("path", path);

    try {
      const res = await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percentCompleted);
          }
        },
      });

      if (res.data.success) {
        setProgress(100);
        setStatus("success");
        onUpload(res.data.url);
      } else {
        throw new Error(res.data.message || "Upload failed");
      }
    } catch (err: any) {
      console.error("Upload error", err);
      setStatus("error");
      setErrorMessage(err?.response?.data?.message || err.message || "File upload failed");
      setFile(null);
    }
  }, [onUpload, path]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [processFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  }, [processFile]);

  if (status === "success" && (file || initialUrl)) {
    return (
      <div className={cn("rounded-lg border bg-success/5 border-success/30 p-4 flex items-center justify-between animate-in fade-in zoom-in duration-300", className)}>
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-8 w-8 text-success" />
          <div className="overflow-hidden">
            <p className="text-sm font-medium truncate max-w-[200px]">{file?.name || "Document Uploaded"}</p>
            <p className="text-xs text-muted-foreground">{file ? `${(file.size / 1024).toFixed(1)} KB` : "Stored securely"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {initialUrl && (
            <a 
              href={initialUrl} 
              target="_blank" 
              rel="noreferrer"
              className="p-2 hover:bg-success/10 rounded-full transition-colors"
            >
              <FileIcon className="h-4 w-4 text-success" />
            </a>
          )}
          <Button variant="ghost" size="icon" className="hover:bg-destructive/10 hover:text-destructive" onClick={() => {
            setFile(null);
            setStatus("idle");
            setProgress(0);
            onUpload("");
          }}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "relative rounded-lg border-2 border-dashed p-6 transition-all hover:bg-muted/50 text-center flex flex-col items-center justify-center gap-2",
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          status === "error" ? "border-destructive/50 bg-destructive/5" : "",
          className
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          disabled={status === "uploading"}
        />
        
        {status === "uploading" ? (
          <div className="w-full max-w-xs space-y-3 pointer-events-none">
            <Loader2 className="mx-auto h-8 w-8 text-primary animate-spin" />
            <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
              <div className="bg-primary h-full transition-all duration-200" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-muted-foreground">Uploading... {progress}%</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <div className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center mb-2 pointer-events-none transition-colors",
              status === "error" ? "bg-destructive/10" : "bg-primary/10"
            )}>
              {status === "error" ? (
                <XCircle className="h-5 w-5 text-destructive" />
              ) : (
                <UploadCloud className="h-5 w-5 text-primary" />
              )}
            </div>
            <p className="text-sm font-medium pointer-events-none">
              {status === "error" ? "Upload Failed" : label}
            </p>
            <p className="text-xs text-muted-foreground pointer-events-none">
              {status === "error" ? errorMessage : "Drag and drop or click to browse"}
            </p>
            
            {status === "error" && (
              <Button 
                type="button"
                variant="outline" 
                size="sm" 
                className="mt-2 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  setStatus("idle");
                  setErrorMessage(null);
                }}
              >
                Try Again
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
