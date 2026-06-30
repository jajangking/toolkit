"use client";

interface ControlPanelProps {
  status: "idle" | "calibrated" | "running";
  isRunning: boolean;
  isCalibrated: boolean;
  cameraSource: "webcam" | "ip";
  ipUrl: string;
  debug: boolean;
  ballCount: number;
  speed: number;
  threshold: number;
  onCalibrate: () => void;
  onToggleRunning: () => void;
  onReset: () => void;
  onCameraSourceChange: (v: "webcam" | "ip") => void;
  onIpUrlChange: (v: string) => void;
  onConnectIp: () => void;
  onDebugChange: (v: boolean) => void;
  onBallCountChange: (v: number) => void;
  onSpeedChange: (v: number) => void;
  onThresholdChange: (v: number) => void;
}

export default function ControlPanel({
  status,
  isRunning,
  isCalibrated,
  cameraSource,
  ipUrl,
  debug,
  ballCount,
  speed,
  threshold,
  onCalibrate,
  onToggleRunning,
  onReset,
  onCameraSourceChange,
  onIpUrlChange,
  onConnectIp,
  onDebugChange,
  onBallCountChange,
  onSpeedChange,
  onThresholdChange,
}: ControlPanelProps) {
  const ballOptions = [1, 3, 5];

  return (
    <div className="liquid-glass neo-border neo-shadow p-6 space-y-6 bg-white/10 animate-slide-up">
      {/* Status badge */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="inline-block bg-fuchsia-400 px-2 py-0.5 neo-border text-[10px] font-black uppercase tracking-widest text-black">
            INTERAKTIF
          </span>
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 neo-border text-[10px] font-black uppercase tracking-widest transition-colors ${
              isRunning
                ? "bg-lime-400 text-black"
                : isCalibrated
                  ? "bg-yellow-400 text-black"
                  : "bg-gray-200 text-gray-500"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isRunning
                  ? "bg-green-800 animate-pulse"
                  : "bg-current"
              }`}
            />
            {isRunning
              ? "Running"
              : isCalibrated
                ? "Calibrated"
                : "Idle"}
          </span>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest dark:text-gray-500 text-gray-400">
          {cameraSource === "webcam" ? "Webcam" : "IP Camera"} • {threshold} threshold
        </span>
      </div>

      {/* Camera source selector */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex neo-border overflow-hidden">
          <button
            onClick={() => onCameraSourceChange("webcam")}
            className={`px-4 py-1.5 text-xs font-black uppercase tracking-widest transition-colors ${
              cameraSource === "webcam"
                ? "bg-yellow-400 text-black"
                : "bg-white text-gray-500 hover:bg-gray-100"
            }`}
          >
            Webcam
          </button>
          <button
            onClick={() => onCameraSourceChange("ip")}
            className={`px-4 py-1.5 text-xs font-black uppercase tracking-widest transition-colors border-l-2 border-black ${
              cameraSource === "ip"
                ? "bg-cyan-400 text-black"
                : "bg-white text-gray-500 hover:bg-gray-100"
            }`}
          >
            IP Camera
          </button>
        </div>

        {cameraSource === "ip" && (
          <div className="flex gap-1 flex-1 min-w-[200px]">
            <input
              type="text"
              value={ipUrl}
              onChange={(e) => onIpUrlChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onConnectIp()}
              placeholder="http://192.168.1.100:8080/video"
              className="flex-1 px-3 py-1.5 text-xs font-bold bg-white text-black neo-border outline-none"
            />
            <button
              onClick={onConnectIp}
              className="px-3 py-1.5 text-xs font-black uppercase tracking-widest bg-cyan-400 text-black neo-border neo-shadow hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
            >
              Connect
            </button>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={onCalibrate}
          className="px-5 py-2.5 text-xs font-black uppercase tracking-widest bg-cyan-400 text-black neo-border neo-shadow hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
        >
          🌄 Calibrate BG
        </button>

        <button
          onClick={onToggleRunning}
          disabled={!isCalibrated}
          className={`px-5 py-2.5 text-xs font-black uppercase tracking-widest neo-border neo-shadow transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow ${
            isRunning
              ? "bg-rose-500 text-white hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
              : "bg-lime-400 text-black hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
          }`}
        >
          {isRunning ? "■ Stop" : "▶ Start"}
        </button>

        <button
          onClick={onReset}
          disabled={!isCalibrated}
          className="px-5 py-2.5 text-xs font-black uppercase tracking-widest bg-orange-400 text-black neo-border neo-shadow hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow"
        >
          🔄 Reset Ball
        </button>
      </div>

      {/* Settings grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {/* Debug */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={debug}
              onChange={(e) => onDebugChange(e.target.checked)}
              className="w-4 h-4 accent-fuchsia-400"
            />
            <span className="text-xs font-black uppercase tracking-widest">
              Show Debug
            </span>
          </label>
        </div>

        {/* Ball count */}
        <div>
          <p className="text-xs font-black uppercase tracking-widest mb-2">
            Balls
          </p>
          <div className="flex gap-1">
            {ballOptions.map((n) => (
              <button
                key={n}
                onClick={() => onBallCountChange(n)}
                disabled={isRunning}
                className={`flex-1 px-3 py-1.5 text-xs font-black neo-border transition-all disabled:opacity-50 ${
                  ballCount === n
                    ? "bg-yellow-400 text-black neo-shadow"
                    : "bg-white dark:bg-gray-800 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Speed */}
        <div>
          <label className="block text-xs font-black uppercase tracking-widest mb-2">
            Speed: {speed.toFixed(1)}×
          </label>
          <input
            type="range"
            min={0.2}
            max={3.0}
            step={0.1}
            value={speed}
            onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
            className="w-full accent-fuchsia-400"
          />
        </div>

        {/* Threshold */}
        <div>
          <label className="block text-xs font-black uppercase tracking-widest mb-2">
            Threshold: {threshold}
          </label>
          <input
            type="range"
            min={5}
            max={100}
            step={1}
            value={threshold}
            onChange={(e) => onThresholdChange(parseInt(e.target.value))}
            className="w-full accent-fuchsia-400"
          />
        </div>
      </div>

      {/* Help text */}
      <div className="text-[10px] font-bold uppercase tracking-wider dark:text-gray-500 text-gray-400 border-t-2 border-black/10 dark:border-white/10 pt-4">
        <span>
          1. Calibrate BG pas tembok kosong &rarr; 2. Angkat objek di depan tembok &rarr;
          3. Start &rarr; bola mantul kena objek
        </span>
      </div>
    </div>
  );
}
