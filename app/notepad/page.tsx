"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Note {
  id: string;
  content: string;
  createdAt: number;
}

export default function NotepadPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [input, setInput] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("smart_notes");
    const loadData = () => {
      if (saved) setNotes(JSON.parse(saved));
      setIsLoaded(true);
    };
    
    // Pake timeout biar gak kena lint error "cascading renders"
    const timer = setTimeout(loadData, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("smart_notes", JSON.stringify(notes));
    }
  }, [notes, isLoaded]);

  const addNote = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;
    const newNote: Note = {
      id: Math.random().toString(36).substring(2, 9),
      content: input,
      createdAt: Date.now(),
    };
    setNotes([newNote, ...notes]);
    setInput("");
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id));
  };

  const calculateSmart = (text: string) => {
    // 1. Deteksi pola matematika (3 * 15000) - Tetap ada
    const mathRegex = /(([0-9]+(\.[0-9]+)?)\s*[\+\-\*\/]\s*)+([0-9]+(\.[0-9]+)?)/g;
    const mathMatches = text.match(mathRegex);
    
    // 2. Deteksi angka mandiri (misal: 500.000 atau 1.250.000)
    // Kita cari angka yang dipisah titik atau angka biasa yang gede
    const standaloneNumbers = text.match(/\b\d{1,3}(\.\d{3})*(\,\d+)?\b/g);
    
    const results: { original: string; result: string; value: number }[] = [];

    // Proses Matematika (+, -, *, /)
    if (mathMatches) {
      mathMatches.forEach(match => {
        try {
          const sanitized = match.replace(/[^0-9\+\-\*\/\.\s]/g, '');
          const res = new Function(`return ${sanitized}`)();
          results.push({ original: match.trim(), result: res.toLocaleString('id-ID'), value: res });
        } catch { /* skip error */ }
      });
    }

    // Proses Angka List (buat dijumlahin semua)
    let grandTotal = 0;
    if (standaloneNumbers && standaloneNumbers.length > 1) {
      standaloneNumbers.forEach(num => {
        // Ubah format ID (1.000.000) ke format JS (1000000)
        const parsed = parseFloat(num.replace(/\./g, '').replace(/,/g, '.'));
        if (!isNaN(parsed)) grandTotal += parsed;
      });
    }

    if (results.length === 0 && grandTotal === 0) return null;

    return {
      items: results,
      total: grandTotal > 0 ? grandTotal.toLocaleString('id-ID') : null
    };
  };

  if (!isLoaded) return null;

  return (
    <div className="py-6 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto flex flex-col">
        
        {/* HEADER TOOL */}
        <div className="liquid-glass neo-border neo-shadow p-6 md:p-12 mb-8 bg-white/10 animate-slide-up">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 gap-4">
            <div>
              <div className="inline-block bg-orange-400 px-2 py-0.5 neo-border text-[10px] font-black uppercase tracking-widest mb-2 text-black">Smart Tool</div>
              <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none dark:text-white text-black">SMART<br/>NOTEPAD</h1>
            </div>
            <p className="max-w-xs text-sm md:text-lg font-bold leading-tight uppercase italic dark:text-gray-300 text-gray-800">Tulis catatan, biarkan kami yang berhitung!</p>
          </div>

          <form onSubmit={addNote} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="note-input" className="block text-lg font-black uppercase tracking-tight dark:text-white text-black">Catatan Baru:</label>
              <div className="flex flex-col sm:flex-row gap-4">
                <textarea 
                  id="note-input" 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)} 
                  placeholder="Contoh:&#10;Recehan : 500.000&#10;Bon : 756.000" 
                  autoFocus 
                  rows={4}
                  className="flex-grow px-4 py-4 text-lg font-bold bg-white neo-border neo-shadow focus:translate-x-1 focus:translate-y-1 focus:shadow-none transition-all outline-none text-black resize-none"
                />
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-[10px] font-bold uppercase dark:text-gray-400 text-gray-500 italic">Tips: Tulis list angka ke bawah, otomatis bakal dijumlahin semua.</p>
                <button 
                  type="submit"
                  className="px-8 py-3 bg-yellow-400 text-black font-black uppercase tracking-widest neo-border neo-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                >
                  Simpan Catatan
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* LIST CATATAN */}
        <div className="space-y-6">
          {notes.length === 0 ? (
            <div className="liquid-glass neo-border neo-shadow p-12 text-center border-dashed border-4 border-black/10 dark:border-white/10">
              <p className="text-xl font-black uppercase tracking-tighter dark:text-white/30 text-black/30 italic transition-colors">Belum ada catatan...</p>
            </div>
          ) : (
            notes.map((note) => {
              const calculations = calculateSmart(note.content);
              return (
                <div key={note.id} className="liquid-glass neo-border neo-shadow p-6 bg-white/5 group animate-scale-in">
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <p className="text-xl font-bold dark:text-white text-black break-words flex-grow whitespace-pre-wrap">{note.content}</p>
                    <button 
                      onClick={() => deleteNote(note.id)}
                      className="bg-rose-500 text-white p-1.5 neo-border neo-shadow hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all shrink-0"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/></svg>
                    </button>
                  </div>

                  {calculations && (
                    <div className="mt-4 space-y-3">
                      {calculations.items.length > 0 && (
                        <div className="p-4 bg-blue-400/20 neo-border border-dashed border-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">Operasi Matematika:</p>
                          <div className="space-y-1">
                            {calculations.items.map((calc, i) => (
                              <div key={i} className="flex items-center text-lg font-black dark:text-white text-black">
                                <span className="bg-white text-black px-2 py-0.5 neo-border text-xs mr-2">{calc.original}</span>
                                <span className="mr-2">=</span>
                                <span className="text-xl text-blue-500">{calc.result}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {calculations.total && (
                        <div className="p-4 bg-lime-400/30 neo-border neo-shadow border-2">
                          <div className="flex justify-between items-center">
                            <p className="text-sm font-black uppercase tracking-widest text-black dark:text-white">Total Semua Angka:</p>
                            <p className="text-3xl font-black text-lime-600 dark:text-lime-400">Rp {calculations.total}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="mt-4 flex justify-end">
                    <span className="text-[8px] font-black uppercase tracking-widest dark:text-gray-500 text-gray-400">
                      {new Date(note.createdAt).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-12 text-center">
          <Link href="/" className="inline-block text-sm font-black uppercase underline decoration-2 hover:text-orange-500 transition-colors">
            Balik ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
