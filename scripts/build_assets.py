"""Export curated Eagle items into public/w and write src/data/catalog.json.

Usage: python3 scripts/build_assets.py [--force]
"""

import base64
import colorsys
import glob
import io
import json
import os
import shutil
import sys

from PIL import Image, ImageFilter, ImageStat

sys.path.insert(0, os.path.dirname(__file__))
from catalog import GAMES, WALLPAPERS  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LIB = "/Users/hanqian/My_/我的图库.library/images"
OUT = os.path.join(ROOT, "public", "w")
GAME_OUT = os.path.join(ROOT, "public", "g")
DATA = os.path.join(ROOT, "src", "data", "catalog.json")
FORCE = "--force" in sys.argv

Image.MAX_IMAGE_PIXELS = None


def source_file(eagle_id):
    folder = os.path.join(LIB, f"{eagle_id}.info")
    meta = json.load(open(os.path.join(folder, "metadata.json")))
    files = [
        f
        for f in glob.glob(os.path.join(folder, "*"))
        if not f.endswith(".json") and not f.endswith("_thumbnail.png")
    ]
    assert len(files) == 1, (eagle_id, files)
    return files[0], meta


def fit(im, long_side):
    w, h = im.size
    s = long_side / max(w, h)
    if s >= 1:
        return im.copy()
    return im.resize((round(w * s), round(h * s)), Image.LANCZOS)


def by_height(im, height):
    w, h = im.size
    if h <= height:
        return im.copy()
    return im.resize((round(w * height / h), height), Image.LANCZOS)


def focal_point(im):
    small = fit(im, 256).convert("L")
    edges = small.filter(ImageFilter.FIND_EDGES).filter(ImageFilter.GaussianBlur(6))
    w, h = edges.size
    px = edges.load()
    tx = ty = total = 0.0
    for y in range(2, h - 2):
        for x in range(2, w - 2):
            v = px[x, y] ** 2
            tx += v * x
            ty += v * y
            total += v
    if total == 0:
        return 0.5, 0.4
    fx = min(max(tx / total / w, 0.18), 0.82)
    fy = min(max(ty / total / h, 0.2), 0.7)
    return round(fx, 3), round(fy, 3)


def ambient(meta, im):
    palettes = sorted(meta.get("palettes", []), key=lambda p: -p["ratio"])
    pick = None
    for p in palettes:
        r, g, b = [c / 255 for c in p["color"]]
        hh, ll, ss = colorsys.rgb_to_hls(r, g, b)
        if ss > 0.18 and 0.12 < ll < 0.8:
            pick = (hh, ll, ss)
            break
    if pick is None:
        r, g, b = [c / 255 for c in (palettes[0]["color"] if palettes else (40, 40, 44))]
        pick = colorsys.rgb_to_hls(r, g, b)
    hh, ll, ss = pick
    r, g, b = colorsys.hls_to_rgb(hh, 0.16, min(ss, 0.45))
    tint = "#%02x%02x%02x" % (round(r * 255), round(g * 255), round(b * 255))
    lum = ImageStat.Stat(fit(im, 128).convert("L")).mean[0] / 255
    return tint, round(lum, 3)


def lqip(im):
    tiny = fit(im, 28).convert("RGB")
    buf = io.BytesIO()
    tiny.save(buf, "JPEG", quality=55)
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()


def save(im, path, fmt, **kw):
    if os.path.exists(path) and not FORCE:
        return
    im.save(path, fmt, **kw)


