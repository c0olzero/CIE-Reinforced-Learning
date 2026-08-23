"""Dev server for Workbench. Same as `python3 -m http.server`, except every
response gets Cache-Control: no-store.

Why this exists: SimpleHTTPRequestHandler sends no cache headers at all, only
Last-Modified. With nothing else to go on, browsers apply heuristic freshness
(a fraction of how long ago the file last changed) and can serve an edited
file straight from disk cache without ever asking the server — for the page,
for dynamically-imported modules, and even for sw.js's own update checks.
That happens independently of the service worker's own network-first fetch
logic, since it only ever sees requests the SW is actively intercepting.
No-store on every response removes that whole layer, so a plain reload is
always enough while iterating.

Usage: python3 devserver.py [port]  (defaults to 8000, same as before)
"""
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class NoStoreHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    server = ThreadingHTTPServer(("", port), NoStoreHandler)
    print(f"Serving Workbench on http://localhost:{port}/ (Cache-Control: no-store on every response)")
    server.serve_forever()
