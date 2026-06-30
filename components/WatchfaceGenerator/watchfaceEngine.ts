export interface WatchfaceConfig {
  name: string
  bgImage?: string
  hourHandImage?: string
  minHandImage?: string
  secHandImage?: string
  showDate: boolean
  showBattery: boolean
  datePos: { x: number; y: number }
  monthPos: { x: number; y: number }
  wdayPos: { x: number; y: number }
  battPos: { x: number; y: number }
}

export interface DragItem { key: string; label: string; pos: { x: number; y: number } }

const W = 466, H = 466, CX = W / 2, CY = H / 2, R = 200

function canvas(w: number, h: number) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; return c
}

function toBlob(c: HTMLCanvasElement): Promise<Blob> {
  return new Promise(r => c.toBlob(b => r(b!), 'image/png'))
}

async function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image(); img.crossOrigin = 'anonymous'
    img.onload = () => res(img); img.onerror = rej; img.src = src
  })
}

export async function generateBackground(cfg: WatchfaceConfig): Promise<Blob> {
  const c = canvas(W, H), ctx = c.getContext('2d')!
  if (cfg.bgImage) {
    const img = await loadImg(cfg.bgImage)
    ctx.drawImage(img, 0, 0, W, H)
  } else {
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, W, H)
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3
    for (let i = 0; i < 12; i++) {
      const a = (i * 30 - 90) * Math.PI / 180
      const inner = i % 3 === 0 ? R - 25 : R - 12
      ctx.beginPath()
      ctx.moveTo(CX + Math.cos(a) * inner, CY + Math.sin(a) * inner)
      ctx.lineTo(CX + Math.cos(a) * R, CY + Math.sin(a) * R)
      ctx.stroke()
    }
    ctx.font = 'bold 22px sans-serif'; ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    for (let i = 1; i <= 12; i++) {
      const a = (i * 30 - 90) * Math.PI / 180
      ctx.fillText(String(i), CX + Math.cos(a) * (R - 42), CY + Math.sin(a) * (R - 42))
    }
  }
  return toBlob(c)
}

export async function drawAnimatedPreview(
  cfg: WatchfaceConfig, canvasEl: HTMLCanvasElement
) {
  const ctx = canvasEl.getContext('2d')!
  const w = canvasEl.width, h = canvasEl.height
  const cx = w/2, cy = h/2

  let bgImg: HTMLImageElement | null = null
  let hhImg: HTMLImageElement | null = null
  let mhImg: HTMLImageElement | null = null
  let shImg: HTMLImageElement | null = null

  if (cfg.bgImage) bgImg = await loadImg(cfg.bgImage)
  if (cfg.hourHandImage) hhImg = await loadImg(cfg.hourHandImage)
  if (cfg.minHandImage) mhImg = await loadImg(cfg.minHandImage)
  if (cfg.secHandImage) shImg = await loadImg(cfg.secHandImage)

  function drawHand(img: HTMLImageElement, angle: number, len: number) {
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(angle * Math.PI / 180)
    ctx.drawImage(img, -img.width/2, -len, img.width, len + 10)
    ctx.restore()
  }

  function render() {
    const now = new Date()
    const hh = (now.getHours() % 12) * 30 + now.getMinutes() * 0.5
    const mm = now.getMinutes() * 6 + now.getSeconds() * 0.1
    const ss = now.getSeconds() * 6 + now.getMilliseconds() * 0.006

    ctx.clearRect(0, 0, w, h)

    if (bgImg) {
      ctx.drawImage(bgImg, 0, 0, w, h)
    } else {
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h)
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2
      ctx.beginPath(); ctx.arc(cx, cy, 90, 0, Math.PI * 2); ctx.stroke()
    }

    if (hhImg) drawHand(hhImg, hh, 50)
    else {
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 5
      ctx.beginPath(); ctx.moveTo(cx, cy)
      ctx.lineTo(cx + Math.sin(hh * Math.PI/180) * 50, cy - Math.cos(hh * Math.PI/180) * 50)
      ctx.stroke()
    }

    if (mhImg) drawHand(mhImg, mm, 70)
    else {
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 3
      ctx.beginPath(); ctx.moveTo(cx, cy)
      ctx.lineTo(cx + Math.sin(mm * Math.PI/180) * 70, cy - Math.cos(mm * Math.PI/180) * 70)
      ctx.stroke()
    }

    if (shImg) drawHand(shImg, ss, 75)
    else {
      ctx.strokeStyle = '#ff4444'; ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.moveTo(cx, cy)
      ctx.lineTo(cx + Math.sin(ss * Math.PI/180) * 75, cy - Math.cos(ss * Math.PI/180) * 75)
      ctx.stroke()
    }
  }

  const interval = setInterval(render, 50)
  render()
  return () => clearInterval(interval)
}

