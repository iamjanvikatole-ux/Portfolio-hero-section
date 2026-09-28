import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

/**
 * Janvi's Interactive Room — Framer code component
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 1200
 */

const IW = 1536, IH = 1024
// key, x, y, w, h, kind, origin, alt   kinds: wall | item | static | lamp | dog | girl | hp
const RAW: [string, number, number, number, number, string, string, string][] = [
    ["frame1", 240, 115, 150, 198, "wall", "50% 3%", "Framed print: Good Things Take Time"],
    ["frame2", 418, 47, 242, 287, "wall", "50% 3%", "Framed flower print"],
    ["notes", 681, 40, 134, 232, "wall", "45% 4%", "Pinned photos and a you got this note"],
    ["clock", 996, 68, 190, 187, "wall", "50% 10%", "Flower-shaped wall clock"],
    ["shelf", 1292, 128, 166, 164, "wall", "50% 5%", "Wooden wall shelf"],
    ["shelfbooks", 1318, 181, 60, 88, "item", "50% 100%", "Three books on the shelf"],
    ["bunny", 1392, 221, 44, 51, "item", "50% 100%", "Bunny figurine"],
    ["hangplant", 1259, -17, 175, 303, "item", "72% 30%", "Hanging pothos"],
    ["sidetable", 1318, 566, 200, 180, "static", "50% 100%", "Side table"],
    ["sidebooks", 1322, 510, 175, 78, "item", "50% 100%", "Stack of three books"],
    ["lamp", 1318, 334, 165, 190, "lamp", "50% 100%", "Lavender lamp"],
    ["pothos", 1422, 497, 110, 193, "item", "50% 47%", "Potted pothos"],
    ["rug", 606, 892, 908, 132, "static", "50% 50%", "Sage and cream checkered rug"],
    ["sofa", 205, 400, 1200, 525, "static", "50% 100%", "Cream boucle sofa with cushions"],
    ["girl", 695, 273, 476, 590, "girl", "50% 100%", "Janvi on her laptop"],
    ["table", 70, 672, 660, 342, "static", "50% 100%", "Round wooden coffee table"],
    ["catplant", 50, 476, 230, 319, "item", "50% 95%", "Plant in a cat planter"],
    ["books", 215, 622, 320, 178, "item", "50% 100%", "Books: Good Design, Product Thinking, Better Interfaces, Big Dreams"],
    ["candle", 340, 565, 70, 71, "item", "50% 100%", "Bubble candle"],
    ["chai", 520, 634, 128, 130, "item", "50% 100%", "Cup of tea on a saucer"],
    ["phone", 622, 758, 105, 48, "item", "50% 50%", "Phone"],
    ["tote", 1270, 660, 250, 321, "item", "45% 6%", "Tote bag: more good products please"],
    ["dog", 820, 820, 470, 175, "dog", "50% 100%", "Sleeping golden retriever puppy"],
    ["cat", 600, 890, 110, 117, "item", "50% 100%", "Cat figurine"],
    ["hp", 795, 276, 190, 195, "hp", "50% 50%", "Beige headphones"],
]
type Obj = { key: string; x: number; y: number; w: number; h: number; kind: string; origin: string; alt: string; z: number; file: string }
const OBJ: Obj[] = RAW.map(([key, x, y, w, h, kind, origin, alt], i) => ({ key, x, y, w, h, kind, origin, alt, z: i + 1, file: (key === "girl" ? "girlhp" : key) + ".png" }))
const BY: Record<string, Obj> = Object.fromEntries(OBJ.map((o) => [o.key, o]))
const RIDERS: Record<string, string[]> = { books: ["candle"], sidebooks: ["lamp"], shelf: ["shelfbooks", "bunny", "hangplant"] }
const PARENT: Record<string, string> = {}
Object.entries(RIDERS).forEach(([p, rs]) => rs.forEach((r) => (PARENT[r] = p)))
const SHADOW: Record<string, number[]> = { sofa: [6, 88, -3, 6], table: [10, 80, -2, 7], sidetable: [14, 72, -2, 7], tote: [8, 84, -2, 6], dog: [4, 92, -4, 18], cat: [8, 84, -4, 10] }
const HP_ZONES = [[0.14, 0.15, 0.29, 0.35], [0.55, 0.12, 0.68, 0.29], [0.17, 0.0, 0.64, 0.11]]
const ALT: Record<string, { file: string; l: string; t: string; w: string }> = {
    girl: { file: "girl.png", l: "0.17%", t: "5.38%", w: "99.85%" },
    dog: { file: "doghappy.png", l: "-0.64%", t: "-53.1%", w: "101.3%" },
}
const HI_LINES = ["Hi, I'm Janvi!", "I design digital products.", "Currently: pushing pixels.", "Say hello, I don't bite."]
const NOTIFS = [["FIGMA", 'Anna commented: "Love this flow."'], ["MESSAGES", "Mum: did you eat?"], ["CALENDAR", "Design crit in 10 min"], ["MAIL", "Re: Your portfolio. Can we talk?"]]

