import { NextResponse } from 'next/server';
import { saveComment } from '@/lib/comments';

export async function POST(req: Request) {
  try {
    const { tipId, name, text } = await req.json();

    if (!tipId || !name || !text) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const newComment = {
      id: Math.random().toString(36).substring(2, 9),
      tipId,
      name,
      text,
      date: new Date().toISOString(),
    };

    saveComment(newComment);

    return NextResponse.json({ success: true, comment: newComment });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
