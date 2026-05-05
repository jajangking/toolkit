import { NextResponse } from 'next/server';
import { getTips } from '@/lib/tips';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data/tips.json');

export async function PATCH(req: Request) {
  try {
    const { tipId, reactionType } = await req.json();
    const tips = getTips();
    const tipIndex = tips.findIndex(t => t.id === tipId);

    if (tipIndex === -1) {
      return NextResponse.json({ error: "Tip not found" }, { status: 404 });
    }

    if (!tips[tipIndex].reactions) {
      tips[tipIndex].reactions = { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 };
    }

    // @ts-ignore
    tips[tipIndex].reactions[reactionType] += 1;

    fs.writeFileSync(dataFilePath, JSON.stringify(tips, null, 2));

    return NextResponse.json({ success: true, reactions: tips[tipIndex].reactions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
