import { NextResponse } from 'next/server';
import { saveTip } from '@/lib/tips';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  // Simple admin check: You might want to restrict this to a specific email
  if (!session || session.user?.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized. Admin only." }, { status: 401 });
  }

  try {
    const data = await req.json();
    const { title, excerpt, content } = data;

    if (!title || !excerpt || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const slug = title
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '');

    const newTip = {
      id: Math.random().toString(36).substring(2, 9),
      slug,
      title,
      excerpt,
      content,
      date: new Date().toISOString().split('T')[0],
      author: session?.user?.name || "Admin",
    };

    saveTip(newTip);

    return NextResponse.json({ success: true, slug });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
