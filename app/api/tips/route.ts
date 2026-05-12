import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { google } from "googleapis";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized - Please login with Google" }, { status: 401 });
  }

  const spreadsheetId = process.env.TIPS_SPREADSHEET_ID;
  if (!spreadsheetId) {
    return NextResponse.json({ error: "TIPS_SPREADSHEET_ID belum diset" }, { status: 500 });
  }

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const userEmail = session.user.email;
  const isAdmin = userEmail.toLowerCase() === adminEmail?.toLowerCase();

  try {
    const data = await req.json();
    const { title, excerpt, content, problem, solution, result, solvesId } = data;

    const accessToken = (session as any).accessToken;
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const sheets = google.sheets({ version: "v4", auth });

    // Pastikan header ada
    const headerCheck = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Sheet1!A1:Q1",
    });

    if (!headerCheck.data.values || headerCheck.data.values.length === 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: "Sheet1!A1:Q1",
        valueInputOption: "RAW",
        requestBody: {
          values: [["ID", "Slug", "Title", "Excerpt", "Content", "Problem", "Solution", "Result", "Date", "Author", "AuthorEmail", "SolvesId", "Status", "ApprovedBy", "ApprovedAt", "RejectionReason", "Reactions"]],
        },
      });
    }

    const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    const id = Math.random().toString(36).substring(2, 9);
    const date = new Date().toISOString().split('T')[0];
    const reactions = JSON.stringify({ like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 });

    const status = isAdmin ? 'approved' : 'pending';
    const approvedBy = isAdmin ? session.user.name || userEmail : '';
    const approvedAt = isAdmin ? new Date().toISOString() : '';

    // Auto excerpt dari konten jika tidak ada
    const finalExcerpt = excerpt || content.replace(/<[^>]*>/g, '').substring(0, 150) + '...';

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Sheet1!A2",
      valueInputOption: "RAW",
      requestBody: {
        values: [[
          id, slug, title, finalExcerpt, content,
          problem || '', solution || '', result || '',
          date, session.user.name || "User", userEmail,
          solvesId || "", status, approvedBy, approvedAt, '', reactions
        ]],
      },
    });

    return NextResponse.json({
      success: true, slug, spreadsheetId, status,
      message: isAdmin ? 'Artikel berhasil dipublish!' : 'Artikel dikirim, menunggu persetujuan admin'
    });
  } catch (error: any) {
    console.error("Save Tip Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
