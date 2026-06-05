import { ReceiptData } from "./types";

export const defaultReceiptData: ReceiptData = {
  logo: "PERTAMINA",
  station: {
    code: "3317801",
    name: "SPBU TEUKU UMAR CIBITUNG",
    address: "JL. TEUKU UMAR NO.27 CIBITUNG",
  },
  transaction: {
    shift: "2",
    transactionNumber: "3491314",
    datetime: "23/04/2026 16:00:10",
  },
  fuel: {
    pump: "3",
    operator: "SAHNAZ",
    type: "PERTALITE",
    volume: "1.70 liter",
  },
  pricing: {
    normalPrice: "16.088",
    governmentSubsidy: "6.088",
    sellPrice: "10.000",
  },
  payment: {
    withoutSubsidy: "27.349",
    subsidy: "10.349",
    paid: "17.000",
    method: "CASH",
  },
  footer: [
    "Anda mendapat subsidi dari",
    "Pemerintah sebesar Rp 10.349",
    "",
    "(Perhitungan subsidi unaudited",
    "atau estimasi). Gunakan BBM",
    "subsidi secara bijak.",
  ],
};
