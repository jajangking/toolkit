import { google } from "googleapis";

export interface Tip {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  problem?: string;
  solution?: string;
  result?: string;
  date: string;
  author: string;
  authorEmail: string;
  solvesId?: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  reactions?: {
    like: number;
    love: number;
    haha: number;
    wow: number;
    sad: number;
    angry: number;
  };
}

// Kolom di Google Sheets (Updated):
// A: ID, B: Slug, C: Title, D: Excerpt, E: Content, F: Problem, G: Solution, H: Result
// I: Date, J: Author, K: AuthorEmail, L: SolvesId, M: Status, N: ApprovedBy, O: ApprovedAt, P: RejectionReason, Q: Reactions (JSON string)

export async function getTips(): Promise<Tip[]> {
  // Untuk publik, kita akan pakai fetch CSV atau API Key jika ada.
  // Tapi untuk sementara, kita buat API Route sebagai proxy.
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL || ''}/api/tips/public`, { 
      next: { revalidate: 60 } // Cache 1 menit
    });
    const data = await res.json();
    return data.tips || [];
  } catch (error) {
    console.error('Error fetching tips from proxy:', error);
    return [];
  }
}

export function parseReactions(jsonStr: string) {
  try {
    return JSON.parse(jsonStr || '{}');
  } catch {
    return { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 };
  }
}

export function tipFromRow(row: any[]): Tip {
  // Reactions selalu kolom terakhir (JSON bisa mengandung koma, shift CSV)
  const reactionsStr = row[row.length - 1] || '';
  return {
    id: row[0] || '',
    slug: row[1] || '',
    title: row[2] || '',
    excerpt: row[3] || '',
    content: row[4] || '',
    problem: row[5] || '',
    solution: row[6] || '',
    result: row[7] || '',
    date: row[8] || '',
    author: row[9] || '',
    authorEmail: row[10] || '',
    solvesId: row[11] || '',
    status: (row[12] || 'draft') as 'draft' | 'pending' | 'approved' | 'rejected',
    approvedBy: row[13] || '',
    approvedAt: row[14] || '',
    rejectionReason: row[15] || '',
    reactions: parseReactions(reactionsStr),
  };
}
