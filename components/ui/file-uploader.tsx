'use client';

import React, { useCallback, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Upload,
  X,
  File,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  FileArchive,
  Film,
  Music,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface FileUploaderProps {
  onFilesSelected?: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number; // en MB
  acceptedTypes?: string[];
  className?: string;
}

interface UploadedFile {
  file: File;
  id: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

// ============================================
// HELPERS
// ============================================

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

const getFileIcon = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) {
    return <ImageIcon className="w-5 h-5 text-blue-500" />;
  }
  if (['pdf'].includes(ext || '')) {
    return <FileText className="w-5 h-5 text-rose-500" />;
  }
  if (['doc', 'docx', 'txt'].includes(ext || '')) {
    return <FileText className="w-5 h-5 text-blue-600" />;
  }
  if (['xls', 'xlsx', 'csv'].includes(ext || '')) {
    return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
  }
  if (['zip', 'rar', '7z'].includes(ext || '')) {
    return <FileArchive className="w-5 h-5 text-amber-600" />;
  }
  if (['mp4', 'avi', 'mov'].includes(ext || '')) {
    return <Film className="w-5 h-5 text-purple-600" />;
  }
  if (['mp3', 'wav', 'ogg'].includes(ext || '')) {
    return <Music className="w-5 h-5 text-pink-600" />;
  }
  
  return <File className="w-5 h-5 text-slate-400" />;
};

// ============================================
// COMPONENT
// ============================================

export function FileUploader({
  onFilesSelected,
  maxFiles = 10,
  maxSize = 10, // 10 MB par défaut
  acceptedTypes = [],
  className,
}: FileUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;

      const fileArray = Array.from(files);
      const validFiles: File[] = [];
      const errors: string[] = [];

      // Validation
      for (const file of fileArray) {
        // Vérifier le nombre max de fichiers
        if (uploadedFiles.length + validFiles.length >= maxFiles) {
          errors.push(`Maximum ${maxFiles} fichiers autorisés`);
          break;
        }

        // Vérifier la taille
        if (file.size > maxSize * 1024 * 1024) {
          errors.push(`${file.name} dépasse ${maxSize}MB`);
          continue;
        }

        // Vérifier le type (si spécifié)
        if (acceptedTypes.length > 0) {
          const ext = file.name.split('.').pop()?.toLowerCase();
          if (!ext || !acceptedTypes.includes(ext)) {
            errors.push(`${file.name} - type non autorisé`);
            continue;
          }
        }

        validFiles.push(file);
      }

      // Ajouter les fichiers valides
      if (validFiles.length > 0) {
        const newFiles: UploadedFile[] = validFiles.map((file) => ({
          file,
          id: `${Date.now()}-${Math.random()}`,
          progress: 0,
          status: 'uploading',
        }));

        setUploadedFiles((prev) => [...prev, ...newFiles]);
        onFilesSelected?.(validFiles);

        // Simuler l'upload
        newFiles.forEach((uploadedFile) => {
          simulateUpload(uploadedFile.id);
        });
      }

      // Afficher les erreurs (à connecter avec un toast)
      if (errors.length > 0) {
        console.error('Erreurs upload:', errors);
      }
    },
    [uploadedFiles.length, maxFiles, maxSize, acceptedTypes, onFilesSelected]
  );

  const simulateUpload = (fileId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      
      if (progress >= 100) {
        clearInterval(interval);
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === fileId ? { ...f, progress: 100, status: 'success' } : f
          )
        );
      } else {
        setUploadedFiles((prev) =>
          prev.map((f) => (f.id === fileId ? { ...f, progress } : f))
        );
      }
    }, 300);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const removeFile = useCallback((fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  }, []);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'relative border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer',
          isDragOver
            ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
        )}
      >
        <input
          type="file"
          multiple={maxFiles > 1}
          accept={acceptedTypes.length > 0 ? acceptedTypes.map((t) => `.${t}`).join(',') : undefined}
          onChange={(e) => handleFiles(e.target.files)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="text-center">
          <Upload
            className={cn(
              'w-12 h-12 mx-auto mb-4',
              isDragOver ? 'text-orange-500' : 'text-slate-400'
            )}
          />
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">
            {isDragOver ? 'Déposez les fichiers ici' : 'Glissez-déposez vos fichiers'}
          </p>
          <p className="text-sm text-slate-500">
            ou cliquez pour parcourir
          </p>
          <p className="text-xs text-slate-400 mt-2">
            Max {maxFiles} fichiers • {maxSize}MB par fichier
            {acceptedTypes.length > 0 && ` • ${acceptedTypes.join(', ')}`}
          </p>
        </div>
      </div>

      {/* Uploaded files list */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          {uploadedFiles.map((uploadedFile) => (
            <div
              key={uploadedFile.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            >
              {/* Icon */}
              <div className="flex-shrink-0">
                {getFileIcon(uploadedFile.file.name)}
              </div>

              {/* File info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                    {uploadedFile.file.name}
                  </span>
                  <span className="text-xs text-slate-400 ml-2">
                    {formatFileSize(uploadedFile.file.size)}
                  </span>
                </div>

                {/* Progress bar */}
                {uploadedFile.status === 'uploading' && (
                  <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500 transition-all duration-300"
                      style={{ width: `${uploadedFile.progress}%` }}
                    />
                  </div>
                )}

                {uploadedFile.status === 'success' && (
                  <div className="flex items-center gap-1 text-xs text-emerald-600">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Envoyé</span>
                  </div>
                )}

                {uploadedFile.status === 'error' && (
                  <div className="flex items-center gap-1 text-xs text-rose-600">
                    <AlertCircle className="w-3 h-3" />
                    <span>{uploadedFile.error || 'Erreur'}</span>
                  </div>
                )}
              </div>

              {/* Status icon */}
              <div className="flex-shrink-0">
                {uploadedFile.status === 'uploading' && (
                  <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
                )}
                {uploadedFile.status === 'success' && (
                  <button
                    onClick={() => removeFile(uploadedFile.id)}
                    className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                )}
                {uploadedFile.status === 'error' && (
                  <button
                    onClick={() => removeFile(uploadedFile.id)}
                    className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

