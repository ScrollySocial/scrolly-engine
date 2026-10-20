"""Build one or more Reel templates.  Usage: python build/make.py 01 02 ...   (from automation/reel-template-pack)
Templates with a STAGE colour are the fully editable builds (build/editable.py); the rest use engine.build."""
import importlib, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import engine

for num in sys.argv[1:] or ['01']:
    t = importlib.import_module(f'templates.t{num}')
    if hasattr(t, 'STAGE'):
        import editable
        editable.build(t.SPEC, t.reel, t.STAGE)
    else:
        engine.build(t.SPEC, t.layers)
