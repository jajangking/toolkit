import { ReceiptLine } from "./PertaminaReceipt";

export interface StationInfo {
  code: string;
  name: string;
  address: string;
}

export interface TransactionInfo {
  shift: string;
  transactionNumber: string;
  datetime: string;
}

export interface FuelInfo {
  pump: string;
  operator: string;
  type: string;
  volume: string;
}

export interface PricingInfo {
  normalPrice: string;
  governmentSubsidy: string;
  sellPrice: string;
}

export interface PaymentInfo {
  withoutSubsidy: string;
  subsidy: string;
  paid: string;
  method: string;
}

export interface ReceiptData {
  logo?: string;
  station: StationInfo;
  transaction: TransactionInfo;
  fuel: FuelInfo;
  pricing: PricingInfo;
  payment: PaymentInfo;
  footer: string[];
}

export interface ReceiptProps {
  data: ReceiptData;
  className?: string;
  editingIndex?: number | null;
  editingSegment?: number;
  onLineClick?: (index: number, segmentIndex: number, field: string | undefined, text: string) => void;
  onEditChange?: (index: number, segmentIndex: number, field: string | undefined, value: string) => void;
  onEditSave?: (index: number, segmentIndex: number, field: string | undefined, value: string | undefined) => void;
}
