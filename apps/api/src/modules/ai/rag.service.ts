import { prisma } from '../../database/prisma.js';
import { logger } from '../../utils/logger.js';
import { DocumentAccessLevel } from '@prisma/client';

export interface RetrievedChunk {
  documentId: string;
  title: string;
  snippet: string;
  score: number;
}

export class RAGService {
  /**
   * Ingest and chunk a document for the organization
   */
  static async ingestDocument(
    organizationId: string,
    title: string,
    content: string,
    category = 'POLICY',
    accessLevel: DocumentAccessLevel = 'ALL_EMPLOYEES'
  ) {
    const document = await prisma.document.create({
      data: {
        organizationId,
        title,
        category,
        accessLevel,
      },
    });

    // Chunk document (paragraphs or ~400 char segments)
    const paragraphs = content
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 20);

    const chunks = paragraphs.map((text, idx) => ({
      documentId: document.id,
      chunkIndex: idx,
      content: text,
      metadata: { length: text.length },
    }));

    if (chunks.length > 0) {
      await prisma.documentChunk.createMany({
        data: chunks,
      });
    }

    logger.info('Document ingested and chunked for RAG', {
      documentId: document.id,
      title,
      chunksCount: chunks.length,
    });

    return document;
  }

  /**
   * Search knowledge base filtered by tenant and user's authorized access levels
   */
  static async searchKnowledgeBase(
    query: string,
    organizationId: string,
    userRole: string,
    limit = 4
  ): Promise<RetrievedChunk[]> {
    // Determine allowed document access levels based on user's role
    const allowedLevels: DocumentAccessLevel[] = ['ALL_EMPLOYEES'];
    if (['MANAGER', 'HR_MANAGER', 'ORG_ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
      allowedLevels.push('MANAGERS_ONLY');
    }
    if (['HR_MANAGER', 'ORG_ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
      allowedLevels.push('HR_ONLY');
    }
    if (['ORG_ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
      allowedLevels.push('ADMIN_ONLY');
    }

    const queryWords = query
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2);

    // Retrieve candidate chunks for the tenant
    const chunks = await prisma.documentChunk.findMany({
      where: {
        document: {
          organizationId,
          accessLevel: { in: allowedLevels },
        },
      },
      include: {
        document: true,
      },
      take: 50,
    });

    // Score based on term frequency and token matching
    const scoredChunks = chunks
      .map((chunk) => {
        const text = (chunk.content + ' ' + chunk.document.title).toLowerCase();
        let matchCount = 0;
        for (const word of queryWords) {
          if (text.includes(word)) {
            matchCount++;
          }
        }
        const score = queryWords.length > 0 ? matchCount / queryWords.length : 0;
        return {
          documentId: chunk.documentId,
          title: chunk.document.title,
          snippet: chunk.content,
          score: Math.round(score * 100) / 100,
        };
      })
      .filter((c) => c.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return scoredChunks;
  }
}
