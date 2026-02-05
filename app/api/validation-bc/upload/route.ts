// API Route: POST /api/validation-bc/upload
// Upload de pièces jointes pour les documents de validation

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

interface UploadResponse {
  success: boolean;
  files: Array<{
    id: string;
    filename: string;
    originalName: string;
    size: number;
    mimeType: string;
    url: string;
    uploadedAt: string;
  }>;
  message: string;
}

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/jpg',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Génère un nom de fichier unique
 */
function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  const ext = originalName.split('.').pop();
  return `${timestamp}-${random}.${ext}`;
}

/**
 * Valide un fichier
 */
function validateFile(file: File): { valid: boolean; error?: string } {
  // Vérifier le type MIME
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Type de fichier non autorisé: ${file.type}. Types acceptés: PDF, images, Excel, Word`,
    };
  }

  // Vérifier la taille
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `Fichier trop volumineux: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum: 10MB`,
    };
  }

  return { valid: true };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const documentId = formData.get('documentId') as string;
    const category = formData.get('category') as string; // 'bon_commande', 'facture', 'devis', 'justificatif'

    if (!documentId) {
      return NextResponse.json({ error: 'documentId requis' }, { status: 400 });
    }

    if (files.length === 0) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    const uploadedFiles: UploadResponse['files'] = [];
    const errors: string[] = [];

    // Créer le dossier d'upload si nécessaire
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'validation-bc', documentId);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Traiter chaque fichier
    for (const file of files) {
      // Valider
      const validation = validateFile(file);
      if (!validation.valid) {
        errors.push(`${file.name}: ${validation.error}`);
        continue;
      }

      try {
        // Générer nom unique
        const filename = generateUniqueFilename(file.name);
        const filepath = join(uploadDir, filename);

        // Convertir en Buffer et sauvegarder
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filepath, buffer);

        // Ajouter aux résultats
        uploadedFiles.push({
          id: `file-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          filename,
          originalName: file.name,
          size: file.size,
          mimeType: file.type,
          url: `/uploads/validation-bc/${documentId}/${filename}`,
          uploadedAt: new Date().toISOString(),
        });

        console.log(`[validation-bc/upload] Uploaded: ${file.name} (${(file.size / 1024).toFixed(2)}KB)`);
      } catch (error) {
        errors.push(`${file.name}: Erreur d'enregistrement`);
        console.error(`[validation-bc/upload] Error saving ${file.name}:`, error);
      }
    }

    const response: UploadResponse = {
      success: uploadedFiles.length > 0,
      files: uploadedFiles,
      message:
        uploadedFiles.length > 0
          ? `${uploadedFiles.length} fichier(s) uploadé(s) avec succès${errors.length > 0 ? `, ${errors.length} erreur(s)` : ''}`
          : 'Aucun fichier uploadé',
    };

    if (errors.length > 0) {
      console.warn('[validation-bc/upload] Errors:', errors);
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('[validation-bc/upload] Error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

/**
 * GET - Liste les fichiers d'un document
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');

    if (!documentId) {
      return NextResponse.json({ error: 'documentId requis' }, { status: 400 });
    }

    // En production, récupérer depuis la DB
    // Pour l'instant, retourner mock data
    const mockFiles = [
      {
        id: 'file-1',
        filename: 'bon-commande.pdf',
        originalName: 'Bon_de_commande_BC-2024-001.pdf',
        size: 245780,
        mimeType: 'application/pdf',
        url: `/uploads/validation-bc/${documentId}/bon-commande.pdf`,
        uploadedAt: '2024-01-15T10:00:00Z',
        uploadedBy: 'Jean DUPONT',
        category: 'bon_commande',
      },
    ];

    return NextResponse.json({
      documentId,
      files: mockFiles,
      total: mockFiles.length,
    });
  } catch (error) {
    console.error('[validation-bc/upload/list] Error:', error);
    return NextResponse.json({ error: 'Failed to list files' }, { status: 500 });
  }
}

/**
 * DELETE - Supprime un fichier
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');

    if (!fileId) {
      return NextResponse.json({ error: 'fileId requis' }, { status: 400 });
    }

    // En production, supprimer le fichier physique et la DB entry
    console.log(`[validation-bc/upload] Deleted file: ${fileId}`);

    return NextResponse.json({
      success: true,
      message: 'Fichier supprimé avec succès',
      fileId,
    });
  } catch (error) {
    console.error('[validation-bc/upload/delete] Error:', error);
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
}

