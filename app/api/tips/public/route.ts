import { NextResponse } from "next/server";
import { google } from "googleapis";
import { tipFromRow } from "@/lib/tips";

export async function GET() {
  // Untuk publik, kita butuh cara baca tanpa session user.
  // Cara paling gampang buat demo ini adalah pakai API Key atau Service Account.
  // Tapi karena kita mau "Gratis" dan "Simpel", kita sarankan user set Spreadsheet ke "Public (View Only)".
  
  const spreadsheetId = process.env.TIPS_SPREADSHEET_ID;
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!spreadsheetId || !apiKey) {
    return NextResponse.json({ 
      error: "Konfigurasi belum lengkap. Butuh TIPS_SPREADSHEET_ID dan GOOGLE_API_KEY.",
      tips: [] 
    });
  }

  try {
    const sheets = google.sheets({ version: "v4", auth: apiKey });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Sheet1!A2:I100", // Ambil 100 tips terbaru
    });

    const rows = response.data.values || [];
    const tips = rows.map(tipFromRow).reverse(); // Terbaru di atas

    return NextResponse.json({ tips });
  } catch (error: any) {
    console.error("Public Tips API Error:", error);
    return NextResponse.json({ error: error.message, tips: [] });
  }
}
