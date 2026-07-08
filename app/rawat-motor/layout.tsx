import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rawat Motor",
  description: "Catat riwayat servis dan perawatan motor. Pantau oli, rantai, ban, kampas rem, dan lainnya biar motor lo awet.",
};

export default function RawatMotorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
