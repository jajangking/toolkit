import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { google } from "googleapis";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const userEmail = session?.user?.email;

  // Only admin can access
  if (!session || !userEmail || userEmail.toLowerCase() !== adminEmail?.toLowerCase()) {
    return NextResponse.json({ error: "Unauthorized - Admin only" }, { status: 401 });
  }

  try {
    const accessToken = (session as any).accessToken;
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const sheets = google.sheets({ version: "v4", auth });
    const drive = google.drive({ version: "v3", auth });

    // Find spreadsheet
    const search = await drive.files.list({
      q: "name='Toolkit Blog Tips' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false",
      fields: "files(id, name)",
    });

    const spreadsheetId = search.data.files?.[0]?.id;
    if (!spreadsheetId) {
      return NextResponse.json({ error: "Spreadsheet not found", rows: [] });
    }

    // Get all rows
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Sheet1!A1:Q100",
    });

    const rows = response.data.values || [];

    return NextResponse.json({
      spreadsheetId,
      totalRows: rows.length,
      header: rows[0],
      rows: rows.slice(1, 10) // Return first 9 data rows for debugging
    });
  } catch (error: any) {
    console.error("Debug Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
