#!/usr/bin/env python3
import http.server
import socketserver
import os

PORT = 18401
DIR = "/Users/skynet/hermes/ing-2eso-repaso"

class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIR, **kwargs)
    
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

with socketserver.TCPServer(("", PORT), NoCacheHandler) as httpd:
    print(f"Serving on port {PORT} with no-cache headers")
    httpd.serve_forever()
