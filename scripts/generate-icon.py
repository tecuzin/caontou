#!/usr/bin/env python3
"""
Génère les icônes Android depuis le SVG maître via PIL (dessin direct).
Les PNG sont écrits dans les dossiers mipmap Android.
"""
import struct, zlib, math, os

def make_png(pixels, w, h):
    """Encode pixels (liste de (R,G,B,A)) en PNG brut."""
    def chunk(tag, data):
        c = zlib.crc32(tag + data) & 0xffffffff
        return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', c)

    raw = b''
    for y in range(h):
        raw += b'\x00'  # filter type None
        for x in range(w):
            r, g, b, a = pixels[y * w + x]
            raw += bytes([r, g, b, a])

    ihdr = struct.pack('>IIBBBBB', w, h, 8, 6, 0, 0, 0)
    idat = zlib.compress(raw, 9)

    return (
        b'\x89PNG\r\n\x1a\n'
        + chunk(b'IHDR', ihdr)
        + chunk(b'IDAT', idat)
        + chunk(b'IEND', b'')
    )

def lerp(a, b, t):
    return a + (b - a) * t

def lerp_color(c1, c2, t):
    return tuple(int(lerp(c1[i], c2[i], t)) for i in range(4))

def hex_to_rgba(h, a=255):
    h = h.lstrip('#')
    r, g, b = int(h[0:2],16), int(h[2:4],16), int(h[4:6],16)
    return (r, g, b, a)

def blend(dst, src):
    """Alpha compositing src over dst."""
    sa = src[3] / 255.0
    da = dst[3] / 255.0
    oa = sa + da * (1 - sa)
    if oa == 0:
        return (0,0,0,0)
    r = int((src[0]*sa + dst[0]*da*(1-sa)) / oa)
    g = int((src[1]*sa + dst[1]*da*(1-sa)) / oa)
    b = int((src[2]*sa + dst[2]*da*(1-sa)) / oa)
    return (r, g, b, int(oa*255))

def point_in_polygon(px, py, polygon):
    n = len(polygon)
    inside = False
    j = n - 1
    for i in range(n):
        xi, yi = polygon[i]
        xj, yj = polygon[j]
        if ((yi > py) != (yj > py)) and (px < (xj - xi) * (py - yi) / (yj - yi) + xi):
            inside = not inside
        j = i
    return inside

def dist_to_segment(px, py, x1, y1, x2, y2):
    dx, dy = x2 - x1, y2 - y1
    if dx == 0 and dy == 0:
        return math.hypot(px - x1, py - y1)
    t = max(0, min(1, ((px - x1)*dx + (py - y1)*dy) / (dx*dx + dy*dy)))
    return math.hypot(px - (x1 + t*dx), py - (y1 + t*dy))

