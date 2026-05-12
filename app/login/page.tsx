"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  useEffect(() => {
    if (session) {
      router.push(callbackUrl);
    }
  }, [session, router, callbackUrl]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-2xl font-black uppercase">Loading...</div>
        </div>
      </div>
    );
  }

  if (session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-black uppercase mb-4">Redirecting...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="liquid-glass neo-border neo-shadow p-8 md:p-12 text-center">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 dark:text-white text-black">
            TOOLKIT
          </h1>
          <p className="text-lg font-bold mb-8 dark:text-gray-300 text-gray-700">
            Login untuk akses fitur lengkap
          </p>

          <div className="space-y-4 mb-8">
            <div className="text-left space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-yellow-400 font-black">✓</span>
                <span className="font-bold">Notepad dengan Google Drive sync</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-yellow-400 font-black">✓</span>
                <span className="font-bold">Tulis artikel di Tips & Pengalaman</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-yellow-400 font-black">✓</span>
                <span className="font-bold">Simpan history & preferences</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => signIn("google", { callbackUrl })}
            className="w-full py-4 px-6 dark:bg-white dark:text-black bg-black text-white font-black uppercase tracking-widest neo-border neo-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-3"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Login dengan Google
          </button>

          <div className="mt-6 text-sm dark:text-gray-400 text-gray-600">
            <p className="font-bold">
              Dengan login, kamu setuju dengan{" "}
              <Link href="/privacy" className="dark:text-yellow-400 text-blue-600 underline">
                Privacy Policy
              </Link>{" "}
              kami
            </p>
          </div>

          <div className="mt-8 pt-6 border-t-2 dark:border-white/10 border-black/10">
            <Link
              href="/"
              className="dark:text-gray-400 text-gray-600 font-bold hover:text-yellow-400 transition-colors"
            >
              ← Kembali ke Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
