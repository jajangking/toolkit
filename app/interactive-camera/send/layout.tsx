import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Camera Sender | Toolkit",
  description: "Kirim stream kamera HP ke proyektor interaktif.",
};

export default function SendLayout({ children }: { children: React.ReactNode }) {
  return children;
}
