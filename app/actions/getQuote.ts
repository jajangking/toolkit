"use server";

import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function getDynamicQuote() {
  try {
    if (!process.env.GROQ_API_KEY) {
      return "Woi, pasang GROQ_API_KEY dulu di .env biar gue bisa mikir!";
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Anda adalah asisten yang cerdas dan santai bergaya anak muda Jakarta (lo/gue). Tugas Anda adalah membuat satu kalimat quote atau insight unik yang SANGAT SINGKAT (maksimal 10 kata). Bahas teknologi atau produktivitas. Gunakan bahasa santai Indonesia. Jangan pakai tanda kutip.",
        },
        {
          role: "user",
          content: "Buatin gue satu quote unik buat hari ini dong.",
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.8,
      max_tokens: 100,
    });

    return completion.choices[0]?.message?.content || "Lagi gak ada ide nih, coba refresh lagi.";
  } catch (error) {
    console.error("Groq AI Error:", error);
    return "AI-nya lagi pusing, ntar coba lagi ya!";
  }
}
