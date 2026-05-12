import { NextResponse } from "next/server";
import { tipFromRow } from "@/lib/tips";

const SPREADSHEET_ID = process.env.TIPS_SPREADSHEET_ID;
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=0`;

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

export async function GET() {
  try {
    if (!SPREADSHEET_ID) {
      return NextResponse.json({ tips: [], error: "TIPS_SPREADSHEET_ID belum diset" });
    }

    const res = await fetch(CSV_URL, {
      redirect: 'follow',
      next: { revalidate: 60 }, // cache 1 menit
    });

    if (!res.ok) {
      return NextResponse.json({ tips: [], error: "Gagal fetch spreadsheet" });
    }

    const csv = await res.text();
    const lines = csv.split('\n').filter(l => l.trim());

    // Skip header row (index 0)
    const rows = lines.slice(1).map(line => parseCSVLine(line));

    const tips = rows
      .map(tipFromRow)
      .filter(tip => tip.status === 'approved' && tip.id)
      .reverse();

    return NextResponse.json({ tips });
  } catch (error: any) {
    console.error("Public Tips API Error:", error);
    return NextResponse.json({ error: error.message, tips: [] });
  }
}
