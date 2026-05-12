"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Tip } from "@/lib/tips";
import Link from "next/link";

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [pendingTips, setPendingTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [migrating, setMigrating] = useState(false);

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "jajangnurdiana123@gmail.com";
  const isAdmin = session?.user?.email?.toLowerCase() === adminEmail.toLowerCase();

  useEffect(() => {
    if (isAdmin) {
      fetchPendingTips();
    }
  }, [isAdmin]);

  const fetchPendingTips = async () => {
    try {
      const res = await fetch("/api/tips/pending");
      const data = await res.json();
      setPendingTips(data.tips || []);
    } catch (error) {
      console.error("Error fetching pending tips:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (tipId: string, action: 'approve' | 'reject') => {
    const rejectionReason = action === 'reject'
      ? prompt("Alasan penolakan (opsional):")
      : null;

    setActionLoading(tipId);
    try {
      const res = await fetch("/api/tips/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipId, action, rejectionReason }),
      });

      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchPendingTips(); // Refresh list
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      console.error("Action error:", error);
      alert("Terjadi kesalahan");
    } finally {
      setActionLoading(null);
    }
  };

  const handleMigrate = async () => {
    if (!confirm("Migrate spreadsheet ke schema baru? Ini akan update semua data lama.")) {
      return;
    }

    setMigrating(true);
    try {
      const res = await fetch("/api/tips/migrate", {
        method: "POST",
      });

      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchPendingTips(); // Refresh list
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      console.error("Migration error:", error);
      alert("Terjadi kesalahan");
    } finally {
      setMigrating(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
          <p className="mb-6">Please login to access admin panel</p>
          <Link href="/login?callbackUrl=/tips/admin" className="inline-block px-8 py-4 dark:bg-white dark:text-black bg-black text-white neo-border neo-shadow font-black uppercase tracking-widest hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
          <p>You don&apos;t have permission to access this page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

        <div className="liquid-glass neo-border neo-shadow p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Database Migration</h2>
          <p className="mb-4 text-sm">Jika spreadsheet masih pakai schema lama, klik tombol ini untuk migrate ke schema baru (17 kolom).</p>
          <div className="flex gap-3">
            <button
              onClick={handleMigrate}
              disabled={migrating}
              className="px-6 py-3 bg-blue-500 text-white neo-border neo-shadow hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold uppercase"
            >
              {migrating ? 'Migrating...' : 'Migrate Spreadsheet'}
            </button>
            <a
              href="/api/tips/debug"
              target="_blank"
              className="px-6 py-3 bg-gray-500 text-white neo-border neo-shadow hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all font-bold uppercase"
            >
              Debug Data
            </a>
          </div>
        </div>

        <div className="liquid-glass neo-border neo-shadow p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Pending Articles ({pendingTips.length})</h2>

          {loading ? (
            <p>Loading...</p>
          ) : pendingTips.length === 0 ? (
            <p className="dark:text-gray-400 text-gray-500">No pending articles</p>
          ) : (
            <div className="space-y-6">
              {pendingTips.map((tip) => (
                <div key={tip.id} className="neo-border p-6 hover:translate-x-0.5 hover:translate-y-0.5 transition-all liquid-glass">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">{tip.title}</h3>
                      <p className="text-sm dark:text-gray-400 text-gray-600 mb-2">
                        By {tip.author} ({tip.authorEmail}) • {tip.date}
                      </p>
                      <p className="dark:text-gray-300 text-gray-700 mb-4">{tip.excerpt}</p>
                    </div>
                  </div>

                  {tip.problem && (
                    <div className="mb-3">
                      <strong className="text-red-500">Problem:</strong>
                      <p className="text-sm dark:text-gray-300 text-gray-700 mt-1">{tip.problem}</p>
                    </div>
                  )}

                  {tip.solution && (
                    <div className="mb-3">
                      <strong className="text-green-500">Solution:</strong>
                      <p className="text-sm dark:text-gray-300 text-gray-700 mt-1">{tip.solution}</p>
                    </div>
                  )}

                  {tip.result && (
                    <div className="mb-3">
                      <strong className="text-blue-500">Result:</strong>
                      <p className="text-sm dark:text-gray-300 text-gray-700 mt-1">{tip.result}</p>
                    </div>
                  )}

                  <div className="mb-4">
                    <strong>Content:</strong>
                    <div className="text-sm dark:text-gray-300 text-gray-700 mt-1 max-h-40 overflow-y-auto dark:bg-black/20 bg-gray-50 p-3 neo-border">
                      <div dangerouslySetInnerHTML={{ __html: tip.content }} />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAction(tip.id, 'approve')}
                      disabled={actionLoading === tip.id}
                      className="px-6 py-2 bg-green-500 text-white neo-border neo-shadow hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold uppercase"
                    >
                      {actionLoading === tip.id ? 'Processing...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleAction(tip.id, 'reject')}
                      disabled={actionLoading === tip.id}
                      className="px-6 py-2 bg-red-500 text-white neo-border neo-shadow hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold uppercase"
                    >
                      {actionLoading === tip.id ? 'Processing...' : 'Reject'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
