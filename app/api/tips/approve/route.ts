import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { google } from "googleapis";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const userEmail = session?.user?.email;

  if (!session || !userEmail || userEmail.toLowerCase() !== adminEmail?.toLowerCase()) {
    return NextResponse.json({ error: "Unauthorized - Admin only" }, { status: 401 });
  }

  const spreadsheetId = process.env.TIPS_SPREADSHEET_ID;
  if (!spreadsheetId) {
    return NextResponse.json({ error: "TIPS_SPREADSHEET_ID belum diset" }, { status: 500 });
  }

  try {
    const data = await req.json();
    const { tipId, action, rejectionReason } = data;

    const accessToken = (session as any).accessToken;
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const sheets = google.sheets({ version: "v4", auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Sheet1!A2:Q200",
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex(row => row[0] === tipId);

    if (rowIndex === -1) {
      return NextResponse.json({ error: "Tip not found" }, { status: 404 });
    }

    const actualRowNumber = rowIndex + 2;
    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    const approvedBy = session.user?.name || userEmail;
    const approvedAt = new Date().toISOString();
    const reason = action === 'reject' ? (rejectionReason || '') : '';

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Sheet1!M${actualRowNumber}:P${actualRowNumber}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[newStatus, approvedBy, approvedAt, reason]],
      },
    });

    return NextResponse.json({
      success: true, action, tipId,
      message: action === 'approve' ? 'Artikel disetujui!' : 'Artikel ditolak'
    });
  } catch (error: any) {
    console.error("Approve/Reject Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
