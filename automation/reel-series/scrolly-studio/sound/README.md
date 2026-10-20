# The Scrolly Studio: opening sting

An original tune (ours) rendered from free orchestral samples. Series rules: vault
`products/content-engine/series-scrolly-studio.md`.

- `render_sting.py` holds the tune options (`TUNES`), the waltz backing and the 6-second timing. Run it with
  `../../../carousels/.venv/Scripts/python.exe -I render_sting.py`; it writes `out/sting-<id>.wav`.
- Samples: **VSCO 2 Community Edition** (github.com/sgossner/VSCO-2-CE), **CC0 public domain**, so commercial use is fine
  with no credit needed. Only the folders used here were downloaded (~113 MB) into `samples/`: harp, glock, violin/viola/cello
  pizzicato, violin/cello sustain, and a few percussion hits. Audio is git-ignored. If `samples/` is missing,
  re-download those folders from the repo (paths are in the `Inst(...)` calls).
- There's no celesta in VSCO 2 CE, so the glockenspiel carries the tune, doubled softly by harp.
- Once one tune is picked, the final mixed file (sting + curtain swish) goes to `OneDrive/Scrolly Media` as
  `scrolly-studio-opening.wav` and never changes.
