"use client"

import { useState, useRef, useCallback, useEffect } from 'react'

export interface Layer {
  id: string
  type: 'text' | 'image' | 'shape'
  x: number; y: number; w: number; h: number
  rotation: number; opacity: number
  zIndex: number
  text?: string; fontSize?: number; fontFamily?: string; color?: string
  src?: string; shapeType?: 'rect' | 'circle'; fillColor?: string; strokeColor?: string
  role?: 'bg' | 'hour' | 'min' | 'sec'
}

const W = 466, H = 466

let nextId = 1
function uid() { return `lyr_${nextId++}_${Date.now()}` }

export default function CanvasEditor({ onPack }: { onPack: (blob: Blob) => void }) {
  const [layers, setLayers] = useState<Layer[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [dragging, setDragging] = useState<{ type: 'move' | 'resize' | 'rotate'; id: string; startX: number; startY: number; init: any } | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [generating, setGenerating] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const API_KEY = 'a6dbf31b13a541499360ba5f20af214b'

  const selLayer = layers.find(l => l.id === selected)
  const imgCache = useRef<Map<string, HTMLImageElement>>(new Map())

  useEffect(() => {
    const c = canvasRef.current; if (!c) return
    const ctx = c.getContext('2d')!
    let cancelled = false

    async function render() {
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#1a1a1a'; ctx.fillRect(0, 0, W, H)

      const sorted = [...layers].sort((a, b) => a.zIndex - b.zIndex)

      await Promise.all(sorted.filter(l => l.type === 'image' && l.src && !imgCache.current.has(l.id)).map(l =>
        new Promise<void>(res => {
          const img = new Image()
          img.onload = () => { imgCache.current.set(l.id, img); res() }
          img.onerror = () => res()
          img.src = l.src!
        })
      ))

      if (cancelled) return
      sorted.forEach(l => {
        ctx.save(); ctx.globalAlpha = l.opacity
        ctx.translate(l.x + l.w / 2, l.y + l.h / 2)
        ctx.rotate(l.rotation * Math.PI / 180)
        if (l.type === 'text' && l.text) {
          ctx.fillStyle = l.color || '#fff'
          ctx.font = `bold ${l.fontSize || 24}px ${l.fontFamily || 'monospace'}`
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
          ctx.fillText(l.text, 0, 0)
        } else if (l.type === 'image') {
          const img = imgCache.current.get(l.id)
          if (img) ctx.drawImage(img, -l.w / 2, -l.h / 2, l.w, l.h)
        } else if (l.type === 'shape') {
          ctx.fillStyle = l.fillColor || '#fff'
          if (l.shapeType === 'circle') { ctx.beginPath(); ctx.arc(0, 0, Math.min(l.w, l.h) / 2, 0, Math.PI * 2); ctx.fill() }
          else { ctx.fillRect(-l.w / 2, -l.h / 2, l.w, l.h) }
        }
        ctx.restore()
      })
    }
    render()
    return () => { cancelled = true }
  }, [layers])

  const addText = useCallback(() => {
    const l: Layer = { id: uid(), type: 'text', x: 50, y: 50, w: 100, h: 40, rotation: 0, opacity: 1, zIndex: layers.length, text: 'Text', fontSize: 24, color: '#ffffff' }
    setLayers(p => [...p, l]); setSelected(l.id)
  }, [layers.length])

  const addImage = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    const src = URL.createObjectURL(file)
    const img = new Image(); img.onload = () => {
      const w = Math.min(img.width, 200), h = Math.min(img.height, 200)
      const l: Layer = { id: uid(), type: 'image', x: 50, y: 50, w, h, rotation: 0, opacity: 1, zIndex: layers.length, src }
      setLayers(p => [...p, l]); setSelected(l.id)
    }; img.src = src
  }, [layers.length])

  const addShape = useCallback(() => {
    const l: Layer = { id: uid(), type: 'shape', x: 50, y: 50, w: 60, h: 60, rotation: 0, opacity: 1, zIndex: layers.length, shapeType: 'rect', fillColor: '#4ade80' }
    setLayers(p => [...p, l]); setSelected(l.id)
  }, [layers.length])

  const aiGenerate = useCallback(async () => {
    if (!prompt.trim()) return; setAiLoading(true)
    try {
      const p = prompt.trim().toLowerCase()
      const style = p.replace(/watchface|smartwatch|wear os|round|466x466/gi, '').trim() || 'minimal'
      const styleShort = style.length > 50 ? style.slice(0, 50) : style

      const res = await fetch('https://gateway.pixazo.ai/flux-1-schnell/v1/getData', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache', 'Ocp-Apim-Subscription-Key': API_KEY },
        body: JSON.stringify({
          prompt: `watchface dial background only, no clock hands, ${styleShort}, smartwatch round face, HD`,
          image_size: 'square_hd', output_format: 'png'
        })
      })
      const data = await res.json()
      if (!data.output) return

      const imgRes = await fetch(data.output); const imgBlob = await imgRes.blob()
      const bgUrl = URL.createObjectURL(imgBlob)

      const accent = p.includes('gold') || p.includes('yellow') ? '#d4a843' : p.includes('blue') ? '#4488ff' : p.includes('red') ? '#ff4444' : p.includes('green') ? '#44cc44' : p.includes('white') ? '#ffffff' : p.includes('silver') ? '#c0c0c0' : '#ffffff'
      const handColor = accent
      const secColor = p.includes('red') ? '#ff2222' : '#ff4444'

      const cx = 233, cy = 233
      const layers: Layer[] = [
        { id: uid(), type: 'image', x: 0, y: 0, w: W, h: H, rotation: 0, opacity: 1, zIndex: 0, src: bgUrl, role: 'bg' },
        { id: uid(), type: 'shape', x: cx - 6, y: cy - 80, w: 12, h: 80, rotation: 0, opacity: 1, zIndex: 1, shapeType: 'rect', fillColor: handColor, role: 'hour' },
        { id: uid(), type: 'shape', x: cx - 4, y: cy - 130, w: 8, h: 130, rotation: 0, opacity: 1, zIndex: 2, shapeType: 'rect', fillColor: handColor, role: 'min' },
        { id: uid(), type: 'shape', x: cx - 2, y: cy - 140, w: 4, h: 140, rotation: 0, opacity: 1, zIndex: 3, shapeType: 'rect', fillColor: secColor, role: 'sec' },
        { id: uid(), type: 'shape', x: cx - 8, y: cy - 8, w: 16, h: 16, rotation: 0, opacity: 1, zIndex: 4, shapeType: 'circle', fillColor: handColor },
      ]

      setLayers(layers)
      setSelected(layers[1]?.id || layers[0].id)
    } catch (e) { console.error(e) }
    setAiLoading(false)
  }, [prompt])

  const delLayer = useCallback(() => {
    if (!selected) return; setLayers(p => p.filter(l => l.id !== selected)); setSelected(null)
  }, [selected])

  const moveUp = useCallback(() => {
    setLayers(p => { const idx = p.findIndex(l => l.id === selected); if (idx < 0 || idx === p.length - 1) return p; const q = [...p]; [q[idx].zIndex, q[idx + 1].zIndex] = [q[idx + 1].zIndex, q[idx].zIndex]; q.sort((a, b) => a.zIndex - b.zIndex); return q })
  }, [selected])

  const moveDown = useCallback(() => {
    setLayers(p => { const idx = p.findIndex(l => l.id === selected); if (idx <= 0) return p; const q = [...p]; [q[idx].zIndex, q[idx - 1].zIndex] = [q[idx - 1].zIndex, q[idx].zIndex]; q.sort((a, b) => a.zIndex - b.zIndex); return q })
  }, [selected])

  const updateLayer = useCallback((id: string, patch: Partial<Layer>) => {
    setLayers(p => p.map(l => l.id === id ? { ...l, ...patch } : l))
  }, [])

  // Mouse handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect()
    const mx = (e.clientX - rect.left) * (W / rect.width)
    const my = (e.clientY - rect.top) * (H / rect.height)

    const clicked = [...layers].sort((a, b) => b.zIndex - a.zIndex).find(l =>
      mx >= l.x && mx <= l.x + l.w && my >= l.y && my <= l.y + l.h
    )
    if (clicked) { setSelected(clicked.id); setDragging({ type: 'move', id: clicked.id, startX: mx, startY: my, init: { x: clicked.x, y: clicked.y } }) }
    else setSelected(null)
  }, [layers])

  useEffect(() => {
    if (!dragging) return
    const onMove = (e: MouseEvent) => {
      const rect = canvasRef.current!.getBoundingClientRect()
      const mx = (e.clientX - rect.left) * (W / rect.width)
      const my = (e.clientY - rect.top) * (H / rect.height)
      if (dragging.type === 'move') {
        const dx = mx - dragging.startX, dy = my - dragging.startY
        updateLayer(dragging.id, { x: dragging.init.x + dx, y: dragging.init.y + dy })
      }
    }
    const onUp = () => setDragging(null)
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [dragging, updateLayer])

  const handleExport = async () => {
    setGenerating(true)
    try {
      const bgLayers = layers.filter(l => l.role === 'bg')
      const hLayers = layers.filter(l => l.role === 'hour')
      const mLayers = layers.filter(l => l.role === 'min')
      const sLayers = layers.filter(l => l.role === 'sec')
      const decoLayers = layers.filter(l => !l.role)

      const JSZip = (await import('jszip')).default
      const zip = new JSZip()

      async function renderToBlob(targetLayers: Layer[], transparent = false): Promise<Blob> {
        const c = document.createElement('canvas'); c.width = W; c.height = H
        const ctx = c.getContext('2d')!
        if (!transparent) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H) }
        await Promise.all([...targetLayers].filter(l => l.type === 'image' && l.src).map(l =>
          new Promise<void>(res => {
            const img = new Image(); img.crossOrigin = 'anonymous'
            img.onload = () => { (l as any)._img = img; res() }
            img.onerror = () => res()
            img.src = l.src!
          })
        ))
        ;[...targetLayers].sort((a, b) => a.zIndex - b.zIndex).forEach(l => {
          ctx.save(); ctx.globalAlpha = l.opacity
          ctx.translate(l.x + l.w / 2, l.y + l.h / 2)
          ctx.rotate(l.rotation * Math.PI / 180)
          if (l.type === 'text' && l.text) {
            ctx.fillStyle = l.color || '#fff'
            ctx.font = `bold ${l.fontSize || 24}px ${l.fontFamily || 'monospace'}`
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
            ctx.fillText(l.text, 0, 0)
          } else if (l.type === 'image' && (l as any)._img) {
            ctx.drawImage((l as any)._img, -l.w / 2, -l.h / 2, l.w, l.h)
          } else if (l.type === 'shape') {
            ctx.fillStyle = l.fillColor || '#fff'
            if (l.shapeType === 'circle') { ctx.beginPath(); ctx.arc(0, 0, Math.min(l.w, l.h) / 2, 0, Math.PI * 2); ctx.fill() }
            else ctx.fillRect(-l.w / 2, -l.h / 2, l.w, l.h)
          }
          ctx.restore()
        })
        return new Promise(r => c.toBlob(b => r(b!), 'image/png'))
      }

      const all = [...bgLayers, ...decoLayers]
      zip.file('image1.png', await renderToBlob(all))

      if (hLayers.length) zip.file('image2.png', await renderToBlob(hLayers, true))
      else zip.file('image2.png', await renderToBlob([]))

      if (mLayers.length) zip.file('image3.png', await renderToBlob(mLayers, true))
      else zip.file('image3.png', await renderToBlob([]))

      if (sLayers.length) zip.file('image4.png', await renderToBlob(sLayers, true))
      else zip.file('image4.png', await renderToBlob([]))

      let clockXml = `<?xml version="1.0" encoding="utf-8"?>\n<clockskin>\n    <drawable><name>image1.png</name></drawable>\n`
      if (hLayers.length) clockXml += `    <drawable><name>image2.png</name><rotate>1</rotate><direction>1</direction><mulrotate>1</mulrotate></drawable>\n`
      if (mLayers.length) clockXml += `    <drawable><name>image3.png</name><rotate>2</rotate><direction>1</direction><mulrotate>1</mulrotate></drawable>\n`
      if (sLayers.length) clockXml += `    <drawable><name>image4.png</name><rotate>3</rotate><direction>1</direction><mulrotate>1</mulrotate></drawable>\n`
      clockXml += `</clockskin>`
      zip.file('clock_skin.xml', clockXml)

      const blob = await zip.generateAsync({ type: 'blob' })
      onPack(blob)
    } catch (e) { console.error(e) }
    setGenerating(false)
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div ref={containerRef} className="relative flex-shrink-0">
        <canvas ref={canvasRef} width={W} height={H}
          onMouseDown={handleMouseDown}
          className="neo-border neo-shadow-lg w-full max-w-[466px] cursor-crosshair"
          style={{ touchAction: 'none' }}
        />
        <div className="flex gap-2 mt-3">
          <span className={`px-2 py-0.5 text-[10px] font-black rounded ${!layers.some(l => l.role === 'hour') ? 'opacity-40' : 'text-green-400'}`}>🕐 Hour</span>
          <span className={`px-2 py-0.5 text-[10px] font-black rounded ${!layers.some(l => l.role === 'min') ? 'opacity-40' : 'text-green-400'}`}>🕐 Min</span>
          <span className={`px-2 py-0.5 text-[10px] font-black rounded ${!layers.some(l => l.role === 'sec') ? 'opacity-40' : 'text-green-400'}`}>🕐 Sec</span>
        </div>
      </div>

      <div className="flex-1 space-y-4 min-w-0">
        <div className="liquid-glass neo-border neo-shadow-lg p-4">
          <h3 className="font-black uppercase text-sm mb-3">AI Generate</h3>
          <div className="flex gap-2 mb-3">
            <input type="text" value={prompt} onChange={e => setPrompt(e.target.value)}
              placeholder="Misal: black gold elegant watchface, minimalist..."
              className="flex-1 px-3 py-2 text-xs neo-border neo-shadow bg-white text-black"
              onKeyDown={e => e.key === 'Enter' && aiGenerate()} />
            <button onClick={aiGenerate} disabled={aiLoading}
              className="px-4 py-2 font-bold text-xs neo-border neo-shadow bg-pink-400 text-black hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all disabled:opacity-50 whitespace-nowrap">
              {aiLoading ? '...' : 'Generate AI'}
            </button>
          </div>
          <h3 className="font-black uppercase text-sm mb-3">Tambah Elemen</h3>
          <div className="flex flex-wrap gap-2">
            <button onClick={addText} className="px-3 py-2 font-bold text-xs neo-border neo-shadow bg-cyan-400 text-black hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all">+ Teks</button>
            <label className="px-3 py-2 font-bold text-xs neo-border neo-shadow bg-purple-400 text-black cursor-pointer hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all">
              + Gambar <input type="file" accept="image/*" onChange={addImage} className="hidden" />
            </label>
            <button onClick={addShape} className="px-3 py-2 font-bold text-xs neo-border neo-shadow bg-green-400 text-black hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all">+ Shape</button>
          </div>
        </div>

        {selLayer && (
          <div className="liquid-glass neo-border neo-shadow-lg p-4 space-y-3">
            <h3 className="font-black uppercase text-sm">Properties</h3>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-[10px] font-bold">X</label><input type="number" value={selLayer.x} onChange={e => updateLayer(selLayer.id, { x: Number(e.target.value) })} className="w-full px-2 py-1 text-xs neo-border neo-shadow bg-white text-black" /></div>
              <div><label className="text-[10px] font-bold">Y</label><input type="number" value={selLayer.y} onChange={e => updateLayer(selLayer.id, { y: Number(e.target.value) })} className="w-full px-2 py-1 text-xs neo-border neo-shadow bg-white text-black" /></div>
              <div><label className="text-[10px] font-bold">Width</label><input type="number" value={selLayer.w} onChange={e => updateLayer(selLayer.id, { w: Number(e.target.value) })} className="w-full px-2 py-1 text-xs neo-border neo-shadow bg-white text-black" /></div>
              <div><label className="text-[10px] font-bold">Height</label><input type="number" value={selLayer.h} onChange={e => updateLayer(selLayer.id, { h: Number(e.target.value) })} className="w-full px-2 py-1 text-xs neo-border neo-shadow bg-white text-black" /></div>
              <div><label className="text-[10px] font-bold">Rotate</label><input type="number" value={selLayer.rotation} onChange={e => updateLayer(selLayer.id, { rotation: Number(e.target.value) })} className="w-full px-2 py-1 text-xs neo-border neo-shadow bg-white text-black" /></div>
              <div><label className="text-[10px] font-bold">Opacity</label><input type="number" min={0} max={1} step={0.1} value={selLayer.opacity} onChange={e => updateLayer(selLayer.id, { opacity: Number(e.target.value) })} className="w-full px-2 py-1 text-xs neo-border neo-shadow bg-white text-black" /></div>
            </div>
            {selLayer.type === 'text' && (
              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2"><label className="text-[10px] font-bold">Teks</label><input type="text" value={selLayer.text || ''} onChange={e => updateLayer(selLayer.id, { text: e.target.value })} className="w-full px-2 py-1 text-xs neo-border neo-shadow bg-white text-black" /></div>
                <div><label className="text-[10px] font-bold">Font Size</label><input type="number" value={selLayer.fontSize || 24} onChange={e => updateLayer(selLayer.id, { fontSize: Number(e.target.value) })} className="w-full px-2 py-1 text-xs neo-border neo-shadow bg-white text-black" /></div>
                <div><label className="text-[10px] font-bold">Warna</label><input type="color" value={selLayer.color || '#ffffff'} onChange={e => updateLayer(selLayer.id, { color: e.target.value })} className="w-full h-8 p-0 border-2 border-black" /></div>
              </div>
            )}
            {selLayer.type === 'shape' && (
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-[10px] font-bold">Type</label>
                  <select value={selLayer.shapeType} onChange={e => updateLayer(selLayer.id, { shapeType: e.target.value as any })} className="w-full px-2 py-1 text-xs neo-border neo-shadow bg-white text-black">
                    <option value="rect">Rectangle</option><option value="circle">Circle</option>
                  </select>
                </div>
                <div><label className="text-[10px] font-bold">Fill</label><input type="color" value={selLayer.fillColor || '#4ade80'} onChange={e => updateLayer(selLayer.id, { fillColor: e.target.value })} className="w-full h-8 p-0 border-2 border-black" /></div>
              </div>
            )}
            <div>
              <label className="text-[10px] font-bold">Role (export)</label>
              <select value={selLayer.role || ''} onChange={e => updateLayer(selLayer.id, { role: (e.target.value as any) || undefined })} className="w-full px-2 py-1 text-xs neo-border neo-shadow bg-white text-black">
                <option value="">Decoration</option>
                <option value="bg">Background</option>
                <option value="hour">Hour Hand (rotate)</option>
                <option value="min">Minute Hand (rotate)</option>
                <option value="sec">Second Hand (rotate)</option>
              </select>
            </div>
            <div className="flex gap-2 pt-2 border-t-2 border-black/10">
              <button onClick={delLayer} className="px-3 py-1 text-xs font-bold neo-border neo-shadow bg-red-400 text-black hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all">Hapus</button>
              <button onClick={moveUp} className="px-3 py-1 text-xs font-bold neo-border neo-shadow bg-gray-200 text-black hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all">Naik</button>
              <button onClick={moveDown} className="px-3 py-1 text-xs font-bold neo-border neo-shadow bg-gray-200 text-black hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all">Turun</button>
            </div>
          </div>
        )}

        <div className="liquid-glass neo-border neo-shadow-lg p-4">
          <h3 className="font-black uppercase text-sm mb-3">Layer List ({layers.length})</h3>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {[...layers].sort((a, b) => a.zIndex - b.zIndex).map(l => (
              <div key={l.id} onClick={() => setSelected(l.id)}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-bold cursor-pointer neo-border transition-all ${selected === l.id ? 'bg-yellow-400 text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                <span className="w-4 text-center">{l.type === 'text' ? 'T' : l.type === 'image' ? '🖼' : '⬛'}</span>
                <span className="flex-1 truncate">{l.text || l.src?.slice(0, 20) || l.shapeType}</span>
                {l.role && <span className="text-[9px] bg-black px-1 py-0.5 rounded">{l.role}</span>}
              </div>
            ))}
          </div>
        </div>

        <button onClick={handleExport} disabled={generating}
          className="w-full px-6 py-4 font-black uppercase text-lg bg-yellow-400 text-black neo-border neo-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50">
          {generating ? 'Generating...' : 'Download ZIP Watchface'}
        </button>
      </div>
    </div>
  )
}