def render_icon(size):
    S = size
    pixels = [(0,0,0,0)] * (S * S)

    def set_px(x, y, color):
        if 0 <= x < S and 0 <= y < S:
            idx = y * S + x
            pixels[idx] = blend(pixels[idx], color)

    def fill_rect_aa(x, y, w, h, color, radius=0):
        for py in range(max(0, int(y)-1), min(S, int(y+h)+2)):
            for px in range(max(0, int(x)-1), min(S, int(x+w)+2)):
                # Distance au rectangle arrondi
                dx = max(0, max(x + radius - px, px - (x + w - radius)))
                dy = max(0, max(y + radius - py, py - (y + h - radius)))
                d = math.hypot(dx, dy) - radius
                alpha = max(0.0, min(1.0, 0.5 - d))
                if alpha > 0:
                    c = (color[0], color[1], color[2], int(color[3] * alpha))
                    set_px(px, py, c)

    def fill_poly(polygon, color):
        xs = [p[0] for p in polygon]
        ys = [p[1] for p in polygon]
        min_x, max_x = max(0, int(min(xs))-1), min(S, int(max(xs))+2)
        min_y, max_y = max(0, int(min(ys))-1), min(S, int(max(ys))+2)
        for py in range(min_y, max_y):
            for px in range(min_x, max_x):
                if point_in_polygon(px + 0.5, py + 0.5, polygon):
                    set_px(px, py, color)

    def fill_circle(cx, cy, r, color):
        for py in range(max(0, int(cy-r)-1), min(S, int(cy+r)+2)):
            for px in range(max(0, int(cx-r)-1), min(S, int(cx+r)+2)):
                d = math.hypot(px + 0.5 - cx, py + 0.5 - cy)
                alpha = max(0.0, min(1.0, r - d + 0.5))
                if alpha > 0:
                    c = (color[0], color[1], color[2], int(color[3] * alpha))
                    set_px(px, py, c)

    def v(x, y):
        """Scale vertex from 512-space to S-space."""
        return (x * S / 512, y * S / 512)

    # ── Background sky gradient ──────────────────────────────
    sky_top    = hex_to_rgba('#3a6fa5')
    sky_bot    = hex_to_rgba('#a8c8e8')
    corner_r   = S * 0.22
    for py in range(S):
        t = py / S
        c = lerp_color(sky_top, sky_bot, t)
        for px in range(S):
            # Rounded corner mask
            dx = max(0, corner_r - px, px - (S - corner_r))
            dy = max(0, corner_r - py, py - (S - corner_r))
            d = math.hypot(dx, dy)
            if d <= corner_r:
                pixels[py * S + px] = blend(pixels[py * S + px], c)

    # ── Clouds ───────────────────────────────────────────────
    for cx, cy, rx, ry, op in [
        (80,100,48,22,150), (112,92,38,20,150), (58,108,32,16,150),
        (300,75,40,18,115), (328,67,32,16,115),
    ]:
        for py in range(max(0,int((cy-ry)*S/512)-1), min(S,int((cy+ry)*S/512)+2)):
            for px in range(max(0,int((cx-rx)*S/512)-1), min(S,int((cx+rx)*S/512)+2)):
                ex = (px*512/S - cx) / rx
                ey = (py*512/S - cy) / ry
                if ex*ex + ey*ey <= 1:
                    set_px(px, py, (255,255,255,op))

    # ── Sun ──────────────────────────────────────────────────
    scx, scy, sr = v(400,100)[0], v(400,100)[1], 52*S/512
    fill_circle(scx, scy, sr*1.3, (245,197,24,50))  # halo
    fill_circle(scx, scy, sr,     (245,197,24,255))

    # ── Back mountain (Puy Mary) ─────────────────────────────
    poly_back = [v(*p) for p in [(60,470),(200,170),(360,390),(440,140),(550,320),(550,470)]]
    fill_poly(poly_back, hex_to_rgba('#5b7042'))
    # Snow Puy Mary
    fill_poly([v(*p) for p in [(440,140),(406,200),(474,200)]], (255,255,255,235))

    # ── Front mountain ───────────────────────────────────────
    poly_front = [v(*p) for p in [(-20,512),(120,260),(270,430),(370,230),(512,360),(512,512)]]
    fill_poly(poly_front, hex_to_rgba('#3d5030'))
    # Snow front
    fill_poly([v(*p) for p in [(370,230),(335,285),(405,285)]], (255,255,255,225))

    # ── Meadow ───────────────────────────────────────────────
    meadow_pts = []
    for px in range(S+1):
        sx = px * 512 / S
        sy = 460 + 20 * math.sin(sx * math.pi / 512)
        meadow_pts.append((px, int(sy * S / 512)))
    for px in range(S, -1, -1):
        meadow_pts.append((px, S))
    fill_poly(meadow_pts, hex_to_rgba('#5a8840'))

    # ── House (gite) ─────────────────────────────────────────
    hx, hy, hw, hh = v(188,415)[0], v(188,415)[1], 110*S/512, 68*S/512
    fill_rect_aa(hx, hy, hw, hh, hex_to_rgba('#d4a96a'), radius=3*S/512)

    # Roof
    fill_poly([v(*p) for p in [(178,415),(243,362),(308,415)]], hex_to_rgba('#8b3a2a'))

    # Chimney
    fill_rect_aa(*v(268,362), 16*S/512, 30*S/512, hex_to_rgba('#9c7055'))

    # Windows
    wx, wy, ww, wh = v(200,425)[0], v(200,425)[1], 24*S/512, 22*S/512
    fill_rect_aa(wx, wy, ww, wh, hex_to_rgba('#a8c8e8'), radius=2*S/512)
    wx2 = v(262,425)[0]
    fill_rect_aa(wx2, wy, ww, wh, hex_to_rgba('#a8c8e8'), radius=2*S/512)

    # Door
    fill_rect_aa(*v(228,443), 30*S/512, 40*S/512, hex_to_rgba('#7a5030'), radius=3*S/512)

    # ── Fir trees ────────────────────────────────────────────
    for tx, ty in [(145,470),(332,465)]:
        fill_poly([v(tx,ty), v(tx+13,ty-35), v(tx+26,ty)], hex_to_rgba('#2d5020'))
        fill_poly([v(tx+3,ty-20), v(tx+13,ty-42), v(tx+23,ty-20)], hex_to_rgba('#2d5020'))

    return pixels

def write_icon(path, size):
    pixels = render_icon(size)
    png = make_png(pixels, size, size)
    with open(path, 'wb') as f:
        f.write(png)
    print(f'  ✅ {size}x{size} → {path}')

sizes = {
    'android/app/src/main/res/mipmap-mdpi':     48,
    'android/app/src/main/res/mipmap-hdpi':     72,
    'android/app/src/main/res/mipmap-xhdpi':    96,
    'android/app/src/main/res/mipmap-xxhdpi':   144,
    'android/app/src/main/res/mipmap-xxxhdpi':  192,
}

print('🎨 Génération des icônes Cantou...')
for directory, size in sizes.items():
    os.makedirs(directory, exist_ok=True)
    write_icon(f'{directory}/ic_launcher.png', size)
    write_icon(f'{directory}/ic_launcher_round.png', size)

# Aussi écrire un PNG 512x512 pour public/
write_icon('public/cantou-icon.png', 512)
print('\n✅ Toutes les icônes générées !')
