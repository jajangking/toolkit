import { NextResponse } from 'next/server';
import { getTips } from '@/lib/tips';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data/tips.json');

export async function PATCH(req: Request) {
  try {
    const { tipId, reactionType } = await req.json();
    
    // Read local file directly to ensure we can write back to it
    const fileData = fs.readFileSync(dataFilePath, 'utf8');
    const tips = JSON.parse(fileData);
    
    const tipIndex = tips.findIndex((t: any) => t.id === tipId);

    if (tipIndex === -1) {
      return NextResponse.json({ error: "Tip not found" }, { status: 404 });
    }

    if (!tips[tipIndex].reactions) {
      tips[tipIndex].reactions = { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 };
    }

    // Increment reaction
    if (tips[tipIndex].reactions.hasOwnProperty(reactionType)) {
      tips[tipIndex].reactions[reactionType] += 1;
    } else {
      tips[tipIndex].reactions[reactionType] = 1;
    }

    fs.writeFileSync(dataFilePath, JSON.stringify(tips, null, 2));

    return NextResponse.json({ success: true, reactions: tips[tipIndex].reactions });
  } catch (error: any) {
    console.error("Reaction API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
