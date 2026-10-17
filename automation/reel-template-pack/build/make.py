"""Build one or more Reel templates.  Usage: python build/make.py 01 02 ...   (from automation/reel-template-pack)"""
import importlib, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import engine

for num in sys.argv[1:] or ['01']:
    t = importlib.import_module(f'templates.t{num}')
    engine.build(t.SPEC, t.layers)