def main():
    os.makedirs(OUT, exist_ok=True)
    os.makedirs(GAME_OUT, exist_ok=True)
    os.makedirs(os.path.dirname(DATA), exist_ok=True)
    items = []
    focus_by_id = {}
    for game in GAMES:
        slug = game["slug"]
        for eagle_id, title, character, tags, featured in WALLPAPERS[slug]:
            src, meta = source_file(eagle_id)
            ext = os.path.splitext(src)[1].lower().lstrip(".")
            wid = f"{slug}-{eagle_id[-6:].lower()}"
            d = os.path.join(OUT, wid)
            os.makedirs(d, exist_ok=True)
            im = Image.open(src)
            im.load()
            rgb = im.convert("RGB")
            w, h = rgb.size

            save(by_height(rgb, 640), os.path.join(d, "thumb.webp"), "WEBP", quality=80, method=6)
            save(fit(rgb, 2560), os.path.join(d, "large.webp"), "WEBP", quality=88, method=5)

            stem = f"stillframe-{slug}-{eagle_id[-6:].lower()}"
            downloads = []
            orig_path = os.path.join(d, f"original.{ext}")
            if not os.path.exists(orig_path) or FORCE:
                shutil.copyfile(src, orig_path)
            downloads.append(
                {
                    "key": "original",
                    "label": "原图",
                    "format": ext.upper(),
                    "width": w,
                    "height": h,
                    "bytes": os.path.getsize(orig_path),
                    "url": f"/w/{wid}/original.{ext}",
                    "filename": f"{stem}-{w}x{h}.{ext}",
                }
            )
            if ext != "jpg":
                jp = os.path.join(d, "full.jpg")
                save(rgb, jp, "JPEG", quality=92, optimize=True, progressive=True)
                downloads.append(
                    {
                        "key": "jpg",
                        "label": "同尺寸 JPG",
                        "format": "JPG",
                        "width": w,
                        "height": h,
                        "bytes": os.path.getsize(jp),
                        "url": f"/w/{wid}/full.jpg",
                        "filename": f"{stem}-{w}x{h}.jpg",
                    }
                )
            if max(w, h) > 2600:
                q = fit(rgb, 2560)
                qp = os.path.join(d, "qhd.jpg")
                save(q, qp, "JPEG", quality=92, optimize=True, progressive=True)
                downloads.append(
                    {
                        "key": "qhd",
                        "label": "2560 适配版",
                        "format": "JPG",
                        "width": q.size[0],
                        "height": q.size[1],
                        "bytes": os.path.getsize(qp),
                        "url": f"/w/{wid}/qhd.jpg",
                        "filename": f"{stem}-{q.size[0]}x{q.size[1]}.jpg",
                    }
                )

            fx, fy = focal_point(rgb)
            focus_by_id[eagle_id] = (fx, fy, rgb)
            tint, lum = ambient(meta, rgb)
            ratio = w / h
            items.append(
                {
                    "id": wid,
                    "game": slug,
                    "title": title,
                    "character": character,
                    "tags": tags,
                    "featured": featured,
                    "width": w,
                    "height": h,
                    "orientation": "landscape" if ratio > 1.15 else "portrait",
                    "isUHD": max(w, h) >= 3840,
                    "tint": tint,
                    "luminance": lum,
                    "focus": [fx, fy],
                    "addedAt": meta.get("btime") or meta.get("modificationTime"),
                    "lqip": lqip(rgb),
                    "thumb": f"/w/{wid}/thumb.webp",
                    "large": f"/w/{wid}/large.webp",
                    "downloads": downloads,
                }
            )
            print(f"{wid:24s} {w}x{h} focus=({fx},{fy}) {tint} lum={lum}")

        cover = game["cover"]
        fx, fy, rgb = focus_by_id[cover]
        fx = game.pop("tileFocus", fx)
        w, h = rgb.size
        side = int(min(w, h) * game.pop("tileZoom", 1))
        cx = min(max(int(fx * w - side / 2), 0), w - side)
        cy = min(max(int(fy * h - side / 2), 0), h - side)
        tile = rgb.crop((cx, cy, cx + side, cy + side)).resize((360, 360), Image.LANCZOS)
        save(tile, os.path.join(GAME_OUT, f"{slug}.webp"), "WEBP", quality=84)
        game["tile"] = f"/g/{slug}.webp"
        game["coverId"] = f"{slug}-{cover[-6:].lower()}"

    games = [{k: v for k, v in g.items() if k != "cover"} for g in GAMES]
    with open(DATA, "w") as f:
        json.dump({"games": games, "wallpapers": items}, f, ensure_ascii=False, indent=1)
    print("wrote", len(items), "wallpapers")


if __name__ == "__main__":
    main()
