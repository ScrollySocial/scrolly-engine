"""24 Make it last, approved 2026-10-19 (round 2, motion test build/motion_24.py). Five clips are real CapCut clip
layers: your product, care tip 1 (full frame, then on the smartwatch), care tip 2, the product after long use and the
end. The butter paper, calendar sheets, smartwatch, ring, burst, sparkles and DM Serif words are a flipbook from the
motion test (build/capcut_b2b.py). Editable Montserrat: in [a year], the two tips, every [Sunday], still going strong,
the keyword and the product name.
CapCut limits: the full-screen sheet tears are flipbook-only (the clip underneath cuts in)."""
import capcut_b2b as B
import motion_24 as M
import play as P

SPEC = dict(num='24', title='Make it last', subtitle='22 seconds. Five clips: your product, two care tips, after long use, the end.',
            font='montserrat', dir='24-make-it-last', folder='Template 24 - Make it last', project='Scrolly 24 Make it last', cover_at=1.0,
            slots=[('Your product', 'Your product, full frame'), ('Care tip 1', 'The first care step, close'), ('Care tip 2', 'The second care step'),
                   ('After long use', 'Your product, still like new'), ('The end', 'You or your product')],
            test_clips=[('IMG_1464', 0.5), ('IMG_1430', 0.5), ('IMG_1432', 0.0), ('IMG_1464', 2.0), ('IMG_1464', 1.0)])
WHITE, BUTTER, WINE = (255, 255, 255), M.BUTTER, M.WINE

def layers():
    b = B.Build(M.HOLDS, 14.0); g = M.setup()
    with B.flip_mode(M, g, {'prod': 'm', 'tip1': 'c', 'tip2': 'y', 'result': 'b', 'best': 'o'},
                     ('ayear', 'tip1', 'tip2', 'sunday', 'going', 'kw', 'name')):
        track = b.flip(lambda t: M.frame(g, t))
    full = (1080, 1920); ws = P.screen_size(M.WATCH, 560)
    b.clips(track, [('m', 0, 0, 1.8, full, 0, None), ('c', 1, 3.4, 5.4, full, 0, None), ('y', 2, 5.2, 7.2, full, 0, None),
                    ('c', 1, 7.2, 8.8, ws, 4, None), ('b', 3, 10.2, 11.8, full, 0, None), ('o', 4, 11.6, 14.0, full, 0, None)])
    b.say('in [a year]', 'in a year', 72, 2.25, 3.4, (560, 500), 0, WINE)
    b.say('[rinse after each use]', 'rinse after each use', 62, 3.6, 5.2, (540, 340), 4, WHITE)
    b.say('[store it upright]', 'store it upright', 62, 5.4, 7.0, (540, 340), 0, BUTTER)
    b.say('[every Sunday]', 'every Sunday', 64, 7.6, 8.6, (540, 1460), 0, WINE)
    b.say('[still going strong]', 'still going strong', 62, 10.4, 11.6, (540, 1380), 4, BUTTER)
    b.say('"[KEYWORD]"', '"LAST"', 64, 12.15, None, (540, 1200), 0, WHITE)
    b.say('[Product name]', 'The Steam Mop', 56, 12.35, None, (540, 1340), 4, WINE)
    return b.g
