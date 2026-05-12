"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

export default function TipsActions() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <div className="mb-8 p-6 liquid-glass neo-border neo-shadow bg-white/5 text-center">
        <p className="font-bold mb-4">Punya pengalaman atau tips yang ingin dibagikan?</p>
        <Link
          href="/login?callbackUrl=/tips/writer"
          className="inline-block px-6 py-3 bg-yellow-400 text-black font-black uppercase tracking-widest neo-border neo-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
        >
          Login untuk Menulis
        </Link>
      </div>
    );
  }

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "jajangnurdiana123@gmail.com";
  const isAdmin = session.user?.email?.toLowerCase() === adminEmail.toLowerCase();

  return (
    <div className="mb-8 flex flex-col sm:flex-row gap-4">
      <Link
        href="/tips/writer"
        className="flex-1 px-6 py-4 bg-yellow-400 text-black font-black uppercase tracking-widest neo-border neo-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all text-center"
      >
        ✍️ Tulis Artikel Baru
      </Link>

      {isAdmin && (
        <Link
          href="/tips/admin"
          className="flex-1 px-6 py-4 bg-purple-400 text-black font-black uppercase tracking-widest neo-border neo-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all text-center"
        >
          ⚙️ Admin Dashboard
        </Link>
      )}
    </div>
  );
}
