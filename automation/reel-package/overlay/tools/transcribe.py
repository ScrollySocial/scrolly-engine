"""Transcribes Reel footage locally (faster-whisper, CPU, nothing uploaded) with word timestamps.
Writes <name>.json (segments + words) and <name>.txt (one timestamped line per segment) next to each .wav.
Usage: .venv/Scripts/python transcribe.py <wav or folder> [--model base.en|small.en]
"""
import sys, json, pathlib, wave
import numpy as np
from faster_whisper import WhisperModel

args = [a for a in sys.argv[1:] if not a.startswith("--")]
model_name = sys.argv[sys.argv.index("--model") + 1] if "--model" in sys.argv else "base.en"
if model_name in args: args.remove(model_name)
paths = []
for a in args:
    p = pathlib.Path(a)
    paths += sorted(p.glob("*.wav")) if p.is_dir() else [p]

model = WhisperModel(model_name, device="cpu", compute_type="int8")
for wav in paths:
    out = wav.with_suffix(".json")
    if out.exists(): print("skip", wav.name); continue
    with wave.open(str(wav)) as w: audio = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768.0
    segs, info = model.transcribe(audio, word_timestamps=True, vad_filter=True, language="en")
    data = []
    for s in segs:
        data.append({"start": round(s.start, 2), "end": round(s.end, 2), "text": s.text.strip(),
                     "words": [{"w": w.word, "s": round(w.start, 2), "e": round(w.end, 2)} for w in (s.words or [])]})
    out.write_text(json.dumps(data, indent=1), encoding="utf8")
    wav.with_suffix(".txt").write_text("\n".join(f"[{d['start']:7.2f}-{d['end']:7.2f}] {d['text']}" for d in data), encoding="utf8")
    print("done", wav.name, f"{info.duration:.0f}s", len(data), "segments", flush=True)
