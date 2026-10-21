"""Redraw only the recipe cards (buyer folder + phone kit), without rebuilding or rendering a template.
Usage: python build/recipe_cards.py 01 02 h1 ...   (from automation/reel-template-pack; no ids = all 30)
make.py would wipe the buyer folder and drop the designed covers (capcut_cover.py), so use this for card fixes."""
import importlib, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import engine as E

ALL = [f'{i:02d}' for i in range(1, 26)] + ['h1', 'h2', 'h3', 'h5', 'h6']

for num in sys.argv[1:] or ALL:
    t = importlib.import_module(f'templates.t{num}')
    L = (t.reel().L if hasattr(t, 'STAGE') else t.layers()).L       # what engine.build gets as lay.L
    E.apply_centering(L)
    spec = t.SPEC; out = E.PACK / spec['dir']
    buyer = out / 'buyer-folder' / spec['folder']
    if not buyer.exists(): sys.exit(f'{num}: no buyer folder at {buyer}')
    card = buyer / 'Recipe card.png'
    E.recipe_card(card, spec, L)
    kit = out / 'phone-kit' / f'{spec["num"]}-recipe-card.png'
    if kit.parent.exists(): kit.write_bytes(card.read_bytes())
    print('card:', card.relative_to(E.PACK))