const joinUrl = (base: string, file: string) => (base.endsWith("/") ? base : base + "/") + file

class Engine {
    stage: HTMLDivElement; refs: any; onMoved: (m: boolean) => void; base: string
    s: Record<string, any> = {}; hit: Record<string, ImageData> = {}; link: Record<string, boolean> = {}
    zTop = 100; drag: any = null; hoverKey: string | null = null; loops: Animation[] = []
    lampOn = true; dogBusy = false; hpOn = true; moved = false; hiN = 0; nN = 0; reduce = false
    raf = 0; zT: any; dogT: any; hpT: any; hiT: any; nT: any; glow: HTMLElement | null = null; dogFx: HTMLElement | null = null
    dogBreath: Animation | null = null; glowAnim: Animation | null = null

    constructor(stage: HTMLDivElement, refs: any, base: string, onMoved: (m: boolean) => void) {
        this.stage = stage; this.refs = refs; this.base = base; this.onMoved = onMoved
        this.reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        const q = (sel: string) => stage.querySelector(sel) as HTMLElement
        OBJ.forEach((o) => {
            this.link[o.key] = true
            this.s[o.key] = { x: 0, y: 0, tx: 0, ty: 0, vx: 0, vy: 0, r: 0, tr: 0, sc: 1, tsc: 1, sh: 0, tsh: 0, z: o.z, el: q(`[data-obj="${o.key}"]`), inner: q(`[data-inner="${o.key}"]`), main: q(`[data-main="${o.key}"]`), alt: q(`[data-alt="${o.key}"]`) }
            if (o.kind === "static") return
            const im = new Image()
            im.crossOrigin = "anonymous"
            im.onload = () => {
                try {
                    const w = Math.min(240, im.naturalWidth), h = Math.round((im.naturalHeight * w) / im.naturalWidth)
                    const c = document.createElement("canvas"); c.width = w; c.height = h
                    const g = c.getContext("2d")!; g.drawImage(im, 0, 0, w, h)
                    this.hit[o.key] = g.getImageData(0, 0, w, h)
                } catch (e) {}
            }
            im.src = joinUrl(base, o.file)
        })
        this.glow = q("[data-glow]"); this.dogFx = q('[data-fx="dog"]')
        if (!this.reduce) {
            const L = { iterations: Infinity }
            this.dogBreath = this.s.dog.main.animate([{ transform: "scale(1,1)" }, { transform: "scale(1.003,1.018)" }], { ...L, duration: 2900, direction: "alternate", easing: "ease-in-out" })
            this.loops.push(this.s.girl.inner.animate([{ transform: "scale(1,1)" }, { transform: "scale(1.002,1.007)" }], { ...L, duration: 3600, direction: "alternate", easing: "ease-in-out" }))
            ;["hangplant", "pothos", "catplant"].forEach((k, i) => this.loops.push(this.s[k].main.animate([{ transform: "rotate(-0.7deg)" }, { transform: "rotate(0.7deg)" }], { ...L, duration: 4200 + i * 700, direction: "alternate", easing: "ease-in-out" })))
            this.s.hangplant.main.style.transformOrigin = "72% 28%"; this.s.pothos.main.style.transformOrigin = "50% 47%"; this.s.catplant.main.style.transformOrigin = "50% 95%"
            if (this.glow) this.glowAnim = this.glow.animate([{ transform: "scale(.95)" }, { transform: "scale(1.05)" }], { ...L, duration: 4200, direction: "alternate", easing: "ease-in-out" })
            this.zT = setInterval(() => { if (!this.dogBusy) this.spawn(this.dogFx, "z", "#A58B70", 13 + Math.random() * 8, 16 + Math.random() * 18, -46, 2600) }, 1700)
        }
        stage.addEventListener("pointerdown", this.down)
        stage.addEventListener("pointermove", this.hover)
        stage.addEventListener("pointerleave", this.unhover)
        stage.addEventListener("touchstart", this.touchStart, { passive: false })
        window.addEventListener("pointermove", this.move)
        window.addEventListener("pointerup", this.up)
        window.addEventListener("pointercancel", this.up)
        const loop = () => { this.frame(); this.raf = requestAnimationFrame(loop) }
        this.raf = requestAnimationFrame(loop)
    }
    destroy() {
        cancelAnimationFrame(this.raf); clearInterval(this.zT); [this.dogT, this.hpT, this.hiT, this.nT].forEach(clearTimeout)
        this.loops.forEach((a) => a.cancel()); this.dogBreath?.cancel(); this.glowAnim?.cancel()
        this.stage.removeEventListener("pointerdown", this.down); this.stage.removeEventListener("pointermove", this.hover); this.stage.removeEventListener("pointerleave", this.unhover); this.stage.removeEventListener("touchstart", this.touchStart)
        window.removeEventListener("pointermove", this.move); window.removeEventListener("pointerup", this.up); window.removeEventListener("pointercancel", this.up)
    }
    setMoved(m: boolean) { if (this.moved !== m) { this.moved = m; this.onMoved(m) } }
    spawn(box: HTMLElement | null, text: string, color: string, size: number, dx: number, dy: number, dur: number) {
        if (!box) return
        const el = document.createElement("span"); el.textContent = text
        el.style.cssText = `position:absolute;left:${Math.random() * 70}%;bottom:0;font:700 ${size}px Satoshi,system-ui,sans-serif;color:${color};pointer-events:none`
        box.appendChild(el)
        el.animate([{ transform: "translate(0,0) scale(.6)", opacity: 0 }, { opacity: 1, offset: 0.2 }, { transform: `translate(${dx}px,${dy}px) scale(1)`, opacity: 0 }], { duration: dur, easing: "ease-out" }).onfinish = () => el.remove()
    }
    local(e: { clientX: number; clientY: number }) { const r = this.stage.getBoundingClientRect(), k = r.width / IW; return { px: (e.clientX - r.left) / k, py: (e.clientY - r.top) / k, k } }
    inHp(px: number, py: number) { const g = BY.girl, u = (px - g.x) / g.w, v = (py - g.y) / g.h; return HP_ZONES.some(([a, b, c, d]) => u >= a && u <= c && v >= b && v <= d) }
    pick(e: { clientX: number; clientY: number }): Obj | null {
        const { px, py } = this.local(e)
        if (this.hpOn && this.inHp(px, py)) return BY.hp
        const order = OBJ.filter((o) => o.kind !== "static" && !(o.kind === "hp" && this.hpOn)).sort((a, b) => this.s[b.key].z - this.s[a.key].z)
        for (const o of order) {
            const st = this.s[o.key], lx = px - o.x - st.x, ly = py - o.y - st.y
            if (lx < 0 || ly < 0 || lx >= o.w || ly >= o.h) continue
            const d = this.hit[o.key]; if (!d) return o
            const ix = Math.floor((lx / o.w) * d.width), iy = Math.floor((ly / o.h) * d.height)
            if (d.data[(iy * d.width + ix) * 4 + 3] > 50) return o
        }
        return null
    }
    // on touch: block page scroll only when the finger lands on an object
    touchStart = (e: TouchEvent) => { const t = e.touches[0]; if (t && e.touches.length === 1 && this.pick(t)) e.preventDefault() }
    front(key: string) {
        const st = this.s[key]; st.z = ++this.zTop; if (st.el) st.el.style.zIndex = st.z
        ;(RIDERS[key] || []).forEach((r) => { if (this.link[r]) { const rs = this.s[r]; rs.z = ++this.zTop; rs.el.style.zIndex = rs.z } })
    }
    setHp(on: boolean) {
        this.hpOn = on; const g = this.s.girl, h = this.s.hp
        if (g.main) g.main.style.opacity = on ? "1" : "0"
        if (g.alt) g.alt.style.opacity = on ? "0" : "1"
        if (h.el) { h.el.style.transition = "opacity .3s ease"; h.el.style.opacity = on ? "0" : "1" }
        if (!this.reduce && g.inner) g.inner.animate([{ transform: "translateY(0)" }, { transform: "translateY(-5px) scale(1.01,.99)", offset: 0.4 }, { transform: "translateY(0)" }], { duration: 480, easing: "ease-out" })
    }
    down = (e: PointerEvent) => {
        if ((e.target as HTMLElement).closest("[data-jr-reset]")) return
        const o = this.pick(e); if (!o) return
        e.preventDefault()
        const st = this.s[o.key]
        if (o.kind === "girl") { this.click(o); return }
        if (o.kind === "hp" && this.hpOn) { st.tx = st.ty = st.x = st.y = 0; st.sc = 1.25; this.setHp(false) }
        this.front(o.key); this.link[o.key] = false
        this.drag = { o, sx: e.clientX, sy: e.clientY, ox: st.tx, oy: st.ty, k: this.local(e).k, lastX: e.clientX, t: performance.now(), dist: o.kind === "hp" && st.sc > 1.2 ? 99 : 0 }
        this.stage.style.cursor = "grabbing"
    }
    move = (e: PointerEvent) => {
        const dg = this.drag; if (!dg) return
        const o = dg.o, st = this.s[o.key]
        dg.dist = Math.max(dg.dist, Math.hypot(e.clientX - dg.sx, e.clientY - dg.sy))
        if (dg.dist < 5) return
        st.tsc = o.kind === "wall" ? 1.03 : 1.06; st.tsh = 1
        let nx = dg.ox + (e.clientX - dg.sx) / dg.k, ny = dg.oy + (e.clientY - dg.sy) / dg.k
        if (o.kind === "wall") { nx = dg.ox + (nx - dg.ox) * 0.4; ny = dg.oy + (ny - dg.oy) * 0.4 }
        const cx = o.x + o.w / 2 + nx, cy = o.y + o.h / 2 + ny, m = 30
        if (cx < m) nx += m - cx; if (cx > IW - m) nx -= cx - (IW - m); if (cy < m) ny += m - cy; if (cy > IH - m) ny -= cy - (IH - m)
        st.tx = nx; st.ty = ny
        const dx = e.clientX - dg.lastX; dg.lastX = e.clientX
        st.tr = Math.max(-8, Math.min(8, st.tr * 0.7 + dx * 0.35))
        this.setMoved(true)
    }
    up = () => {
        const dg = this.drag; if (!dg) return
        const o = dg.o, st = this.s[o.key]; st.tr = 0; st.tsc = 1; st.tsh = 0
        this.drag = null; this.stage.style.cursor = "default"
        const click = dg.dist < 5 && performance.now() - dg.t < 450
        if (o.kind === "wall") { st.tx = 0; st.ty = 0; this.link[o.key] = true; setTimeout(() => { st.z = o.z; st.el.style.zIndex = o.z }, 700) }
        if (o.kind === "hp" && (click || Math.hypot(st.tx, st.ty) < 110)) { this.wearHp(); return }
        if (click) this.click(o)
        else if (!this.reduce && o.kind !== "wall") st.inner.animate([{ transform: "scale(1.03,.97)" }, { transform: "scale(.99,1.01)", offset: 0.5 }, { transform: "scale(1,1)" }], { duration: 360, easing: "ease-out" })
    }
    wearHp() { const st = this.s.hp; st.tx = 0; st.ty = 0; st.tsc = 1.2; clearTimeout(this.hpT); this.hpT = setTimeout(() => { this.setHp(true); st.tsc = 1; st.sc = 1 }, 320) }
    pop(el: HTMLElement | null, key: "hiT" | "nT", hold: number) {
        if (!el) return; clearTimeout(this[key]); el.getAnimations().forEach((a) => a.cancel())
        el.animate([{ opacity: 0, transform: "translateY(8px) scale(.9)" }, { opacity: 1, transform: "translateY(0) scale(1)" }], { duration: this.reduce ? 1 : 320, easing: "cubic-bezier(.3,1.4,.5,1)", fill: "forwards" })
        this[key] = setTimeout(() => el.animate([{ opacity: 1 }, { opacity: 0, transform: "translateY(-4px) scale(.97)" }], { duration: 280, easing: "ease-in", fill: "forwards" }), hold)
    }
    showNotif() {
        const o = BY.phone, st = this.s.phone, el = this.refs.notif.current as HTMLElement; if (!el) return
        const [app, txt] = NOTIFS[this.nN++ % NOTIFS.length]
        this.refs.notifApp.current.textContent = app; this.refs.notifText.current.textContent = txt
        el.style.left = ((o.x + st.tx + o.w / 2) / IW) * 100 + "%"; el.style.top = ((o.y + st.ty - 14) / IH) * 100 + "%"
        this.pop(el, "nT", 2800)
    }
    click(o: Obj) {
        const st = this.s[o.key], R = this.reduce
        if (o.kind === "wall") {
            this.link[o.key] = true
            if (!R) st.inner.animate([{ transform: "rotate(0deg)" }, { transform: "translateY(-5px) rotate(-7deg)", offset: 0.18 }, { transform: "translateY(-2px) rotate(5deg)", offset: 0.4 }, { transform: "rotate(-3deg)", offset: 0.6 }, { transform: "rotate(1.5deg)", offset: 0.8 }, { transform: "rotate(0deg)" }], { duration: 1400, easing: "ease-out" })
        } else if (o.kind === "lamp") { this.lampOn = !this.lampOn; this.applyLamp() }
        else if (o.kind === "dog") this.happyDog()
        else if (o.key === "phone") { this.showNotif(); if (!R) st.inner.animate([{ transform: "rotate(0)" }, { transform: "rotate(-4deg)", offset: 0.2 }, { transform: "rotate(4deg)", offset: 0.4 }, { transform: "rotate(-3deg)", offset: 0.6 }, { transform: "rotate(0)" }], { duration: 480 }) }
        else if (!R) st.inner.animate([{ transform: "translateY(0)" }, { transform: `translateY(-8px) rotate(${o.kind === "girl" ? -1 : -2}deg)`, offset: 0.35 }, { transform: "translateY(0)" }], { duration: 520, easing: "cubic-bezier(.3,1.4,.5,1)" })
    }
    applyLamp() {
        const l = this.s.lamp
        if (l.inner) l.inner.style.filter = this.lampOn ? "none" : "grayscale(.4) sepia(.3) brightness(.9)"
        if (this.glow) this.glow.style.opacity = this.lampOn ? "" : "0"
        if (this.glowAnim) this.lampOn ? this.glowAnim.play() : this.glowAnim.pause()
        this.stage.style.filter = this.lampOn ? "none" : "brightness(.9) saturate(.86)"
    }
    happyDog() {
        if (this.dogBusy) return; this.dogBusy = true
        const d = this.s.dog; this.dogBreath?.pause()
        d.main.style.opacity = "0"; if (d.alt) d.alt.style.opacity = "1"
        if (!this.reduce) d.inner.animate([
            { transform: "translateY(0) rotate(0deg)" }, { transform: "translateY(-10px) rotate(-1.5deg)", offset: 0.1 }, { transform: "translateY(0) rotate(0deg)", offset: 0.2 },
            { transform: "translateY(-6px) rotate(1.5deg)", offset: 0.3 }, { transform: "translateY(0) rotate(0deg)", offset: 0.4 }, { transform: "rotate(-1deg)", offset: 0.55 }, { transform: "rotate(1deg)", offset: 0.7 }, { transform: "translateY(0) rotate(0deg)" }], { duration: 2900, easing: "ease-in-out" })
        let n = 0
        const t = setInterval(() => { this.spawn(this.dogFx, "♥", "#E3958A", 16 + Math.random() * 10, (Math.random() - 0.5) * 60, -80, 1800); if (++n > 8) clearInterval(t) }, 240)
        this.dogT = setTimeout(() => { d.main.style.opacity = "1"; if (d.alt) d.alt.style.opacity = "0"; this.dogBusy = false; this.dogBreath?.play() }, 3200)
    }
    hover = (e: PointerEvent) => {
        if (this.drag || e.pointerType === "touch") return
        const o = this.pick(e), k = o ? o.key : null
        if (k === this.hoverKey) return
        if (this.hoverKey && this.hoverKey !== "girl") { const p = this.s[this.hoverKey]; p.tsc = 1; p.tsh = 0 }
        this.hoverKey = k
        if (o && k !== "girl" && !(k === "hp" && this.hpOn)) { const s = this.s[o.key]; s.tsc = o.kind === "wall" ? 1.02 : 1.03; s.tsh = 0.45 }
        this.stage.style.cursor = !o ? "default" : ["wall", "lamp", "dog", "girl"].includes(o.kind) ? "pointer" : "grab"
    }
    unhover = () => { if (this.drag || !this.hoverKey) return; const p = this.s[this.hoverKey]; p.tsc = 1; p.tsh = 0; this.hoverKey = null }
    reset = () => {
        OBJ.forEach((o, i) => { const st = this.s[o.key]; this.link[o.key] = true; setTimeout(() => { st.tx = 0; st.ty = 0; st.tr = 0; st.tsc = 1; st.tsh = 0 }, i * 25) })
        setTimeout(() => OBJ.forEach((o) => { const st = this.s[o.key]; st.z = o.z; if (st.el) st.el.style.zIndex = o.z }), 800)
        if (!this.hpOn) this.wearHp()
        this.zTop = 100; this.lampOn = true; this.applyLamp(); this.setMoved(false)
    }
    frame() {
        const R = this.reduce, dragKey = this.drag && this.drag.o.key
        for (const o of OBJ) {
            const st = this.s[o.key]; if (!st || !st.el || o.kind === "static") continue
            const par = PARENT[o.key]
            if (par && this.link[o.key] && o.key !== dragKey) { const p = this.s[par]; st.tx = p.tx; st.ty = p.ty; st.x = p.x; st.y = p.y; st.vx = p.vx; st.vy = p.vy }
            else if (R) { st.x = st.tx; st.y = st.ty }
            else {
                const k = o.key === dragKey ? 0.22 : 0.09, damp = o.key === dragKey ? 0.6 : 0.78
                st.vx = (st.vx + (st.tx - st.x) * k) * damp; st.vy = (st.vy + (st.ty - st.y) * k) * damp
                st.x += st.vx; st.y += st.vy
            }
            if (R) { st.r = st.tr; st.sc = st.tsc; st.sh = st.tsh }
            else { st.r += (st.tr - st.r) * 0.14; st.sc += (st.tsc - st.sc) * 0.18; st.sh += (st.tsh - st.sh) * 0.15 }
            const idle = Math.abs(st.x - st.tx) + Math.abs(st.y - st.ty) + Math.abs(st.vx) + Math.abs(st.r - st.tr) + Math.abs(st.sc - st.tsc) + Math.abs(st.sh - st.tsh) < 0.02 && o.key !== dragKey
            if (idle && st.idle) continue
            st.idle = idle
            st.el.style.translate = ((st.x / o.w) * 100).toFixed(3) + "% " + ((st.y / o.h) * 100).toFixed(3) + "%"
            st.el.style.rotate = st.r.toFixed(2) + "deg"
            st.el.style.scale = st.sc.toFixed(4)
            st.el.style.filter = st.sh > 0.01 ? `drop-shadow(0 ${(st.sh * 18).toFixed(1)}px ${(st.sh * 16).toFixed(1)}px rgba(80,52,30,${(st.sh * 0.26).toFixed(3)}))` : "none"
        }
    }
}

