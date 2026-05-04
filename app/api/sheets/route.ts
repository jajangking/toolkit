import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { google } from "googleapis";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !(session as any).accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { notes } = await req.json();

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: (session as any).accessToken });

  const sheets = google.sheets({ version: "v4", auth });
  const drive = google.drive({ version: "v3", auth });

  try {
    // 1. Cari file "Toolkit Smart Notes" di Drive
    const response = await drive.files.list({
      q: "name='Toolkit Smart Notes' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false",
      fields: "files(id, name)",
    });

    let spreadsheetId = response.data.files?.[0]?.id;

    // 2. Kalo gak ada, bikin baru
    if (!spreadsheetId) {
      const spreadsheet = await sheets.spreadsheets.create({
        requestBody: {
          properties: { title: "Toolkit Smart Notes" },
        },
      });
      spreadsheetId = spreadsheet.data.spreadsheetId!;
      
      // Kasih Header
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: "Sheet1!A1:C1",
        valueInputOption: "RAW",
        requestBody: {
          values: [["Tanggal", "Catatan", "Total"]],
        },
      });
    }

    // 3. Masukin data
    const values = notes.map((note: any) => {
        // Logika parsing sederhana buat kolom Total
        const standaloneNumbers = note.content.match(/\b\d{1,3}(\.\d{3})*(\,\d+)?\b/g);
        let total = 0;
        if (standaloneNumbers && standaloneNumbers.length > 1) {
            standaloneNumbers.forEach((num: string) => {
                const parsed = parseFloat(num.replace(/\./g, '').replace(/,/g, '.'));
                if (!isNaN(parsed)) total += parsed;
            });
        }

        return [
            new Date(note.createdAt).toLocaleString('id-ID'),
            note.content,
            total > 0 ? total : ""
        ];
    });

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Sheet1!A2",
      valueInputOption: "RAW",
      requestBody: {
        values: values,
      },
    });

    return NextResponse.json({ success: true, spreadsheetId });
  } catch (error: any) {
    console.error("Sheets API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
