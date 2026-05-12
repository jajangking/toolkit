import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { google } from "googleapis";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const userEmail = session?.user?.email;

  // Only admin can migrate
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
      return NextResponse.json({ error: "Spreadsheet not found" }, { status: 404 });
    }

    // Get current data
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Sheet1!A1:I100",
    });

    const rows = response.data.values || [];

    // Update header to new schema
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: "Sheet1!A1:Q1",
      valueInputOption: "RAW",
      requestBody: {
        values: [["ID", "Slug", "Title", "Excerpt", "Content", "Problem", "Solution", "Result", "Date", "Author", "AuthorEmail", "SolvesId", "Status", "ApprovedBy", "ApprovedAt", "RejectionReason", "Reactions"]],
      },
    });

    // Migrate existing data (skip header)
    const migratedRows = [];
    for (let i = 1; i < rows.length; i++) {
      const oldRow = rows[i];
      // Old schema: A: ID, B: Slug, C: Title, D: Excerpt, E: Content, F: Date, G: Author, H: SolvesId, I: Reactions
      // New schema: A-Q (17 columns)
      const newRow = [
        oldRow[0] || '', // ID
        oldRow[1] || '', // Slug
        oldRow[2] || '', // Title
        oldRow[3] || '', // Excerpt
        oldRow[4] || '', // Content
        '', // Problem (new)
        '', // Solution (new)
        '', // Result (new)
        oldRow[5] || '', // Date
        oldRow[6] || '', // Author
        '', // AuthorEmail (new - empty for old data)
        oldRow[7] || '', // SolvesId
        'approved', // Status (old data assumed approved)
        oldRow[6] || 'Admin', // ApprovedBy (use author name)
        oldRow[5] || '', // ApprovedAt (use date)
        '', // RejectionReason
        oldRow[8] || '{"like":0,"love":0,"haha":0,"wow":0,"sad":0,"angry":0}', // Reactions
      ];
      migratedRows.push(newRow);
    }

    // Write migrated data
    if (migratedRows.length > 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Sheet1!A2:Q${migratedRows.length + 1}`,
        valueInputOption: "RAW",
        requestBody: {
          values: migratedRows,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Migrated ${migratedRows.length} articles to new schema`,
      spreadsheetId,
    });
  } catch (error: any) {
    console.error("Migration Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
