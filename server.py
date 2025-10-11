#!/usr/bin/env python3
"""
Simple HTTP Server for DaxxyOS Portfolio
Serves the portfolio website locally for development and testing.
"""
import http.server
import socketserver
import sys
import os

# Configuration
PORT = 8000
HOST = "127.0.0.1"

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Custom request handler with better error handling"""
    
    def end_headers(self):
        # Add CORS headers for local development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()
    
    def log_message(self, format, *args):
        """Custom log format"""
        sys.stdout.write("%s - - [%s] %s\n" %
                         (self.address_string(),
                          self.log_date_time_string(),
                          format % args))

def main():
    """Start the HTTP server"""
    # Change to the directory where the script is located
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # Parse command line arguments
    port = PORT
    host = HOST
    
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            print(f"Invalid port number: {sys.argv[1]}")
            print("Usage: python server.py [port]")
            sys.exit(1)
    
    # Create and configure the server
    with socketserver.TCPServer((host, port), MyHTTPRequestHandler) as httpd:
        print("=" * 60)
        print("  DaxxyOS Portfolio - Local Development Server")
        print("=" * 60)
        print(f"\n  Server running at: http://{host}:{port}/")
        print(f"  Press Ctrl+C to stop the server\n")
        print("=" * 60)
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\nServer stopped by user.")
            sys.exit(0)

if __name__ == "__main__":
    main()
