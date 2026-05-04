import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Scanner Ajaib Kamera",
  description: "Scan QR Code dan Barcode langsung lewat kamera HP atau laptop. Cepat, akurat, dan privasi terjaga.",
};

export default function ScannerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
