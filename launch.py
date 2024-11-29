import http.server
import socketserver
import logging
import webbrowser
import os
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

class StableFluxHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.extensions_map.update({
            '.js': 'application/javascript',
            '.css': 'text/css',
            '.html': 'text/html',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.svg': 'image/svg+xml',
            '.json': 'application/json',
        })

    def log_message(self, format, *args):
        logging.info(f"{self.address_string()} - {format%args}")

    def end_headers(self):
        # Add CORS headers for local development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

def run_server(port=8000):
    # Get the directory containing the launch.py script
    current_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(current_dir)
    
    while True:
        try:
            with socketserver.TCPServer(("", port), StableFluxHandler) as httpd:
                server_url = f"http://localhost:{port}"
                logging.info(f"\n{'='*50}")
                logging.info(f"✨ Stable Flux Pro Server v3.0.0")
                logging.info(f"{'='*50}")
                logging.info(f"📂 Root Directory: {current_dir}")
                logging.info(f"🌐 Server URL: {server_url}")
                logging.info(f"⚡ Status: Running")
                logging.info(f"{'='*50}")
                
                # Open the browser
                webbrowser.open(server_url)
                logging.info("🚀 Opening browser...")
                logging.info("⌛ Press Ctrl+C to stop the server")
                
                httpd.serve_forever()
        except OSError as e:
            if e.errno == 98 or e.errno == 10048:  # Port already in use
                logging.warning(f"⚠️ Port {port} is busy, trying {port + 1}")
                port += 1
            else:
                raise
        except KeyboardInterrupt:
            logging.info("\n🛑 Server stopped by user")
            break

if __name__ == "__main__":
    run_server()
