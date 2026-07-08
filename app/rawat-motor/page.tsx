"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AdSpace from "@/components/AdSpace";

type Motorcycle = {
  id: string;
  name: string;
  plate: string;
};

type MaintenanceTask = {
  id: string;
  date: string;
  task: string;
  mileage: number;
  cost: number;
  notes: string;
  nextMileage: number;
  motorcycleId: string;
};

type PartPlan = {
  id: string;
  partName: string;
  installedMileage: number;
  interval: number;
  nextMileage: number;
  notes: string;
  motorcycleId: string;
};

type KmLog = {
  id: string;
  date: string;
  km: number;
  motorcycleId: string;
};

type AlertItem = {
  label: string;
  nextMileage: number;
  status: "overdue" | "warning" | "upcoming";
  type: "service" | "part";
};

const TASK_OPTIONS = [
  "Ganti Oli Mesin",
  "Ganti Oli Gardan",
  "Setel & Lumasi Rantai",
  "Ganti Kampas Rem",
  "Ganti Busi",
  "Ganti Filter Udara",
  "Isi Coolant",
  "Cek & Tambah Angin Ban",
  "Ganti Ban",
  "Cek Aki",
  "Servis Rutin",
  "Lainnya",
];

const DEFAULT_INTERVALS: Record<string, number> = {
  "Ganti Oli Mesin": 3000,
  "Ganti Oli Gardan": 5000,
  "Setel & Lumasi Rantai": 1000,
  "Ganti Kampas Rem": 5000,
  "Ganti Busi": 8000,
  "Ganti Filter Udara": 6000,
  "Isi Coolant": 10000,
  "Cek & Tambah Angin Ban": 2000,
  "Ganti Ban": 15000,
  "Cek Aki": 10000,
  "Servis Rutin": 4000,
  "Lainnya": 0,
};