const pct = (v: number, t: number) => ((v / t) * 100).toFixed(3) + "%"
const SCOPED_CSS = `
.jr-root, .jr-root * { box-sizing: border-box; }
.jr-root img { max-width: none; }
.jr-reset { transition: opacity .4s ease, background .25s ease, color .25s ease; }
.jr-reset:hover { background: #2B2522 !important; color: #FFFDF9 !important; }
`

export default function JanviRoom(props: any) {
    const { assetBase, background, padding, showReset, loadFont, style } = props
    const stageRef = React.useRef<HTMLDivElement>(null)
    const notif = React.useRef<HTMLDivElement>(null), notifApp = React.useRef<HTMLSpanElement>(null), notifText = React.useRef<HTMLSpanElement>(null)
    const engine = React.useRef<Engine | null>(null)
    const [moved, setMoved] = React.useState(false)
    const base = assetBase || ""

    React.useEffect(() => {
        if (!loadFont || typeof document === "undefined") return
        const id = "jr-satoshi-font"
        if (document.getElementById(id)) return
        const l = document.createElement("link"); l.id = id; l.rel = "stylesheet"
        l.href = "https://api.fontshare.com/v2/css?f[]=satoshi@500,700&display=swap"
        document.head.appendChild(l)
    }, [loadFont])

    React.useEffect(() => {
        if (!stageRef.current || !base) return
        engine.current = new Engine(stageRef.current, { notif, notifApp, notifText }, base, setMoved)
        return () => { engine.current?.destroy(); engine.current = null }
    }, [base])

    if (!base) {
        return (
            <div style={{ ...style, width: "100%", aspectRatio: "3 / 2", display: "flex", alignItems: "center", justifyContent: "center", background: "#F6F1E9", color: "#2B2522", fontFamily: "system-ui,sans-serif", fontSize: 14, textAlign: "center", padding: 24, borderRadius: 12 }}>
                Set “Asset URL” in the right panel to the folder that holds the room images.
            </div>
        )
    }

    return (
        <div className="jr-root" style={{ ...style, width: "100%", display: "flex", justifyContent: "center", padding, background, fontFamily: "'Satoshi', system-ui, sans-serif" }}>
            <style>{SCOPED_CSS}</style>
            <div ref={stageRef} aria-label="Janvi's interactive room" style={{ position: "relative", width: "100%", aspectRatio: "3 / 2", touchAction: "pan-y", userSelect: "none", WebkitUserSelect: "none", transition: "filter .7s ease" }}>
                {OBJ.map((o) => {
                    const sh = SHADOW[o.key], alt = ALT[o.key]
                    return (
                        <div key={o.key} data-obj={o.key} style={{ position: "absolute", left: pct(o.x, IW), top: pct(o.y, IH), width: pct(o.w, IW), zIndex: o.z, transformOrigin: o.origin, pointerEvents: "none", willChange: "transform", opacity: o.kind === "hp" ? 0 : 1 }}>
                            {sh && <span style={{ position: "absolute", left: sh[0] + "%", width: sh[1] + "%", bottom: sh[2] + "%", height: sh[3] + "%", borderRadius: "50%", background: "radial-gradient(closest-side,rgba(90,62,40,.30),rgba(90,62,40,.12) 60%,rgba(90,62,40,0))", display: "block" }} />}
                            {o.kind === "lamp" && <span data-glow="1" style={{ position: "absolute", left: "-95%", top: "-70%", width: "290%", height: "210%", borderRadius: "50%", background: "radial-gradient(closest-side,rgba(255,206,130,.42),rgba(255,214,150,.16) 55%,rgba(255,214,150,0))", display: "block", transition: "opacity .6s ease" }} />}
                            <span data-inner={o.key} style={{ position: "relative", display: "block", width: "100%", aspectRatio: `${o.w} / ${o.h}`, transformOrigin: o.origin, transition: "filter .6s ease" }}>
                                <img src={joinUrl(base, o.file)} alt={o.alt} draggable={false} data-main={o.key} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block", transition: "opacity .35s ease" }} />
                                {alt && <img src={joinUrl(base, alt.file)} alt="" draggable={false} data-alt={o.key} style={{ position: "absolute", left: alt.l, top: alt.t, width: alt.w, display: "block", opacity: 0, transition: "opacity .35s ease" }} />}
                            </span>
                            {o.kind === "dog" && <span data-fx="dog" style={{ position: "absolute", left: "14%", top: "-30%", width: "30%", height: "50%", pointerEvents: "none", display: "block" }} />}
                        </div>
                    )
                })}
                <div ref={notif} style={{ position: "absolute", left: "44%", top: "73%", zIndex: 998, pointerEvents: "none", opacity: 0, translate: "-50% -100%", width: "clamp(170px,17vw,240px)" }}>
                    <div style={{ display: "flex", gap: 9, alignItems: "flex-start", padding: "10px 12px", background: "rgba(255,253,249,.94)", backdropFilter: "blur(8px)", border: "1px solid rgba(43,37,34,.14)", borderRadius: 14, boxShadow: "0 12px 28px rgba(70,45,25,.18)" }}>
                        <span style={{ flex: "none", width: 26, height: 26, borderRadius: 7, background: "#2B2522", color: "#FFFDF9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>J</span>
                        <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                            <span style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "#8A7F76" }}><span ref={notifApp}>FIGMA</span><span>now</span></span>
                            <span ref={notifText} style={{ fontSize: 12.5, fontWeight: 500, lineHeight: 1.3, color: "#2B2522" }}>Anna commented: "Love this flow."</span>
                        </span>
                    </div>
                </div>
                {showReset && (
                    <button data-jr-reset="1" className="jr-reset" onClick={() => engine.current?.reset()} aria-label="Reset the room" style={{ position: "absolute", right: "0.6%", bottom: "0.6%", zIndex: 999, display: "flex", alignItems: "center", gap: 6, padding: "7px 12px 7px 10px", borderRadius: 999, border: "1px solid rgba(43,37,34,.18)", background: "rgba(255,253,249,.86)", backdropFilter: "blur(6px)", color: "#2B2522", fontFamily: "inherit", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", cursor: "pointer", opacity: moved ? 1 : 0.55 }}>
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" /></svg>RESET
                    </button>
                )}
            </div>
        </div>
    )
}

JanviRoom.defaultProps = { assetBase: "", background: "#F6F1E9", padding: 0, showReset: true, loadFont: true }

addPropertyControls(JanviRoom, {
    assetBase: { type: ControlType.String, title: "Asset URL", placeholder: "https://cdn.jsdelivr.net/gh/you/repo@main/room3/" },
    background: { type: ControlType.Color, title: "Background" },
    padding: { type: ControlType.Number, title: "Padding", min: 0, max: 120, step: 4, unit: "px" },
    showReset: { type: ControlType.Boolean, title: "Reset button" },
    loadFont: { type: ControlType.Boolean, title: "Load Satoshi" },
})
