import pty
import os
import time
import sys

def read_until(fd, marker):
    buffer = b""
    while True:
        try:
            chunk = os.read(fd, 1024)
            if not chunk:
                break
            buffer += chunk
            sys.stdout.buffer.write(chunk)
            sys.stdout.flush()
            if marker in buffer:
                return buffer
        except OSError:
            break
    return buffer

def robust_start():
    pid, fd = pty.fork()
    
    if pid == 0:
        os.execvp("ssh", ["ssh", "-o", "StrictHostKeyChecking=no", "vinicius@31.97.90.3"])
    else:
        try:
            read_until(fd, b"password:")
            os.write(fd, b"12f46g63H:)\n")
            read_until(fd, b"$")
            
            # 1. Kill everything node related to ensure clean slate
            print("Killing node processes...")
            os.write(fd, b"echo '12f46g63H:)' | sudo -S killall node\n")
            time.sleep(2)
            
            # 2. Try to get into backend using wildcard
            print("Navigating to backend...")
            os.write(fd, b"cd /srv/www-avaliaja/back*\n")
            os.write(fd, b"pwd\n") # Verify where we are
            time.sleep(1)
            
            # 3. Setup
            os.write(fd, b"npm install\n") # This is crucial
            # Wait for install
            time.sleep(20)
            
            os.write(fd, b"npx -y prisma generate\n")
            time.sleep(10)

            os.write(fd, b"npx -y prisma db push\n")
            time.sleep(10)
            
            # 4. Start
            print("Starting server...")
            os.write(fd, b"nohup node server.js > server.log 2>&1 &\n")
            time.sleep(2)
            
            # 5. Verify
            os.write(fd, b"ps aux | grep node\n")
            os.write(fd, b"curl -v http://localhost:3000/health\n")
            
            os.write(fd, b"exit\n")
            
            while True:
                try:
                    chunk = os.read(fd, 1024)
                    if not chunk: break
                    sys.stdout.buffer.write(chunk)
                    sys.stdout.flush()
                except OSError:
                    break
        except Exception as e:
            print(f"Error: {e}")
        finally:
            os.close(fd)

if __name__ == "__main__":
    robust_start()
