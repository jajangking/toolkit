import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { google } from "googleapis";
import { authOptions } from "@/lib/auth";
import { tipFromRow } from "@/lib/tips";

export async function GET() {
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
    const accessToken = (session as any).accessToken;
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const sheets = google.sheets({ version: "v4", auth });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Sheet1!A2:Q200",
    });

    const rows = response.data.values || [];
    const tips = rows
      .map(tipFromRow)
      .filter(tip => tip.status === 'pending')
      .reverse();

    return NextResponse.json({ tips });
  } catch (error: any) {
    console.error("Pending Tips Error:", error);
    return NextResponse.json({ error: error.message, tips: [] });
  }
}
