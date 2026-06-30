import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interactive Camera Projector | Toolkit",
  description:
    "Interactive projection system. Kamera deteksi objek fisik, bola virtual mantul kena benda di meja. Real-time computer vision di browser.",
};

export default function InteractiveCameraLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
