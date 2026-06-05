import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Receipt Generator - Struk Pertamina",
  description: "Generate authentic Pertamina gas station thermal receipts. Export to PNG, PDF, or print directly. Pixel-perfect ESC/POS style.",
};

export default function ReceiptGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
