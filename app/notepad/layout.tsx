import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Smart Notepad Hitung Otomatis",
  description: "Catatan pintar yang bisa hitung otomatis harga, list belanjaan, dan kasbon. Sinkron ke Google Sheets dengan satu klik!",
};

export default function NotepadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
