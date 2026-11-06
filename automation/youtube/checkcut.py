"""Listens to a finished rough cut and lists every spot where a word is clipped, lost or garbled at a join.
Transcribes <exports>/<id>/roughcut.mp4 again (faster-whisper, local) and lines it up with words.json (what she said in
the takes, kept by the cut). A mismatch within 0.6 s of a join is a cut problem; elsewhere it is usually Whisper.
Usage: ../carousels/.venv/Scripts/python checkcut.py <id> [--model small.en]
"""
import sys, json, re, subprocess, pathlib, difflib, wave
import numpy as np
from faster_whisper import WhisperModel

HERE = pathlib.Path(__file__).parent
FF = HERE / "../hyperframes-test/bin/ffmpeg.exe"
EXPORTS = pathlib.Path("C:/Users/merce/OneDrive/Scrolly Media/exports/youtube")
cut_id = sys.argv[1]
model_name = sys.argv[sys.argv.index("--model") + 1] if "--model" in sys.argv else "small.en"

meta = json.loads((HERE / cut_id / "words.json").read_text(encoding="utf8"))
wav = HERE / ".cache" / cut_id / "check.wav"
subprocess.run([str(FF), "-v", "error", "-y", "-i", str(EXPORTS / cut_id / "roughcut.mp4"), "-vn", "-ac", "1", "-ar", "16000",
                "-c:a", "pcm_s16le", str(wav)], check=True)
with wave.open(str(wav)) as w:
    audio = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768.0
segs, _ = WhisperModel(model_name, device="cpu", compute_type="int8").transcribe(audio, word_timestamps=True, language="en")
heard = [{"w": x.word, "t": x.start} for s in segs for x in (s.words or [])]

norm = lambda s: re.sub(r"[^a-z0-9']", "", s.lower())
said = [w for w in meta["words"] if norm(w["w"])]
heard = [w for w in heard if norm(w["w"])]
joins = [c["t"] for c in meta["cuts"]][1:]
near = lambda t: min(joins, key=lambda j: abs(j - t)) if joins else None
mmss = lambda x: f"{int(x // 60)}:{x % 60:05.2f}"

sm = difflib.SequenceMatcher(None, [norm(w["w"]) for w in said], [norm(w["w"]) for w in heard], autojunk=False)
problems = 0
for op, a1, a2, b1, b2 in sm.get_opcodes():
    if op == "equal": continue
    t = said[a1]["t"] if a1 < len(said) else heard[b1]["t"]
    j = near(t)
    at_join = j is not None and abs(j - t) < 0.6
    problems += at_join
    print(f"{'JOIN' if at_join else '    '} {mmss(t)} (join {mmss(j) if j is not None else '-'}): said "
          f"\"{' '.join(w['w'] for w in said[a1:a2])}\" heard \"{' '.join(w['w'] for w in heard[b1:b2])}\"")
print(f"{cut_id}: {problems} mismatches at joins, {len(joins)} joins")
