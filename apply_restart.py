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

def apply_and_restart():
    pid, fd = pty.fork()
    
    if pid == 0:
        os.execvp("ssh", ["ssh", "-o", "StrictHostKeyChecking=no", "vinicius@31.97.90.3"])
    else:
        try:
            read_until(fd, b"password:")
            os.write(fd, b"12f46g63H:)\n")
            read_until(fd, b"$")
            
            # Go to correct dir
            os.write(fd, b"cd /srv/app-avaliaja/backend\n")
            
            # 1. Install deps to be safe
            print("Installing dependencies...")
            os.write(fd, b"npm install\n")
            time.sleep(20)
            
            # 2. Push DB
            print("Pushing DB changes...")
            os.write(fd, b"npx -y prisma db push\n")
            time.sleep(10)
            
            # 3. Kill old process (PID might have changed, using pkill)
            print("Restarting server...")
            os.write(fd, b"echo '12f46g63H:)' | sudo -S pkill -f 'node server.js'\n")
            time.sleep(3)
            
            # 4. Start new
            os.write(fd, b"nohup node server.js > server.log 2>&1 &\n")
            time.sleep(2)
            
            # 5. Verify
            os.write(fd, b"ps aux | grep node\n")
            
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
    apply_and_restart()