export async function generateWatchfacePack(cfg: WatchfaceConfig): Promise<Blob> {
  const JSZip = (await import('jszip')).default
  const zip = new JSZip()

  const bg = await generateBackground(cfg)
  zip.file('image1.png', bg)

  if (cfg.hourHandImage) {
    const img = await loadImg(cfg.hourHandImage)
    const c = canvas(img.width, img.height); const x = c.getContext('2d')!
    x.drawImage(img, 0, 0); zip.file('image2.png', await toBlob(c))
  } else zip.file('image2.png', await generateHand('#ffffff', 100, 10))

  if (cfg.minHandImage) {
    const img = await loadImg(cfg.minHandImage)
    const c = canvas(img.width, img.height); const x = c.getContext('2d')!
    x.drawImage(img, 0, 0); zip.file('image3.png', await toBlob(c))
  } else zip.file('image3.png', await generateHand('#ffffff', 145, 6))

  if (cfg.secHandImage) {
    const img = await loadImg(cfg.secHandImage)
    const c = canvas(img.width, img.height); const x = c.getContext('2d')!
    x.drawImage(img, 0, 0); zip.file('image4.png', await toBlob(c))
  } else zip.file('image4.png', await generateHand('#ff4444', 160, 2))

  const clockXml = `<?xml version="1.0" encoding="utf-8"?>
<clockskin>
    <drawable><name>image1.png</name></drawable>
    <drawable>
        <name>image2.png</name>
        <rotate>1</rotate>
        <direction>1</direction>
        <mulrotate>1</mulrotate>
    </drawable>
    <drawable>
        <name>image3.png</name>
        <rotate>2</rotate>
        <direction>1</direction>
        <mulrotate>1</mulrotate>
    </drawable>
    <drawable>
        <name>image4.png</name>
        <rotate>3</rotate>
        <direction>1</direction>
        <mulrotate>1</mulrotate>
    </drawable>
    <drawable>
        <name>date.xml</name>
        <arraytype>4</arraytype>
        <centerX>${cfg.datePos.x}</centerX>
        <centerY>${cfg.datePos.y}</centerY>
    </drawable>
    <drawable>
        <name>month.xml</name>
        <arraytype>3</arraytype>
        <centerX>${cfg.monthPos.x}</centerX>
        <centerY>${cfg.monthPos.y}</centerY>
    </drawable>
    <drawable>
        <name>wday.xml</name>
        <arraytype>5</arraytype>
        <centerX>${cfg.wdayPos.x}</centerX>
        <centerY>${cfg.wdayPos.y}</centerY>
    </drawable>
    <drawable>
        <name>batt.xml</name>
        <arraytype>14</arraytype>
        <centerX>${cfg.battPos.x}</centerX>
        <centerY>${cfg.battPos.y}</centerY>
    </drawable>
</clockskin>`
  zip.file('clock_skin.xml', clockXml)

  function makeArrayXml(name: string, count: number, pad: boolean) {
    let xml = '<?xml version="1.0" encoding="utf-8"?>\n<drawables>\n'
    for (let i = 0; i < count; i++) {
      xml += `     <image>${name}_${pad ? String(i).padStart(2, '0') : String(i)}.png</image>\n`
    }
    xml += '</drawables>'; return xml
  }

  zip.file('date.xml', makeArrayXml('date', 10, false))
  zip.file('month.xml', makeArrayXml('month', 12, true))
  zip.file('wday.xml', makeArrayXml('wday', 7, true))
  zip.file('batt.xml', makeArrayXml('batt', 13, true))

  for (let i = 0; i < 10; i++) {
    const d = canvas(20, 26); const x = d.getContext('2d')!
    x.clearRect(0, 0, 20, 26); x.fillStyle = '#ffffff'
    x.font = 'bold 22px monospace'; x.textAlign = 'center'; x.textBaseline = 'middle'
    x.fillText(String(i), 10, 13); zip.file(`date_${i}.png`, await toBlob(d))
  }

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

  for (let i = 1; i <= 12; i++) {
    const d = canvas(20, 26); const x = d.getContext('2d')!
    x.clearRect(0, 0, 20, 26); x.fillStyle = '#ffffff'
    x.font = 'bold 14px monospace'; x.textAlign = 'center'; x.textBaseline = 'middle'
    x.fillText(months[i-1], 10, 13)
    zip.file(`month_${String(i).padStart(2, '0')}.png`, await toBlob(d))
  }

  for (let i = 1; i <= 7; i++) {
    const d = canvas(20, 26); const x = d.getContext('2d')!
    x.clearRect(0, 0, 20, 26); x.fillStyle = '#ffffff'
    x.font = 'bold 14px monospace'; x.textAlign = 'center'; x.textBaseline = 'middle'
    x.fillText(days[i-1], 10, 13)
    zip.file(`wday_${String(i).padStart(2, '0')}.png`, await toBlob(d))
  }

  for (let i = 0; i <= 12; i++) {
    const d = canvas(30, 14); const x = d.getContext('2d')!
    x.clearRect(0, 0, 30, 14)
    x.strokeStyle = '#ffffff'; x.lineWidth = 1
    x.strokeRect(0, 0, 28, 14); x.fillRect(28, 4, 2, 6)
    if (i > 0) { x.fillStyle = i <= 4 ? '#ff4444' : '#ffffff'; x.fillRect(2, 2, (24*i)/12, 10) }
    zip.file(`batt_${String(i).padStart(2, '0')}.png`, await toBlob(d))
  }

  return zip.generateAsync({ type: 'blob' })
}

async function generateHand(color: string, len: number, w: number): Promise<Blob> {
  const pw = Math.max(w + 6, 16), ph = len + 12, c = canvas(pw, ph), ctx = c.getContext('2d')!
  ctx.clearRect(0, 0, pw, ph); ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(pw/2 - w/2, ph - 4); ctx.lineTo(pw/2, 6); ctx.lineTo(pw/2 + w/2, ph - 4)
  ctx.closePath(); ctx.fill()
  return toBlob(c)
}

export const defaultConfig: WatchfaceConfig = {
  name: 'My Watchface',
  showDate: true, showBattery: true,
  datePos: { x: 0, y: 120 },
  monthPos: { x: -40, y: 120 },
  wdayPos: { x: 40, y: 120 },
  battPos: { x: 0, y: 150 },
}
