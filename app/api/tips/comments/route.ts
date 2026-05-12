import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const SPREADSHEET_ID = process.env.TIPS_SPREADSHEET_ID!;

async function getSheets(session: any) {
  const accessToken = (session as any)?.accessToken;
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.sheets({ version: 'v4', auth });
}

async function ensureCommentsSheet(sheets: any) {
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const sheetNames = spreadsheet.data.sheets?.map((s: any) => s.properties?.title) || [];
  if (!sheetNames.includes('Comments')) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: { requests: [{ addSheet: { properties: { title: 'Comments' } } }] }
    });
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Comments!A1:H1',
      valueInputOption: 'RAW',
      requestBody: { values: [['ID', 'TipID', 'ParentID', 'Name', 'Email', 'Text', 'Date', 'Votes']] }
    });
  }
}

// GET: ambil semua komentar untuk tipId
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tipId = searchParams.get('tipId');
  if (!tipId) return NextResponse.json({ comments: [] });

  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ comments: [] });

    const sheets = await getSheets(session);
    await ensureCommentsSheet(sheets);

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Comments!A2:H1000',
    });

    const rows = res.data.values || [];
    const comments = rows
      .filter((row: any[]) => row[1] === tipId)
      .map((row: any[]) => ({
        id: row[0] || '',
        tipId: row[1] || '',
        parentId: row[2] || null,
        name: row[3] || '',
        email: row[4] || '',
        text: row[5] || '',
        date: row[6] || '',
        votes: parseInt(row[7] || '0'),
      }));

    return NextResponse.json({ comments });
  } catch (error: any) {
    console.error('Comments GET Error:', error);
    return NextResponse.json({ comments: [] });
  }
}

// POST: simpan komentar atau reply baru
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Login untuk berkomentar' }, { status: 401 });

    const { tipId, text, parentId } = await req.json();
    if (!tipId || !text) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const sheets = await getSheets(session);
    await ensureCommentsSheet(sheets);

    const id = Math.random().toString(36).substring(2, 9);
    const date = new Date().toISOString();
    const name = session.user?.name || 'Anonim';
    const email = session.user?.email || '';

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Comments!A2',
      valueInputOption: 'RAW',
      requestBody: { values: [[id, tipId, parentId || '', name, email, text, date, '0']] }
    });

    return NextResponse.json({
      success: true,
      comment: { id, tipId, parentId: parentId || null, name, email, text, date, votes: 0 }
    });
  } catch (error: any) {
    console.error('Comments POST Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH: vote komentar
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Login untuk vote' }, { status: 401 });

    const { commentId, dir } = await req.json(); // dir: 1 atau -1
    const sheets = await getSheets(session);

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Comments!A2:H1000',
    });

    const rows = res.data.values || [];
    const rowIndex = rows.findIndex((row: any[]) => row[0] === commentId);
    if (rowIndex === -1) return NextResponse.json({ error: 'Comment not found' }, { status: 404 });

    const currentVotes = parseInt(rows[rowIndex][7] || '0');
    const newVotes = currentVotes + dir;
    const actualRow = rowIndex + 2;

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Comments!H${actualRow}`,
      valueInputOption: 'RAW',
      requestBody: { values: [[newVotes.toString()]] }
    });

    return NextResponse.json({ success: true, votes: newVotes });
  } catch (error: any) {
    console.error('Vote Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
