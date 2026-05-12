import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const SPREADSHEET_ID = process.env.TIPS_SPREADSHEET_ID!;

// PATCH: tambah reaction ke artikel
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Login untuk react' }, { status: 401 });
    }

    const { tipId, reactionType } = await req.json();
    if (!tipId || !reactionType) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const accessToken = (session as any).accessToken;
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const sheets = google.sheets({ version: 'v4', auth });

    // Cari row artikel di Sheet1
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A2:Q200',
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex(row => row[0] === tipId);

    if (rowIndex === -1) {
      return NextResponse.json({ error: 'Tip not found' }, { status: 404 });
    }

    // Kolom Q (index 16) = Reactions JSON
    const currentReactionsStr = rows[rowIndex][16] || '{"like":0,"love":0,"haha":0,"wow":0,"sad":0,"angry":0}';
    let reactions: any = {};
    try {
      reactions = JSON.parse(currentReactionsStr);
    } catch {
      reactions = { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 };
    }

    // Increment
    reactions[reactionType] = (reactions[reactionType] || 0) + 1;

    // Update kolom Q di row yang benar
    const actualRow = rowIndex + 2;
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Sheet1!Q${actualRow}`,
      valueInputOption: 'RAW',
      requestBody: { values: [[JSON.stringify(reactions)]] }
    });

    return NextResponse.json({ success: true, reactions });
  } catch (error: any) {
    console.error('Reaction Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
