import { google } from "googleapis";

export interface Tip {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  solvesId?: string;
  reactions?: {
    like: number;
    love: number;
    haha: number;
    wow: number;
    sad: number;
    angry: number;
  };
}

// Kolom di Google Sheets:
// A: ID, B: Slug, C: Title, D: Excerpt, E: Content, F: Date, G: Author, H: SolvesId, I: Reactions (JSON string)

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
  return {
    id: row[0] || '',
    slug: row[1] || '',
    title: row[2] || '',
    excerpt: row[3] || '',
    content: row[4] || '',
    date: row[5] || '',
    author: row[6] || '',
    solvesId: row[7] || '',
    reactions: parseReactions(row[8]),
  };
}
