"use client";

import { useRef, useEffect, useState } from "react";
import { ReceiptProps } from "./types";
import "./PertaminaReceipt.css";

const W = 32;

function center(s: string): string {
  const pad = Math.max(0, Math.floor((W - s.length) / 2));
  return s.padStart(pad + s.length).padEnd(W);
}

function isDataUrl(s: string): boolean {
  return s.startsWith("data:image/");
}

export interface LineSegment {
  text: string;
  editable?: boolean;
  field?: string;
}

export interface ReceiptLine {
  segments: LineSegment[];
  bold?: boolean;
}

function seg(text: string, editable?: boolean, field?: string): LineSegment {
  return { text, editable, field };
}

export function buildReceiptLines(data: ReceiptProps["data"]): ReceiptLine[] {
  const lines: ReceiptLine[] = [];

  if (data.logo && !isDataUrl(data.logo)) {
    lines.push({ segments: [seg(center(data.logo), true, "logo")] });
    lines.push({ segments: [seg(center("-".repeat(data.logo.length)))] });
    lines.push({ segments: [seg("")] });
  }

  if (data.station) {
    lines.push({ segments: [seg(center(data.station.code), true, "station.code")] });
    lines.push({ segments: [seg(center(data.station.name), true, "station.name")] });
    lines.push({ segments: [seg(center(data.station.address), true, "station.address")] });
  }

  lines.push({ segments: [seg("-".repeat(W))] });

  if (data.transaction) {
    const left = `Shift: ${data.transaction.shift}`;
    const right = `No. Trans: ${data.transaction.transactionNumber}`;
    const gap = Math.max(1, W - left.length - right.length);
    lines.push({
      segments: [
        seg("Shift: "),
        seg(data.transaction.shift, true, "transaction.shift"),
        seg(" ".repeat(gap)),
        seg("No. Trans: "),
        seg(data.transaction.transactionNumber, true, "transaction.transactionNumber"),
      ],
    });
    lines.push({
      segments: [
        seg("Waktu: "),
        seg(data.transaction.datetime, true, "transaction.datetime"),
      ],
    });
  }

  lines.push({ segments: [seg("-".repeat(W))] });

  if (data.fuel) {
    lines.push({ segments: [seg("Pulau/Pompa   : "), seg(data.fuel.pump, true, "fuel.pump")] });
    lines.push({ segments: [seg("Operator      : "), seg(data.fuel.operator, true, "fuel.operator")] });
    lines.push({ segments: [seg("Jenis BBM     : "), seg(data.fuel.type, true, "fuel.type")] });
    lines.push({ segments: [seg("Volume        : "), seg(data.fuel.volume, true, "fuel.volume")] });
  }

  lines.push({ segments: [seg("-".repeat(W))] });

  if (data.pricing) {
    lines.push({ segments: [seg(center("Informasi Harga BBM (Rp/Liter)"))] });
    lines.push({ segments: [seg("Harga Non Subsidi".padEnd(22)), seg(data.pricing.normalPrice.padStart(10), true, "pricing.normalPrice")] });
    lines.push({ segments: [seg("Subsidi Pemerintah".padEnd(22)), seg(data.pricing.governmentSubsidy.padStart(10), true, "pricing.governmentSubsidy")] });
    lines.push({ segments: [seg("Harga Jual".padEnd(22)), seg(data.pricing.sellPrice.padStart(10), true, "pricing.sellPrice")] });
  }

  lines.push({ segments: [seg("-".repeat(W))] });

  if (data.payment) {
    lines.push({ segments: [seg(center("Total Penjualan (Rp)"))] });
    lines.push({ segments: [seg("Tanpa Subsidi".padEnd(22)), seg(data.payment.withoutSubsidy.padStart(10), true, "payment.withoutSubsidy")] });
    lines.push({ segments: [seg("Subsidi Pemerintah".padEnd(22)), seg(data.payment.subsidy.padStart(10), true, "payment.subsidy")] });
    lines.push({ segments: [seg("Dibayar Konsumen".padEnd(22)), seg(data.payment.paid.padStart(10), true, "payment.paid")] });
  }

  if (data.payment) {
    lines.push({ segments: [seg("-".repeat(W))] });
    lines.push({
      bold: true,
      segments: [
        seg(data.payment.method.padEnd(22), true, "payment.method"),
        seg(data.payment.paid.padStart(10), true, "payment.paid"),
      ],
    });
    lines.push({ segments: [seg("-".repeat(W))] });
  }

  if (data.footer && data.footer.length > 0) {
    for (let i = 0; i < data.footer.length; i++) {
      lines.push({ segments: [seg(data.footer[i] || " ", true, `footer.${i}`)] });
    }
  }

  lines.push({ segments: [seg("-".repeat(W))] });

  return lines;
}

export default function PertaminaReceipt({
  data,
  className = "",
  editingIndex,
  editingSegment,
  onLineClick,
  onEditChange,
  onEditSave,
}: ReceiptProps) {
  const imgLogo = data.logo && isDataUrl(data.logo);
  const receiptLines = buildReceiptLines(data);
  const inputRef = useRef<HTMLInputElement>(null);
  const [localValue, setLocalValue] = useState<string | null>(null);

  useEffect(() => {
    setLocalValue(null);
  }, [editingIndex, editingSegment]);

  useEffect(() => {
    if (editingIndex != null && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingIndex, editingSegment]);

  function commit(li: number, si: number, field: string | undefined) {
    const v = (localValue ?? receiptLines[li]?.segments[si]?.text ?? "").trim();
    onEditSave?.(li, si, field, v);
    setLocalValue(null);
  }

  return (
    <div className={`pertamina-receipt ${className}`} data-receipt-root>
      {imgLogo && (
        <div className="receipt-logo">
          <img src={data.logo} alt="" className="receipt-logo-img" />
        </div>
      )}
      <div className="receipt-body">
        {receiptLines.map((line, li) => (
          <div key={li} className={`receipt-line${line.bold ? " bold" : ""}`}>
            {line.segments.map((segment, si) => {
              const isEditing =
                segment.editable && editingIndex === li && editingSegment === si;
              if (isEditing) {
                return (
                  <input
                    key={si}
                    ref={inputRef}
                    className="receipt-edit-input"
                    value={localValue ?? segment.text.trim()}
                    onChange={(e) => {
                      const v = e.target.value;
                      setLocalValue(v);
                      onEditChange?.(li, si, segment.field, v);
                    }}
                    onBlur={() => commit(li, si, segment.field)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        commit(li, si, segment.field);
                      } else if (e.key === "Escape") {
                        setLocalValue(null);
                        onEditSave?.(li, si, segment.field, undefined);
                      }
                    }}
                    spellCheck={false}
                  />
                );
              }
              return (
                <span
                  key={si}
                  className={segment.editable ? "clickable" : ""}
                  onClick={() => {
                    if (segment.editable && onLineClick) {
                      onLineClick(li, si, segment.field, segment.text.trim());
                    }
                  }}
                >
                  {segment.text || "\u00A0"}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
