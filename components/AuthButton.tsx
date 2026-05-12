"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

export default function AuthButton() {
  const { data: session, status } = useSession();
  const [showMenu, setShowMenu] = useState(false);

  if (status === "loading") {
    return (
      <div className="px-3 py-1.5 md:px-4 md:py-2 font-bold dark:text-white text-black neo-border bg-transparent text-sm">
        ...
      </div>
    );
  }

  if (!session) {
    return (
      <Link
        href="/login"
        className="px-3 py-1.5 md:px-4 md:py-2 font-bold dark:text-black dark:bg-white text-white bg-black hover:translate-x-0.5 hover:translate-y-0.5 transition-all neo-border neo-shadow text-sm"
      >
        Login
      </Link>
    );
  }

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "jajangnurdiana123@gmail.com";
  const isAdmin = session.user?.email?.toLowerCase() === adminEmail.toLowerCase();

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="px-3 py-1.5 md:px-4 md:py-2 font-bold text-black bg-yellow-400 hover:translate-x-0.5 hover:translate-y-0.5 transition-all neo-border neo-shadow text-sm flex items-center gap-2"
      >
        {session.user?.name?.split(" ")[0] || "User"}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="square"
          strokeLinejoin="miter"
          className={`transition-transform ${showMenu ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-48 dark:bg-black bg-white neo-border neo-shadow z-50">
            <div className="p-2 border-b-2 dark:border-white border-black">
              <p className="font-bold text-sm truncate">{session.user?.email}</p>
              {isAdmin && (
                <span className="inline-block mt-1 px-2 py-0.5 bg-purple-400 text-black text-xs font-black uppercase neo-border">
                  Admin
                </span>
              )}
            </div>
            <div className="p-2 space-y-1">
              <Link
                href="/tips/writer"
                className="block px-3 py-2 font-bold hover:bg-yellow-400 hover:text-black transition-colors text-sm neo-border border-transparent hover:border-black"
                onClick={() => setShowMenu(false)}
              >
                Tulis Artikel
              </Link>
              {isAdmin && (
                <Link
                  href="/tips/admin"
                  className="block px-3 py-2 font-bold hover:bg-purple-400 hover:text-black transition-colors text-sm neo-border border-transparent hover:border-black"
                  onClick={() => setShowMenu(false)}
                >
                  Admin Dashboard
                </Link>
              )}
              <Link
                href="/notepad"
                className="block px-3 py-2 font-bold hover:bg-cyan-400 hover:text-black transition-colors text-sm neo-border border-transparent hover:border-black"
                onClick={() => setShowMenu(false)}
              >
                Notepad
              </Link>
              <button
                onClick={() => {
                  setShowMenu(false);
                  signOut({ callbackUrl: "/" });
                }}
                className="w-full text-left px-3 py-2 font-bold hover:bg-red-500 hover:text-white transition-colors text-sm neo-border border-transparent hover:border-black"
              >
                Logout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
