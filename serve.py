#!/usr/bin/env python3
"""Static dev server that never lets the browser cache anything.

python3 -m http.server only sends Last-Modified, so browsers apply heuristic
caching to ES modules and CSS and can keep serving an old build after files
change, which mixes old JS with new HTML. no-store prevents that.
"""
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, fmt, *args):
        sys.stderr.write("%s %s\n" % (self.address_string(), fmt % args))


def main():
    root = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
    port = int(sys.argv[2]) if len(sys.argv) > 2 else 8080
    handler = partial(NoCacheHandler, directory=str(root))
    with ThreadingHTTPServer(("0.0.0.0", port), handler) as httpd:
        print(f"serving {root} on http://0.0.0.0:{port}/ (no-store)", flush=True)
        httpd.serve_forever()


if __name__ == "__main__":
    main()
