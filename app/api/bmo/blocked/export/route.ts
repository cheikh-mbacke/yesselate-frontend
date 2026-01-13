export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/bmo/blocked/export
 * Exporter les dossiers bloqués (Excel, PDF, CSV)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      format, // 'excel' | 'pdf' | 'csv' | 'json'
      filters,
      columns,
      includeComments,
      includeAuditLog,
    } = body;
    
    // Validation
    if (!format || !['excel', 'pdf', 'csv', 'json'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format. Must be: excel, pdf, csv, or json' },
        { status: 400 }
      );
    }
    
    // Build where clause from filters
    const where: any = {};
    
    if (filters) {
      if (filters.impact && filters.impact !== 'all') {
        where.impact = filters.impact;
      }
      
      if (filters.bureau) {
        where.bureauCode = filters.bureau;
      }
      
      if (filters.status) {
        where.status = filters.status;
      }
      
      if (filters.minDelay) {
        where.delay = { gte: filters.minDelay };
      }
      
      if (filters.maxDelay) {
        if (where.delay) {
          where.delay.lte = filters.maxDelay;
        } else {
          where.delay = { lte: filters.maxDelay };
        }
      }
      
      if (filters.dateFrom || filters.dateTo) {
        where.createdAt = {};
        if (filters.dateFrom) {
          where.createdAt.gte = new Date(filters.dateFrom);
        }
        if (filters.dateTo) {
          where.createdAt.lte = new Date(filters.dateTo);
        }
      }
    }
    
    // Récupérer les dossiers
    const dossiers = await prisma.blockedDossier.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      include: {
        comments: includeComments || false,
        auditLog: includeAuditLog || false,
      },
    });
    
    // Préparer les données pour export
    const exportData = dossiers.map(d => {
      const data: any = {
        'Référence': d.refNumber,
        'Sujet': d.subject,
        'Description': d.description,
        'Impact': d.impact,
        'Type': d.type,
        'Statut': d.status,
        'Bureau': d.bureauCode,
        'Priorité': d.priority,
        'Délai (jours)': d.delay,
        'Montant': d.amount,
        'Assigné à': d.assignedToName,
        'Créé le': d.createdAt.toISOString(),
        'Résolu le': d.resolvedAt?.toISOString() || '-',
      };
      
      // Filter columns if specified
      if (columns && Array.isArray(columns)) {
        const filtered: any = {};
        columns.forEach(col => {
          if (data[col] !== undefined) {
            filtered[col] = data[col];
          }
        });
        return filtered;
      }
      
      return data;
    });
    
    // En production, générer le fichier réel (Excel, PDF, CSV)
    // Pour l'instant, retourner les données en JSON
    
    if (format === 'json') {
      return NextResponse.json({
        success: true,
        format,
        data: exportData,
        count: exportData.length,
        exportedAt: new Date().toISOString(),
      });
    }
    
    // TODO: Implémenter la génération de fichiers Excel/PDF/CSV
    // Utiliser des bibliothèques comme:
    // - xlsx pour Excel
    // - jsPDF ou pdfkit pour PDF
    // - csv-writer pour CSV
    
    // Pour l'instant, simuler le fichier
    const filename = `blocked-dossiers-${Date.now()}.${format}`;
    const fileUrl = `/exports/${filename}`; // Mock URL
    
    return NextResponse.json({
      success: true,
      format,
      filename,
      fileUrl,
      count: exportData.length,
      exportedAt: new Date().toISOString(),
      message: `Export ${format.toUpperCase()} généré avec succès`,
      // En développement, inclure les données
      data: process.env.NODE_ENV === 'development' ? exportData : undefined,
    });
    
  } catch (error) {
    console.error('Error exporting blocked dossiers:', error);
    return NextResponse.json(
      { error: 'Failed to export blocked dossiers', details: String(error) },
      { status: 500 }
    );
  }
}

