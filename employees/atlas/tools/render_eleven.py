#!/usr/bin/env python3
"""Render an Atlas episode with ElevenLabs voices.

Usage: ELEVENLABS_API_KEY=... python3 render_eleven.py <episode dir> [--atlas VOICE_ID] [--finn VOICE_ID]

Reads <dir>/script.md (alternating GUIDE: / KID: lines, '---' = segment break),
renders every line, stitches with ffmpeg (350 ms between turns, 1.5 s at breaks,
loudnorm), writes <dir>/<slug>-episode.mp3 and <dir>/eleven_usage.json
(characters used, for Radar's spend log).
Voice ids come from --atlas / --finn or ELEVEN_VOICE_ATLAS / ELEVEN_VOICE_FINN.
The key is read from the environment only. Never paste it anywhere.
"""
import json, os, pathlib, subprocess, sys, time, urllib.request

API = "https://api.elevenlabs.io/v1"
KEY = os.environ.get("ELEVENLABS_API_KEY")
if not KEY:
    sys.exit("ELEVENLABS_API_KEY is not set (add it under the environment's secrets).")
CA = os.environ.get("REQUESTS_CA_BUNDLE") or "/root/.ccr/ca-bundle.crt"

args = sys.argv[1:]
if not args:
    sys.exit(__doc__)
ep = pathlib.Path(args[0])
opts = dict(zip(args[1::2], args[2::2]))
VOICES = {
    "GUIDE": opts.get("--atlas") or os.environ.get("ELEVEN_VOICE_ATLAS"),
    "KID": opts.get("--finn") or os.environ.get("ELEVEN_VOICE_FINN"),
}
if not all(VOICES.values()):
    sys.exit("Need both voice ids: --atlas and --finn (or ELEVEN_VOICE_ATLAS / ELEVEN_VOICE_FINN).")
MODEL = os.environ.get("ELEVEN_MODEL", "eleven_multilingual_v2")
SETTINGS = {
    "GUIDE": {"stability": 0.55, "similarity_boost": 0.8, "style": 0.25, "use_speaker_boost": True},
    "KID": {"stability": 0.4, "similarity_boost": 0.75, "style": 0.45, "use_speaker_boost": True},
}
# An adult co-host (Kev, 8 Nov 2026: Finn replaced) reads steadier than the boy voice was tuned for.
if os.environ.get("ELEVEN_KID_ADULT"):
    SETTINGS["KID"] = {"stability": 0.5, "similarity_boost": 0.8, "style": 0.3, "use_speaker_boost": True}

import ssl
ctx = ssl.create_default_context(cafile=CA) if os.path.exists(CA) else ssl.create_default_context()

def tts(text, role, out):
    body = json.dumps({"text": text, "model_id": MODEL, "voice_settings": SETTINGS[role]}).encode()
    req = urllib.request.Request(
        f"{API}/text-to-speech/{VOICES[role]}?output_format=mp3_44100_128",
        data=body, method="POST",
        headers={"xi-api-key": KEY, "Content-Type": "application/json", "Accept": "audio/mpeg"},
    )
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, context=ctx, timeout=120) as r:
                out.write_bytes(r.read())
            return
        except Exception as e:  # rate limit or hiccup: back off
            if attempt == 3:
                raise
            time.sleep(2 ** attempt)

lines = []
for raw in (ep / "script.md").read_text().splitlines():
    s = raw.strip()
    if not s:
        continue
    if s == "---":
        lines.append(("BREAK", ""))
    elif s.startswith("GUIDE:"):
        lines.append(("GUIDE", s[6:].strip()))
    elif s.startswith("KID:"):
        lines.append(("KID", s[4:].strip()))

seg = ep / "eleven_segments"
seg.mkdir(exist_ok=True)
chars = 0
parts = []
for i, (role, text) in enumerate(lines):
    if role == "BREAK":
        parts.append(("gap", 1.5))
        continue
    f = seg / f"{i:04d}.mp3"
    if not f.exists():
        tts(text, role, f)
        print(f"{i:04d} {role:5s} {len(text):4d} chars", flush=True)
    chars += len(text)
    parts.append(("file", f))
    parts.append(("gap", 0.35))

# stitch: build a concat list with silence files
sil = {}
for d in (0.35, 1.5):
    p = seg / f"sil_{d}.mp3"
    if not p.exists():
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono", "-t", str(d), "-b:a", "128k", str(p)], check=True)
    sil[d] = p
lst = seg / "list.txt"
lst.write_text("".join(f"file '{(p if k=='file' else sil[p]).resolve()}'\n" for k, p in parts))
slug = ep.name
out = ep / f"{slug}-episode-eleven.mp3"
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", str(lst),
                "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", "44100", "-ac", "1", "-b:a", "56k", str(out)], check=True)
dur = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(out)], capture_output=True, text=True).stdout.strip()
(ep / "eleven_usage.json").write_text(json.dumps({"episode": slug, "characters": chars, "model": MODEL, "voices": VOICES, "duration_s": float(dur or 0)}, indent=2))
print(f"wrote {out.name}  {float(dur or 0)/60:.1f} min  {chars} characters")
