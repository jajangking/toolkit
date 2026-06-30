"use client"

import { useState, useEffect } from "react"
import CanvasEditor from "@/components/WatchfaceGenerator/CanvasEditor"

export default function WatchfaceGeneratorPage() {
  const [isLoaded, setIsLoaded] = useState(false)
  useEffect(() => { setIsLoaded(true) }, [])

  const handlePack = (blob: Blob) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'watchface.zip'
    a.click(); URL.revokeObjectURL(url)
  }

  return (
    <div className={`max-w-6xl mx-auto px-4 py-8 transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <div className="liquid-glass neo-border neo-shadow-lg p-6 mb-8">
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">🎨 Watchface Editor</h1>
        <p className="font-bold opacity-70">Canvas bebas! Tambah teks, gambar, shape. Drag buat atur posisi. Tandai role buat export ZIP.</p>
      </div>
      <CanvasEditor onPack={handlePack} />
    </div>
  )
}