export default function RawatMotorPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
  const [activeMotorcycleId, setActiveMotorcycleId] = useState<string | null>(null);
  const [records, setRecords] = useState<MaintenanceTask[]>([]);
  const [partPlans, setPartPlans] = useState<PartPlan[]>([]);
  const [kmLogs, setKmlogs] = useState<KmLog[]>([]);

  const [showMotorModal, setShowMotorModal] = useState(false);
  const [motorForm, setMotorForm] = useState({ name: "", plate: "" });
  const [editingMotorId, setEditingMotorId] = useState<string | null>(null);
  const [deleteMotorConfirm, setDeleteMotorConfirm] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"riwayat" | "rencana">("riwayat");
  const [editMode, setEditMode] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    task: TASK_OPTIONS[0],
    mileage: 0,
    cost: 0,
    notes: "",
    nextMileage: 0,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [partForm, setPartForm] = useState({ partName: "", installedMileage: 0, interval: 0, nextMileage: 0, notes: "" });
  const [showPartForm, setShowPartForm] = useState(false);
  const [editingPartId, setEditingPartId] = useState<string | null>(null);
  const [deletePartConfirm, setDeletePartConfirm] = useState<string | null>(null);

  const [kmInput, setKmInput] = useState("");
  const [editingKmId, setEditingKmId] = useState<string | null>(null);
  const [kmEditValue, setKmEditValue] = useState("");
  const [showKmPanel, setShowKmPanel] = useState(false);
  const [kmStatEditing, setKmStatEditing] = useState(false);
  const [kmStatValue, setKmStatValue] = useState("");

  const [quickLabel, setQuickLabel] = useState<string | null>(null);
  const [quickForm, setQuickForm] = useState({ notes: "", cost: 0, nextMileage: 0, mileage: 0 });

  useEffect(() => {
    const savedMotos = localStorage.getItem("rawat_motor_motorcycles");
    const savedRecords = localStorage.getItem("rawat_motor_records");
    const savedParts = localStorage.getItem("rawat_motor_part_plans");
    const savedKm = localStorage.getItem("rawat_motor_km_logs");
    let motos: Motorcycle[] = [];
    if (savedMotos) {
      try { motos = JSON.parse(savedMotos); } catch {}
    }
    setMotorcycles(motos);
    if (motos.length > 0) setActiveMotorcycleId(motos[0].id);
    if (savedRecords) {
      try { setRecords(JSON.parse(savedRecords).map((r: any) => r.id ? r : {...r, id: crypto.randomUUID()})); } catch {}
    }
    if (savedParts) {
      try { setPartPlans(JSON.parse(savedParts).map((p: any) => p.id ? p : {...p, id: crypto.randomUUID()})); } catch {}
    }
    if (savedKm) {
      try { setKmlogs(JSON.parse(savedKm).map((k: any) => k.id ? k : {...k, id: crypto.randomUUID()})); } catch {}
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) localStorage.setItem("rawat_motor_motorcycles", JSON.stringify(motorcycles));
  }, [motorcycles, isLoaded]);

  useEffect(() => {
    if (isLoaded) localStorage.setItem("rawat_motor_records", JSON.stringify(records));
  }, [records, isLoaded]);

  useEffect(() => {
    if (isLoaded) localStorage.setItem("rawat_motor_part_plans", JSON.stringify(partPlans));
  }, [partPlans, isLoaded]);

  useEffect(() => {
    if (isLoaded) localStorage.setItem("rawat_motor_km_logs", JSON.stringify(kmLogs));
  }, [kmLogs, isLoaded]);

  const activeRecords = records.filter((r) => r.motorcycleId === activeMotorcycleId);
  const activePartPlans = partPlans.filter((p) => p.motorcycleId === activeMotorcycleId);
  const activeKmLogs = kmLogs.filter((k) => k.motorcycleId === activeMotorcycleId);

  const getLatestMileage = () => {
    let max = 0;
    for (const r of activeRecords) {
      if (r.mileage > max) max = r.mileage;
    }
    for (const k of activeKmLogs) {
      if (k.km > max) max = k.km;
    }
    return max;
  };

  const getAlerts = (): AlertItem[] => {
    const latestMileage = getLatestMileage();
    const alerts: AlertItem[] = [];

    const taskMap = new Map<string, MaintenanceTask>();
    for (const r of activeRecords) {
      if (r.nextMileage > 0 && (!taskMap.has(r.task) || r.mileage > (taskMap.get(r.task)?.mileage ?? 0))) {
        taskMap.set(r.task, r);
      }
    }
    for (const [, record] of taskMap) {
      const diff = record.nextMileage - latestMileage;
      alerts.push({ label: record.task, nextMileage: record.nextMileage, status: diff <= 0 ? "overdue" : diff <= 500 ? "warning" : "upcoming", type: "service" });
    }

    for (const plan of activePartPlans) {
      const diff = plan.nextMileage - latestMileage;
      alerts.push({ label: plan.partName, nextMileage: plan.nextMileage, status: diff <= 0 ? "overdue" : diff <= 500 ? "warning" : "upcoming", type: "part" });
    }

    alerts.sort((a, b) => {
      const order = { overdue: 0, warning: 1, upcoming: 2 };
      return order[a.status] - order[b.status];
    });
    return alerts;
  };

  const autoFillNext = (task: string, mileage: number) => {
    const interval = DEFAULT_INTERVALS[task] || 0;
    return interval > 0 ? mileage + interval : 0;
  };

  const saveMotor = () => {
    if (!motorForm.name.trim()) return;
    if (editingMotorId) {
      setMotorcycles((prev) => prev.map((m) => (m.id === editingMotorId ? { ...m, name: motorForm.name.trim(), plate: motorForm.plate.trim() } : m)));
    } else {
      const newMotor: Motorcycle = { id: Date.now().toString(), name: motorForm.name.trim(), plate: motorForm.plate.trim() };
      setMotorcycles((prev) => [...prev, newMotor]);
      setActiveMotorcycleId(newMotor.id);
    }
    setMotorForm({ name: "", plate: "" });
    setEditingMotorId(null);
    setShowMotorModal(false);
  };

  const deleteMotor = (id: string) => {
    const remaining = motorcycles.filter((m) => m.id !== id);
    if (remaining.length === 0) return;
    setMotorcycles(remaining);
    setRecords((prev) => prev.filter((r) => r.motorcycleId !== id));
    setPartPlans((prev) => prev.filter((p) => p.motorcycleId !== id));
    setKmlogs((prev) => prev.filter((k) => k.motorcycleId !== id));
    if (activeMotorcycleId === id) setActiveMotorcycleId(remaining[0].id);
    setDeleteMotorConfirm(null);
  };

  const saveRecord = () => {
    if (!activeMotorcycleId || !form.mileage) return;
    if (editingId) {
      setRecords((prev) =>
        prev.map((r) =>
          r.id === editingId
            ? { ...r, date: form.date, task: form.task, mileage: form.mileage, cost: form.cost, notes: form.notes, nextMileage: form.nextMileage }
            : r
        )
      );
    } else {
      setRecords((prev) => [{
        id: Date.now().toString(),
        date: form.date,
        task: form.task,
        mileage: form.mileage,
        cost: form.cost,
        notes: form.notes,
        nextMileage: form.nextMileage,
        motorcycleId: activeMotorcycleId,
      }, ...prev]);
    }
    setEditingId(null);
    setShowForm(false);
  };

  const savePart = () => {
    if (!activeMotorcycleId || !partForm.partName.trim() || !partForm.interval) return;
    const nextMileage = partForm.installedMileage + partForm.interval;
    if (editingPartId) {
      setPartPlans((prev) =>
        prev.map((p) =>
          p.id === editingPartId
            ? { ...p, partName: partForm.partName.trim(), installedMileage: partForm.installedMileage, interval: partForm.interval, nextMileage, notes: partForm.notes }
            : p
        )
      );
    } else {
      setPartPlans((prev) => [{
        id: Date.now().toString(),
        partName: partForm.partName.trim(),
        installedMileage: partForm.installedMileage,
        interval: partForm.interval,
        nextMileage,
        notes: partForm.notes,
        motorcycleId: activeMotorcycleId,
      }, ...prev]);
    }
    setEditingPartId(null);
    setShowPartForm(false);
  };

  const logKm = () => {
    if (!activeMotorcycleId || !kmInput) return;
    const km = parseInt(kmInput);
    if (!km) return;
    setKmlogs((prev) => [{ id: Date.now().toString(), date: new Date().toISOString().split("T")[0], km, motorcycleId: activeMotorcycleId }, ...prev]);
    setKmInput("");
  };

  const deleteRecord = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
    setDeleteConfirm(null);
  };

  const deletePart = (id: string) => {
    setPartPlans((prev) => prev.filter((p) => p.id !== id));
    setDeletePartConfirm(null);
  };

  const deleteKm = (id: string) => {
    setKmlogs((prev) => prev.filter((k) => k.id !== id));
  };

  const updateKm = (id: string, newKm: number) => {
    setKmlogs((prev) => prev.map((k) => (k.id === id ? { ...k, km: newKm } : k)));
    setEditingKmId(null);
  };

  const saveKmStat = () => {
    const v = parseInt(kmStatValue);
    if (!v || !activeMotorcycleId) return;
    const currentMax = getLatestMileage();
    if (currentMax === v) { setKmStatEditing(false); return; }
    setKmlogs((prev) => {
      const idx = prev.findIndex((k) => k.motorcycleId === activeMotorcycleId && k.km === currentMax);
      if (idx >= 0) { const u = [...prev]; u[idx] = { ...u[idx], km: v }; return u; }
      return prev;
    });
    setRecords((prev) => prev.map((r) => r.motorcycleId === activeMotorcycleId && r.mileage === currentMax ? { ...r, mileage: v } : r));
    setKmStatEditing(false);
  };

  const sortedRecords = [...activeRecords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const sortedPlans = [...activePartPlans].sort((a, b) => a.nextMileage - b.nextMileage);
  const sortedKmLogs = [...activeKmLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const latestMileage = getLatestMileage();
  const alerts = getAlerts();
  const totalCost = activeRecords.reduce((sum, r) => sum + r.cost, 0);
  const activeMotor = motorcycles.find((m) => m.id === activeMotorcycleId);

  if (!isLoaded) return null;

  return (
    <div className="py-6 md:py-12 px-4 sm:px-6 lg:px-8 pb-24">
      <div className="max-w-4xl mx-auto flex flex-col">
        {/* HEADER */}
        <div className="liquid-glass neo-border neo-shadow p-6 md:p-12 bg-white/10 animate-slide-up">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 gap-4">
            <div>
              <div className="inline-block bg-lime-400 px-2 py-0.5 neo-border text-[10px] font-black uppercase tracking-widest mb-2 text-black">Biar Motor Awet</div>
              <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none dark:text-white text-black">RAWAT<br/>MOTOR</h1>
            </div>
            <p className="max-w-xs text-sm md:text-lg font-bold leading-tight uppercase italic dark:text-gray-300 text-gray-800">Catat servis, pantau part, & monitoring KM harian.</p>
          </div>

          {/* MOTORCYCLE SELECTOR */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black uppercase tracking-widest dark:text-gray-400 text-gray-600">Motor Saya</span>
              {motorcycles.length > 0 && (
                <button onClick={() => { setMotorForm({ name: "", plate: "" }); setEditingMotorId(null); setShowMotorModal(true); }}
                  className="px-3 py-1.5 bg-cyan-400 text-black text-[10px] font-black uppercase tracking-widest neo-border neo-shadow hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all">+ Tambah Motor</button>
              )}
            </div>
            {motorcycles.length === 0 ? (
              <button onClick={() => { setMotorForm({ name: "", plate: "" }); setEditingMotorId(null); setShowMotorModal(true); }}
                className="w-full neo-border neo-shadow p-6 text-center bg-white/5 border-dashed border-2 border-black/10 dark:border-white/10 cursor-pointer hover:bg-lime-400/10 transition-all">
                <p className="text-sm font-black uppercase tracking-wider dark:text-gray-400 text-gray-600 mb-1">Belum ada motor</p>
                <p className="text-[10px] font-bold dark:text-gray-500 text-gray-500">Klik di sini buat tambah motor baru</p>
              </button>
            ) : (
              <div className="flex flex-wrap items-stretch gap-2">
                {motorcycles.map((m) => {
                  const isActive = m.id === activeMotorcycleId;
                  return (
                    <div key={m.id} className="flex items-stretch">
                      <button onClick={() => setActiveMotorcycleId(m.id)}
                        className={`px-4 py-3 font-black uppercase tracking-widest text-sm neo-border neo-shadow hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all ${isActive ? "bg-lime-400 text-black" : "bg-white/10 dark:text-white text-black"}`}>
                        {m.name}{m.plate ? ` (${m.plate})` : ""}
                      </button>
                      {isActive && (
                        <button onClick={() => { setMotorForm({ name: m.name, plate: m.plate }); setEditingMotorId(m.id); setShowMotorModal(true); }}
                          className="-ml-[3px] px-2 py-3 bg-lime-400 text-black neo-border neo-shadow hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all" title="Edit motor">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ALERTS */}
          {alerts.length > 0 && (
            <div className="mb-8 space-y-3">
              <h3 className="text-sm font-black uppercase tracking-widest dark:text-white text-black">⏰ Pengingat</h3>
              {alerts.map((alert) => (
                <div key={`${alert.type}-${alert.label}`}
                  className={`neo-border neo-shadow p-4 ${alert.status === "overdue" ? "bg-rose-500/20 border-rose-500" : alert.status === "warning" ? "bg-yellow-400/20 border-yellow-400" : "bg-lime-400/20 border-lime-400"}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-black uppercase tracking-widest text-sm dark:text-white text-black">{alert.label}</span>
                        <span className={`px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest ${alert.type === "part" ? "bg-purple-400 text-black" : "bg-lime-400 text-black"}`}>
                          {alert.type === "part" ? "Part" : "Servis"}
                        </span>
                      </div>
                      <p className="text-xs font-bold dark:text-gray-300 text-gray-700 mt-0.5">
                        {alert.status === "overdue"
                          ? `Lewat ${(latestMileage - alert.nextMileage).toLocaleString("id-ID")} km!`
                          : `${(alert.nextMileage - latestMileage).toLocaleString("id-ID")} km lagi`}
                        {" — "}target di {alert.nextMileage.toLocaleString("id-ID")} km
                      </p>
                    </div>
                    <span className={`shrink-0 px-2 py-1 text-[10px] font-black uppercase tracking-widest neo-border ${alert.status === "overdue" ? "bg-rose-500 text-white" : alert.status === "warning" ? "bg-yellow-400 text-black" : "bg-lime-400 text-black"}`}>
                      {alert.status === "overdue" ? "Lewat!" : alert.status === "warning" ? "Segera" : "Aman"}
                    </span>
                  </div>
                  {alert.status !== "upcoming" && alert.type === "service" && (
                    quickLabel === alert.label ? (
                      <div className="mt-3 space-y-2 bg-white/10 neo-border p-3">
                        <input type="text" value={quickForm.notes} onChange={(e) => setQuickForm((prev) => ({ ...prev, notes: e.target.value }))}
                          placeholder="Nama oli / part..." className="w-full px-3 py-2 text-xs font-bold bg-white dark:bg-gray-800 neo-border neo-shadow focus:translate-x-0.5 focus:translate-y-0.5 focus:shadow-none transition-all outline-none text-black dark:text-white" />
                        <input type="number" value={quickForm.mileage || ""} onChange={(e) => setQuickForm((prev) => ({ ...prev, mileage: parseInt(e.target.value) || 0 }))}
                          placeholder={`KM saat ganti (terkini ${latestMileage.toLocaleString("id-ID")})`} className="w-full px-3 py-2 text-xs font-bold bg-white dark:bg-gray-800 neo-border neo-shadow focus:translate-x-0.5 focus:translate-y-0.5 focus:shadow-none transition-all outline-none text-black dark:text-white" />
                        <input type="number" value={quickForm.cost || ""} onChange={(e) => setQuickForm((prev) => ({ ...prev, cost: parseInt(e.target.value) || 0 }))}
                          placeholder="Biaya (Rp)" className="w-full px-3 py-2 text-xs font-bold bg-white dark:bg-gray-800 neo-border neo-shadow focus:translate-x-0.5 focus:translate-y-0.5 focus:shadow-none transition-all outline-none text-black dark:text-white" />
                        <input type="number" value={quickForm.nextMileage || ""} onChange={(e) => setQuickForm((prev) => ({ ...prev, nextMileage: parseInt(e.target.value) || 0 }))}
                          placeholder="KM ganti lagi" className="w-full px-3 py-2 text-xs font-bold bg-white dark:bg-gray-800 neo-border neo-shadow focus:translate-x-0.5 focus:translate-y-0.5 focus:shadow-none transition-all outline-none text-black dark:text-white" />
                        <div className="flex gap-2">
                          <button onClick={() => setQuickLabel(null)}
                            className="flex-1 py-2 bg-gray-300 dark:bg-gray-700 text-black dark:text-white font-black uppercase tracking-widest text-[10px] neo-border neo-shadow hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all">Batal</button>
                          <button onClick={() => {
                            if (!activeMotorcycleId) return;
                            const serviceKm = quickForm.mileage > 0 ? quickForm.mileage : latestMileage;
                            const interval = DEFAULT_INTERVALS[alert.label] || 0;
                            const record: MaintenanceTask = {
                              id: Date.now().toString(),
                              date: new Date().toISOString().split("T")[0],
                              task: alert.label,
                              mileage: serviceKm,
                              cost: quickForm.cost,
                              notes: quickForm.notes,
                              nextMileage: quickForm.nextMileage > 0 ? quickForm.nextMileage : (interval > 0 ? serviceKm + interval : 0),
                              motorcycleId: activeMotorcycleId,
                            };
                            setRecords((prev) => [record, ...prev]);
                            setQuickLabel(null);
                            setQuickForm({ notes: "", cost: 0, nextMileage: 0, mileage: 0 });
                            setActiveTab("riwayat");
                          }}
                            className="flex-1 py-2 bg-lime-400 text-black font-black uppercase tracking-widest text-[10px] neo-border neo-shadow hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all">Simpan</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => {
                        const interval = DEFAULT_INTERVALS[alert.label] || 0;
                        setQuickLabel(alert.label);
                        setQuickForm({
                          notes: "",
                          cost: 0,
                          mileage: latestMileage,
                          nextMileage: interval > 0 ? latestMileage + interval : 0,
                        });
                      }}
                        className="mt-3 w-full py-2 bg-black text-white dark:bg-white dark:text-black font-black uppercase tracking-widest text-[10px] neo-border neo-shadow hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all">
                        ✓ Ganti Sekarang
                      </button>
                    )
                  )}
                </div>
              ))}
            </div>
          )}

          {/* STATS + KM INPUT */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-white/10 neo-border neo-shadow p-4 cursor-pointer" onClick={() => { if (!kmStatEditing && latestMileage > 0) { setKmStatValue(String(latestMileage)); setKmStatEditing(true); } }}>
              <p className="text-[10px] font-black uppercase tracking-widest dark:text-gray-400 text-gray-600">KM Terkini</p>
              {kmStatEditing ? (
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <input type="number" value={kmStatValue} onChange={(e) => setKmStatValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") saveKmStat(); if (e.key === "Escape") setKmStatEditing(false); }}
                    className="w-full px-2 py-1 font-bold bg-white dark:bg-gray-800 neo-border neo-shadow outline-none text-black dark:text-white text-lg" autoFocus />
                  <button onClick={saveKmStat} className="text-lime-400 hover:text-lime-600 font-black text-lg">✓</button>
                  <button onClick={() => setKmStatEditing(false)} className="text-rose-400 hover:text-rose-600 font-black text-lg">✗</button>
                </div>
              ) : (
                <p className="text-xl md:text-3xl font-black dark:text-white text-black truncate">
                  {latestMileage > 0 ? `${latestMileage.toLocaleString("id-ID")} km` : "—"}
                </p>
              )}
            </div>
            <div className="bg-white/10 neo-border neo-shadow p-4">
              <p className="text-[10px] font-black uppercase tracking-widest dark:text-gray-400 text-gray-600">Catatan Servis</p>
              <p className="text-xl md:text-3xl font-black dark:text-white text-black truncate">{activeRecords.length}</p>
            </div>
            <div className="bg-white/10 neo-border neo-shadow p-4">
              <p className="text-[10px] font-black uppercase tracking-widest dark:text-gray-400 text-gray-600">Total Biaya</p>
              <p className="text-xl md:text-3xl font-black dark:text-white text-black truncate">
                {totalCost > 0 ? `Rp${totalCost.toLocaleString("id-ID")}` : "—"}
              </p>
            </div>
            <div className="bg-white/10 neo-border neo-shadow p-4">
              <p className="text-[10px] font-black uppercase tracking-widest dark:text-gray-400 text-gray-600">Rencana Part</p>
              <p className="text-xl md:text-3xl font-black dark:text-white text-black truncate">{activePartPlans.length}</p>
            </div>
          </div>

          {/* KM INPUT */}
          <div className="flex gap-3 items-center bg-white/5 neo-border p-3">
            <span className="text-xs font-black uppercase tracking-widest dark:text-white text-black shrink-0">📍 Update KM</span>
            <input type="number" value={kmInput} onChange={(e) => setKmInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && logKm()}
              placeholder="KM hari ini..." className="flex-1 px-3 py-2 font-bold bg-white dark:bg-gray-800 neo-border neo-shadow focus:translate-x-0.5 focus:translate-y-0.5 focus:shadow-none transition-all outline-none text-black dark:text-white text-sm min-w-0" />
            <button onClick={logKm} disabled={!kmInput}
              className="shrink-0 px-4 py-2 bg-lime-400 text-black font-black uppercase tracking-widest text-xs neo-border neo-shadow hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all disabled:opacity-30 disabled:cursor-not-allowed">Simpan</button>
          </div>
          {sortedKmLogs.length > 0 && (
            <div className="mt-2">
              <button onClick={() => setShowKmPanel(!showKmPanel)}
                className="text-[10px] font-black uppercase tracking-widest dark:text-gray-400 text-gray-600 hover:text-lime-400 transition-colors mb-1.5">
                📋 Riwayat KM ({sortedKmLogs.length}) {showKmPanel ? "▲" : "▼"}
              </button>
              {showKmPanel ? (
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {sortedKmLogs.map((log) => (
                    <div key={log.id} className="flex items-center gap-2 text-[10px] font-bold group">
                      {editingKmId === log.id ? (
                        <div className="flex items-center gap-1 flex-1">
                          <input type="number" value={kmEditValue} onChange={(e) => setKmEditValue(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") { const v = parseInt(kmEditValue); if (v) updateKm(log.id, v); } if (e.key === "Escape") setEditingKmId(null); }}
                            className="w-24 px-2 py-0.5 font-bold bg-white neo-border neo-shadow outline-none text-black text-[10px]" autoFocus />
                          <button onClick={() => { const v = parseInt(kmEditValue); if (v) updateKm(log.id, v); }} className="text-lime-400 hover:text-lime-600">✓</button>
                          <button onClick={() => setEditingKmId(null)} className="text-gray-400 hover:text-gray-600">✗</button>
                        </div>
                      ) : (
                        <span className="flex-1 dark:text-gray-400 text-gray-600">
                          {new Date(log.date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}: <strong className="dark:text-white text-black">{log.km.toLocaleString("id-ID")} km</strong>
                        </span>
                      )}
                      {editingKmId !== log.id && (
                        <span className={`flex gap-1 ${editMode ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                          <button onClick={() => { setEditingKmId(log.id); setKmEditValue(String(log.km)); }}
                            className="text-cyan-400 hover:text-cyan-600">✎</button>
                          <button onClick={() => { if (confirm("Hapus log KM ini?")) deleteKm(log.id); }}
                            className="text-rose-400 hover:text-rose-600">✕</button>
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {sortedKmLogs.slice(0, 5).map((log) => (
                    <span key={log.id} className="text-[10px] font-bold dark:text-gray-400 text-gray-600 bg-white/10 px-2 py-0.5 neo-border">
                      {new Date(log.date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}: {log.km.toLocaleString("id-ID")} km
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* CONTENT (only when motor selected) */}
        {!activeMotor ? (
          <div className="mt-12 liquid-glass neo-border neo-shadow p-12 text-center border-dashed border-4 border-black/10 dark:border-white/10">
            <p className="text-xl font-black uppercase tracking-tighter dark:text-white/30 text-black/30 italic">Belum ada motor...</p>
            <p className="text-sm font-bold dark:text-gray-500 text-gray-500 mt-2">Klik &quot;+ Tambah Motor&quot; di atas buat mulai</p>
          </div>
        ) : (
        <>
        {/* TABS */}
        <div className="mt-8 flex border-b-2 border-black/10 dark:border-white/10 items-stretch">
          <button onClick={() => setActiveTab("riwayat")}
            className={`px-6 py-3 font-black uppercase tracking-widest text-sm transition-all ${activeTab === "riwayat" ? "border-b-2 border-lime-400 text-lime-400" : "dark:text-gray-500 text-gray-500"}`}>
            Riwayat Servis
          </button>
          <button onClick={() => setActiveTab("rencana")}
            className={`px-6 py-3 font-black uppercase tracking-widest text-sm transition-all ${activeTab === "rencana" ? "border-b-2 border-purple-400 text-purple-400" : "dark:text-gray-500 text-gray-500"}`}>
            Rencana Ganti Part
          </button>
          <button onClick={() => setEditMode(!editMode)}
            className={`ml-auto px-3 py-1 self-center font-black uppercase tracking-widest text-[10px] neo-border neo-shadow hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all ${editMode ? "bg-rose-500 text-white" : "bg-white/10 dark:text-white text-black"}`}>
            {editMode ? "Mode Bersih" : "Mode Edit"}
          </button>
        </div>

        {/* TAB: RIWAYAT SERVIS */}
        {activeTab === "riwayat" && (
          <div className="mt-6 space-y-4 animate-slide-up">
            <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter dark:text-white text-black">
              Riwayat Servis {activeMotor ? `— ${activeMotor.name}` : ""}
            </h2>
            {sortedRecords.length === 0 ? (
              <div className="liquid-glass neo-border neo-shadow p-12 text-center border-dashed border-4 border-black/10 dark:border-white/10">
                <p className="text-xl font-black uppercase tracking-tighter dark:text-white/30 text-black/30 italic">Belum ada catatan servis...</p>
              </div>
            ) : (
              sortedRecords.map((record) => (
                <div key={record.id} className="liquid-glass neo-border neo-shadow p-4 md:p-6 bg-white/5 flex items-start justify-between gap-3 group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="bg-lime-400 px-2 py-0.5 neo-border text-[10px] font-black uppercase tracking-widest text-black">{record.task}</span>
                      <span className="text-xs font-black uppercase tracking-widest dark:text-gray-400 text-gray-600">
                        {new Date(record.date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm font-bold dark:text-gray-300 text-gray-700 flex-wrap">
                      <span>📍 {record.mileage.toLocaleString("id-ID")} km</span>
                      {record.cost > 0 && <span>💰 Rp{record.cost.toLocaleString("id-ID")}</span>}
                      {record.nextMileage > 0 && <span>⏰ Ganti lagi ≤ {record.nextMileage.toLocaleString("id-ID")} km</span>}
                    </div>
                    {record.notes && <p className="text-sm font-medium dark:text-gray-400 text-gray-600 mt-1">{record.notes}</p>}
                  </div>
                  <div className={`flex gap-1 shrink-0 transition-opacity ${editMode ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                    <button onClick={() => { setEditingId(record.id); setForm({ date: record.date, task: record.task, mileage: record.mileage, cost: record.cost, notes: record.notes, nextMileage: record.nextMileage }); setShowForm(true); }}
                      className="p-1.5 bg-cyan-400 text-black neo-border neo-shadow hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all" title="Edit">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                    </button>
                    <button onClick={() => setDeleteConfirm(record.id)}
                      className="p-1.5 bg-rose-500 text-white neo-border neo-shadow hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all" title="Hapus">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB: RENCANA GANTI PART */}
        {activeTab === "rencana" && (
          <div className="mt-6 space-y-4 animate-slide-up">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter dark:text-white text-black">
                Rencana Part {activeMotor ? `— ${activeMotor.name}` : ""}
              </h2>
              <button onClick={() => { setActiveTab("rencana"); setShowPartForm(!showPartForm); }}
                className="px-4 py-3 bg-purple-400 text-black font-black uppercase tracking-widest text-sm neo-border neo-shadow hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all">{showPartForm ? "Tutup" : "+ Part"}</button>
            </div>

            {showPartForm && (
              <div className="p-6 bg-white/10 neo-border space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase tracking-widest dark:text-white text-black">Nama Part</label>
                    <input type="text" value={partForm.partName} onChange={(e) => setPartForm((prev) => ({ ...prev, partName: e.target.value }))} placeholder="Contoh: Kampas Rem Depan"
                      className="w-full px-3 py-3 font-bold bg-white dark:bg-gray-800 neo-border neo-shadow focus:translate-x-0.5 focus:translate-y-0.5 focus:shadow-none transition-all outline-none text-black dark:text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase tracking-widest dark:text-white text-black">KM Pasang</label>
                    <input type="number" value={partForm.installedMileage || ""} onChange={(e) => {
                      const installed = parseInt(e.target.value) || 0;
                      setPartForm((prev) => ({ ...prev, installedMileage: installed, nextMileage: installed + (prev.interval || 0) }));
                    }} placeholder="KM saat pasang"
                      className="w-full px-3 py-3 font-bold bg-white dark:bg-gray-800 neo-border neo-shadow focus:translate-x-0.5 focus:translate-y-0.5 focus:shadow-none transition-all outline-none text-black dark:text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase tracking-widest dark:text-white text-black">Interval (km)</label>
                    <input type="number" value={partForm.interval || ""} onChange={(e) => {
                      const interval = parseInt(e.target.value) || 0;
                      setPartForm((prev) => ({ ...prev, interval, nextMileage: prev.installedMileage + interval }));
                    }} placeholder="Contoh: 5000"
                      className="w-full px-3 py-3 font-bold bg-white dark:bg-gray-800 neo-border neo-shadow focus:translate-x-0.5 focus:translate-y-0.5 focus:shadow-none transition-all outline-none text-black dark:text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase tracking-widest dark:text-white text-black">Ganti di KM</label>
                    <input type="number" value={partForm.nextMileage || ""} onChange={(e) => setPartForm((prev) => ({ ...prev, nextMileage: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-3 font-bold bg-white dark:bg-gray-800 neo-border neo-shadow focus:translate-x-0.5 focus:translate-y-0.5 focus:shadow-none transition-all outline-none text-black dark:text-white" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase tracking-widest dark:text-white text-black">Catatan</label>
                  <textarea value={partForm.notes} onChange={(e) => setPartForm((prev) => ({ ...prev, notes: e.target.value }))} placeholder="Merk part, kondisi, dll..." rows={2}
                    className="w-full px-3 py-3 font-bold bg-white dark:bg-gray-800 neo-border neo-shadow focus:translate-x-0.5 focus:translate-y-0.5 focus:shadow-none transition-all outline-none text-black dark:text-white resize-none" />
                </div>
                <button onClick={savePart} disabled={!partForm.partName.trim() || !partForm.interval}
                  className="w-full py-3 px-4 bg-black text-white dark:bg-white dark:text-black font-black uppercase tracking-widest neo-border neo-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-30 disabled:cursor-not-allowed">Tambah Part</button>
              </div>
            )}

            {sortedPlans.length === 0 ? (
              <div className="liquid-glass neo-border neo-shadow p-12 text-center border-dashed border-4 border-black/10 dark:border-white/10">
                <p className="text-xl font-black uppercase tracking-tighter dark:text-white/30 text-black/30 italic">Belum ada rencana ganti part...</p>
              </div>
            ) : (
              sortedPlans.map((plan) => {
                const diff = plan.nextMileage - latestMileage;
                const status = diff <= 0 ? "overdue" : diff <= 500 ? "warning" : "upcoming";
                return (
                  <div key={plan.id} className="liquid-glass neo-border neo-shadow p-4 md:p-6 bg-white/5 flex items-start justify-between gap-3 group">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="bg-purple-400 px-2 py-0.5 neo-border text-[10px] font-black uppercase tracking-widest text-black">{plan.partName}</span>
                        <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-widest neo-border ${status === "overdue" ? "bg-rose-500 text-white" : status === "warning" ? "bg-yellow-400 text-black" : "bg-lime-400 text-black"}`}>
                          {status === "overdue" ? "Lewat!" : status === "warning" ? "Segera" : `${diff.toLocaleString("id-ID")} km lagi`}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm font-bold dark:text-gray-300 text-gray-700 flex-wrap">
                        <span>🔧 Pasang: {plan.installedMileage.toLocaleString("id-ID")} km</span>
                        <span>📊 Interval: {plan.interval.toLocaleString("id-ID")} km</span>
                        <span>⏰ Ganti ≤ {plan.nextMileage.toLocaleString("id-ID")} km</span>
                      </div>
                      {plan.notes && <p className="text-sm font-medium dark:text-gray-400 text-gray-600 mt-1">{plan.notes}</p>}
                    </div>
                    <div className={`flex gap-1 shrink-0 transition-opacity ${editMode ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                      <button onClick={() => { setEditingPartId(plan.id); setPartForm({ partName: plan.partName, installedMileage: plan.installedMileage, interval: plan.interval, nextMileage: plan.nextMileage, notes: plan.notes }); setShowPartForm(true); }}
                        className="p-1.5 bg-cyan-400 text-black neo-border neo-shadow hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all" title="Edit">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                      </button>
                      <button onClick={() => setDeletePartConfirm(plan.id)}
                        className="p-1.5 bg-rose-500 text-white neo-border neo-shadow hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all" title="Hapus">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
        </>)}
        {/* EDUCATIONAL CONTENT */}
        <div className="mt-12 space-y-8 animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="liquid-glass neo-border neo-shadow p-6 bg-white/5">
              <h4 className="text-xl font-black uppercase tracking-tighter mb-4 dark:text-white text-black">Kenapa Catat Servis Motor?</h4>
              <ul className="space-y-3 text-sm font-medium dark:text-gray-300 text-gray-700">
                <li><strong className="text-black dark:text-white">Gak Lupa:</strong> Tau kapan terakhir ganti oli, setel rantai, atau servis rutin.</li>
                <li><strong className="text-black dark:text-white">Hemat Biaya:</strong> Servis rutin bikin motor awet & hindari kerusakan besar.</li>
                <li><strong className="text-black dark:text-white">Nilai Jual:</strong> Riwayat servis lengkap ningkatin harga jual motor lo.</li>
                <li><strong className="text-black dark:text-white">Rencana Part:</strong> Pantau jadwal ganti part biar gak kelewatan.</li>
              </ul>
            </div>
            <div className="liquid-glass neo-border neo-shadow p-6 bg-white/5">
              <h4 className="text-xl font-black uppercase tracking-tighter mb-4 dark:text-white text-black">Interval Perawatan Standar</h4>
              <div className="space-y-2 text-sm font-medium dark:text-gray-300 text-gray-700">
                {Object.entries(DEFAULT_INTERVALS).map(([task, km]) =>
                  km > 0 ? (
                    <div key={task} className="flex justify-between border-b border-black/10 dark:border-white/10 pb-1">
                      <span>{task}</span><span className="font-black">{km.toLocaleString("id-ID")} km</span>
                    </div>
                  ) : null
                )}
              </div>
            </div>
          </div>
        </div>

        {/* AD SPACE */}
        <div className="mt-12"><AdSpace className="w-full" height="h-32 md:h-48" /></div>

        <div className="mt-12 text-center">
          <Link href="/" className="inline-block text-sm font-black uppercase underline decoration-2 hover:text-lime-500 transition-colors">Balik ke Beranda</Link>
        </div>
      </div>

      {/* FAB: CATAT SERVIS BARU (floating bottom right) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {showForm && (
          <div className="bg-white dark:bg-gray-900 neo-border neo-shadow-lg p-4 md:p-6 w-[calc(100vw-3rem)] max-w-md animate-slide-up max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black uppercase tracking-tighter dark:text-white text-black">Catat Servis Baru</h3>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest dark:text-gray-400 text-gray-600">Tanggal</label>
                  <input type="date" value={form.date} onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2.5 font-bold bg-white dark:bg-gray-800 neo-border neo-shadow focus:translate-x-0.5 focus:translate-y-0.5 focus:shadow-none transition-all outline-none text-black dark:text-white text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest dark:text-gray-400 text-gray-600">Tugas</label>
                  <select value={form.task} onChange={(e) => { const task = e.target.value; setForm((prev) => ({ ...prev, task, nextMileage: autoFillNext(task, prev.mileage || latestMileage) })); }}
                    className="w-full px-3 py-2.5 font-bold bg-white dark:bg-gray-800 neo-border neo-shadow focus:translate-x-0.5 focus:translate-y-0.5 focus:shadow-none transition-all outline-none text-black dark:text-white text-sm cursor-pointer appearance-none"
                    style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'3\' stroke-linecap=\'square\'%3e%3cpath d=\'M6 9l6 6 6-6\'/%3e%3c/svg%3e")', backgroundRepeat: "no-repeat", backgroundPosition: "right 0.5rem center", backgroundSize: "1.2em" }}>
                    {TASK_OPTIONS.map((t) => (<option key={t} value={t}>{t}</option>))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest dark:text-gray-400 text-gray-600">KM</label>
                  <input type="number" value={form.mileage || ""} onChange={(e) => { const mileage = parseInt(e.target.value) || 0; setForm((prev) => ({ ...prev, mileage, nextMileage: autoFillNext(prev.task, mileage) })); }} placeholder="15000"
                    className="w-full px-3 py-2.5 font-bold bg-white dark:bg-gray-800 neo-border neo-shadow focus:translate-x-0.5 focus:translate-y-0.5 focus:shadow-none transition-all outline-none text-black dark:text-white text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest dark:text-gray-400 text-gray-600">Biaya (Rp)</label>
                  <input type="number" value={form.cost || ""} onChange={(e) => setForm((prev) => ({ ...prev, cost: parseInt(e.target.value) || 0 }))} placeholder="50000"
                    className="w-full px-3 py-2.5 font-bold bg-white dark:bg-gray-800 neo-border neo-shadow focus:translate-x-0.5 focus:translate-y-0.5 focus:shadow-none transition-all outline-none text-black dark:text-white text-sm" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest dark:text-gray-400 text-gray-600">Catatan</label>
                <textarea value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} placeholder="Merk oli, dll..." rows={1}
                  className="w-full px-3 py-2.5 font-bold bg-white dark:bg-gray-800 neo-border neo-shadow focus:translate-x-0.5 focus:translate-y-0.5 focus:shadow-none transition-all outline-none text-black dark:text-white text-sm resize-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest dark:text-gray-400 text-gray-600">Ganti Lagi di KM</label>
                <input type="number" value={form.nextMileage || ""} onChange={(e) => setForm((prev) => ({ ...prev, nextMileage: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2.5 font-bold bg-white dark:bg-gray-800 neo-border neo-shadow focus:translate-x-0.5 focus:translate-y-0.5 focus:shadow-none transition-all outline-none text-black dark:text-white text-sm" />
                {DEFAULT_INTERVALS[form.task] > 0 && (
                  <p className="text-[8px] font-bold dark:text-gray-400 text-gray-500 mt-0.5">Default tiap {DEFAULT_INTERVALS[form.task].toLocaleString("id-ID")} km</p>
                )}
              </div>
              <button onClick={saveRecord} disabled={!form.mileage}
                className="w-full py-3 px-4 bg-lime-400 text-black font-black uppercase tracking-widest text-sm neo-border neo-shadow hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all disabled:opacity-30 disabled:cursor-not-allowed">{editingId ? "Update" : "Simpan"}</button>
            </div>
          </div>
        )}

        <button onClick={() => { setShowForm(!showForm); if (!showForm) { setActiveTab("riwayat"); setEditingId(null); } }}
          className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-lime-400 text-black neo-border neo-shadow-lg hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center justify-center shadow-2xl">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="square">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        </button>
      </div>

      {/* MOTORCYCLE MODAL + DELETE CONFIRMS */}
      {(showMotorModal || deleteMotorConfirm || deleteConfirm || deletePartConfirm) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-scale-in" onClick={() => { setShowMotorModal(false); setDeleteMotorConfirm(null); setDeleteConfirm(null); setDeletePartConfirm(null); }}>
          {showMotorModal && (
              <div className="liquid-glass neo-border neo-shadow-lg p-6 md:p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-black uppercase tracking-tighter mb-4 dark:text-white text-black">{editingMotorId ? "Edit Motor" : "Tambah Motor Baru"}</h3>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase tracking-widest dark:text-gray-400 text-gray-600">Nama Motor</label>
                  <input type="text" value={motorForm.name} onChange={(e) => setMotorForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Contoh: Vario 125"
                    className="w-full px-3 py-3 font-bold bg-white dark:bg-gray-800 neo-border neo-shadow focus:translate-x-0.5 focus:translate-y-0.5 focus:shadow-none transition-all outline-none text-black dark:text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase tracking-widest dark:text-gray-400 text-gray-600">Plat Nomor <span className="text-gray-400">(opsional)</span></label>
                  <input type="text" value={motorForm.plate} onChange={(e) => setMotorForm((prev) => ({ ...prev, plate: e.target.value }))} placeholder="Contoh: B 1234 ABC"
                    className="w-full px-3 py-3 font-bold bg-white dark:bg-gray-800 neo-border neo-shadow focus:translate-x-0.5 focus:translate-y-0.5 focus:shadow-none transition-all outline-none text-black dark:text-white uppercase" />
                </div>
                <div className="flex gap-4 pt-2">
                  <button onClick={() => { setShowMotorModal(false); setEditingMotorId(null); setMotorForm({ name: "", plate: "" }); }}
                    className="flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-700 text-black dark:text-white font-black uppercase tracking-widest neo-border neo-shadow hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all text-sm">Batal</button>
                  <button onClick={saveMotor} disabled={!motorForm.name.trim()}
                    className="flex-1 py-3 px-4 bg-lime-400 text-black font-black uppercase tracking-widest neo-border neo-shadow hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all text-sm disabled:opacity-30 disabled:cursor-not-allowed">{editingMotorId ? "Simpan" : "Tambah"}</button>
                </div>
                {editingMotorId && (
                  <button onClick={() => { setDeleteMotorConfirm(editingMotorId); setShowMotorModal(false); }}
                    className="w-full py-2 text-[10px] font-black uppercase text-rose-500 underline decoration-2 hover:text-rose-700 transition-colors">Hapus Motor Ini</button>
                )}
              </div>
            </div>
          )}

          {deleteMotorConfirm && (
            <div className="liquid-glass neo-border neo-shadow-lg p-6 md:p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-black uppercase tracking-tighter mb-4 dark:text-white text-black">Hapus Motor?</h3>
              <p className="text-sm font-bold dark:text-gray-400 text-gray-600 mb-6">Semua data motor ini juga akan dihapus.</p>
              <div className="flex gap-4">
                <button onClick={() => setDeleteMotorConfirm(null)} className="flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-700 text-black dark:text-white font-black uppercase tracking-widest neo-border neo-shadow hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all text-sm">Batal</button>
                <button onClick={() => deleteMotor(deleteMotorConfirm)} className="flex-1 py-3 px-4 bg-rose-500 text-white font-black uppercase tracking-widest neo-border neo-shadow hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all text-sm">Hapus</button>
              </div>
            </div>
          )}

          {deleteConfirm && (
            <div className="liquid-glass neo-border neo-shadow-lg p-6 md:p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-black uppercase tracking-tighter mb-4 dark:text-white text-black">Hapus Catatan?</h3>
              <p className="text-sm font-bold dark:text-gray-400 text-gray-600 mb-6">Catatan servis ini akan dihapus permanen.</p>
              <div className="flex gap-4">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-700 text-black dark:text-white font-black uppercase tracking-widest neo-border neo-shadow hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all text-sm">Batal</button>
                <button onClick={() => deleteRecord(deleteConfirm)} className="flex-1 py-3 px-4 bg-rose-500 text-white font-black uppercase tracking-widest neo-border neo-shadow hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all text-sm">Hapus</button>
              </div>
            </div>
          )}

          {deletePartConfirm && (
            <div className="liquid-glass neo-border neo-shadow-lg p-6 md:p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-black uppercase tracking-tighter mb-4 dark:text-white text-black">Hapus Rencana Part?</h3>
              <p className="text-sm font-bold dark:text-gray-400 text-gray-600 mb-6">Rencana part ini akan dihapus permanen.</p>
              <div className="flex gap-4">
                <button onClick={() => setDeletePartConfirm(null)} className="flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-700 text-black dark:text-white font-black uppercase tracking-widest neo-border neo-shadow hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all text-sm">Batal</button>
                <button onClick={() => deletePart(deletePartConfirm)} className="flex-1 py-3 px-4 bg-rose-500 text-white font-black uppercase tracking-widest neo-border neo-shadow hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all text-sm">Hapus</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
