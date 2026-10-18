"""Serves the template pack folder and saves review notes the page sends (POST /notes -> halloween/notes.json),
so Mercedes's notes reach Claude without copy and paste.  Usage: python build/review_server.py [port]
"""
import http.server, json, sys, urllib.parse
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
NOTES = ROOT / 'halloween' / 'notes.json'

class H(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k): super().__init__(*a, directory=str(ROOT), **k)
    def do_POST(self):
        path, _, query = self.path.partition('?')
        if path != '/notes': self.send_error(404); return
        dest = NOTES                                    # ?to=fall/wireframes/notes.json saves another page's notes
        to = urllib.parse.parse_qs(query).get('to', [''])[0]
        if to:
            dest = (ROOT / to).resolve()
            if ROOT.resolve() not in dest.parents or dest.suffix != '.json': self.send_error(400); return
        body = self.rfile.read(int(self.headers.get('Content-Length', 0)))
        dest.write_text(json.dumps(json.loads(body), indent=2, ensure_ascii=False), encoding='utf-8')
        self.send_response(204); self.end_headers()

http.server.ThreadingHTTPServer(('localhost', int(sys.argv[1]) if len(sys.argv) > 1 else 8950), H).serve_forever()
