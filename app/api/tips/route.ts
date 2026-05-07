import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { google } from "googleapis";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  const adminEmail = process.env.ADMIN_EMAIL;
  const userEmail = session?.user?.email;

  if (!session || !userEmail || userEmail.toLowerCase() !== adminEmail?.toLowerCase()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    const { title, excerpt, content, solvesId } = data;

    const accessToken = (session as any).accessToken;
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const sheets = google.sheets({ version: "v4", auth });
    const drive = google.drive({ version: "v3", auth });

    // 1. Cari Spreadsheet "Toolkit Blog Tips"
    const search = await drive.files.list({
      q: "name='Toolkit Blog Tips' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false",
      fields: "files(id, name)",
    });

    let spreadsheetId = search.data.files?.[0]?.id;

    // 2. Bikin kalo belum ada
    if (!spreadsheetId) {
      const ss = await sheets.spreadsheets.create({
        requestBody: { properties: { title: "Toolkit Blog Tips" } },
      });
      spreadsheetId = ss.data.spreadsheetId!;
      
      // Header: A-I
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: "Sheet1!A1:I1",
        valueInputOption: "RAW",
        requestBody: {
          values: [["ID", "Slug", "Title", "Excerpt", "Content", "Date", "Author", "SolvesId", "Reactions"]],
        },
      });
    }

    const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    const id = Math.random().toString(36).substring(2, 9);
    const date = new Date().toISOString().split('T')[0];
    const reactions = JSON.stringify({ like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 });

    // 3. Simpan Row Baru (di paling bawah)
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Sheet1!A2",
      valueInputOption: "RAW",
      requestBody: {
        values: [[id, slug, title, excerpt, content, date, session.user?.name || "Admin", solvesId || "", reactions]],
      },
    });

    return NextResponse.json({ success: true, slug, spreadsheetId });
  } catch (error: any) {
    console.error("Save Tip Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
