import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { CATS, photoUrl, stationItems } from '../data/projects'

const GAP = 15, H = 2.2, damp = THREE.MathUtils.damp
const stationX = (cat) => CATS.findIndex((c) => c.id === cat) * GAP

function layout(items) {
  const ws = items.map((i) => (i.photo.w / i.photo.h) * H), gap = 0.4
  let x = -(ws.reduce((a, b) => a + b, 0) + gap * (ws.length - 1)) / 2
  return items.map((it, k) => { const cx = x + ws[k] / 2; x += ws[k] + gap; return { ...it, w: ws[k], x: cx } })
}

function Brackets({ w, h }) { // viewfinder corners around the selected photograph
  const L = 0.4, t = 0.035, o = 0.2, m = <meshBasicMaterial color="#e4572e" />
  return [[-1, 1], [1, 1], [-1, -1], [1, -1]].map(([sx, sy], i) => (
    <group key={i} position={[sx * (w / 2 + o), sy * (h / 2 + o), 0.05]}>
      <mesh position={[-sx * L / 2, 0, 0]}><boxGeometry args={[L, t, t]} />{m}</mesh>
      <mesh position={[0, -sy * L / 2, 0]}><boxGeometry args={[t, L, t]} />{m}</mesh>
    </group>))
}

function Photo({ it, x, sx, active, onPick }) {
  const tex = useTexture(photoUrl(it.photo, 'm'))
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4
  const g = useRef(), m = useRef()
  useFrame((_, dt) => {
    g.current.scale.setScalar(damp(g.current.scale.x, active ? 1.05 : 1, 6, dt))
    m.current.emissiveIntensity = damp(m.current.emissiveIntensity, active ? 0.5 : 0.16, 6, dt)
  })
  return (
    <group ref={g} position={[sx + x, 1.45, active ? 0.25 : 0]}>
      <mesh onClick={() => onPick()} onPointerOver={() => (document.body.style.cursor = 'pointer')} onPointerOut={() => (document.body.style.cursor = '')}>
        <planeGeometry args={[it.w, H]} />
        <meshStandardMaterial ref={m} map={tex} emissiveMap={tex} emissive="#ffffff" emissiveIntensity={0.16} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0, -0.05]}><boxGeometry args={[it.w + 0.14, H + 0.14, 0.06]} /><meshStandardMaterial color="#17140f" roughness={0.6} /></mesh>
      {active && <Brackets w={it.w} h={H} />}
    </group>)
}

function Pool({ x, on }) { // soft pool of light on the floor under the selected station
  const map = useMemo(() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); const r = g.createRadialGradient(64, 64, 4, 64, 64, 64); r.addColorStop(0, 'rgba(255,230,200,.5)'); r.addColorStop(1, 'rgba(255,230,200,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128); const t = new THREE.CanvasTexture(c); return t }, [])
  useEffect(() => () => map.dispose(), [map])
  const m = useRef(); useFrame((_, dt) => { m.current.opacity = damp(m.current.opacity, on ? 0.55 : 0.12, 4, dt) })
  return <mesh rotation-x={-Math.PI / 2} position={[x, 0.01, 1]}><planeGeometry args={[14, 6]} /><meshBasicMaterial ref={m} map={map} transparent depthWrite={false} opacity={0.12} /></mesh>
}

function Station({ cat, activeCat, active, onSelect }) {
  const items = useMemo(() => layout(stationItems(cat)), [cat])
  const sx = stationX(cat)
  return (
    <group>
      <pointLight position={[sx, 4.6, 4.5]} intensity={cat === activeCat ? 55 : 14} distance={16} color="#ffe6c8" />
      <Pool x={sx} on={cat === activeCat} />
      <mesh position={[sx, 3.7, -0.4]}><boxGeometry args={[7, 0.06, 0.5]} /><meshBasicMaterial color="#efe6d6" /></mesh>
      {items.map((it, i) => <Photo key={i} it={it} x={it.x} sx={sx} active={cat === activeCat && i === active} onPick={() => onSelect(cat, i)} />)}
    </group>)
}

function Rig({ cat }) {
  const { camera } = useThree(), look = useRef(0)
  useFrame((s, dt) => {
    const sx = stationX(cat)
    camera.position.x = damp(camera.position.x, sx + s.pointer.x * 0.35, 2.6, dt)
    camera.position.y = damp(camera.position.y, 1.8 + s.pointer.y * 0.12, 2.6, dt)
    look.current = damp(look.current, sx, 2.6, dt)
    camera.lookAt(look.current, 1.45, 0)
  })
  return null
}

export default function StudioScene({ cat, active, onSelect }) {
  const wrap = useRef(null), [run, setRun] = useState(true)
  // render only while on screen and the tab is visible
  useEffect(() => {
    let vis = true, shown = true
    const upd = () => setRun(vis && shown)
    const io = new IntersectionObserver(([e]) => { shown = e.isIntersecting; upd() }, { threshold: 0.05 })
    io.observe(wrap.current)
    const vc = () => { vis = !document.hidden; upd() }
    document.addEventListener('visibilitychange', vc)
    return () => { io.disconnect(); document.removeEventListener('visibilitychange', vc); document.body.style.cursor = '' }
  }, [])
  useEffect(() => () => { CATS.forEach((c) => useTexture.clear(stationItems(c.id).map((i) => photoUrl(i.photo, 'm')))) }, [])
  const pick = (c, i) => { if (c !== cat) return; onSelect(i) }
  return (
    <div ref={wrap} className="canvas-wrap" role="img" aria-label="3D photography studio. Use the category buttons to move between Events, Technology and Weddings.">
      <Canvas frameloop={run ? 'always' : 'never'} dpr={[1, 1.6]} camera={{ position: [0, 1.8, 7.8], fov: 40 }} gl={{ antialias: true, powerPreference: 'high-performance' }}>
        <color attach="background" args={['#0b0a09']} /><fog attach="fog" args={['#0b0a09', 12, 30]} />
        <ambientLight intensity={0.35} />
        <mesh rotation-x={-Math.PI / 2} position={[GAP, 0, 0]}><planeGeometry args={[80, 30]} /><meshStandardMaterial color="#0f0d0b" roughness={0.55} metalness={0.15} /></mesh>
        <Suspense fallback={null}>{CATS.map((c) => <Station key={c.id} cat={c.id} activeCat={cat} active={active} onSelect={pick} />)}</Suspense>
        <Rig cat={cat} />
      </Canvas>
    </div>)
}
