import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Barcode & QR Generator",
  description: "Bikin Barcode dan QR Code instan berbagai format (EAN, Code128, UPC, dll). Gratis, aman, dan bisa langsung di-download!",
};

export default function BarcodeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
