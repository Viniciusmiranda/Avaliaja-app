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

def force_db_push():
    pid, fd = pty.fork()
    
    if pid == 0:
        os.execvp("ssh", ["ssh", "-o", "StrictHostKeyChecking=no", "vinicius@31.97.90.3"])
    else:
        try:
            read_until(fd, b"password:")
            os.write(fd, b"12f46g63H:)\n")
            read_until(fd, b"$")
            
            os.write(fd, b"cd /srv/app-avaliaja/backend\n")
            
            # Ensure provider is postgresql (in case previous script failed or whatever)
            os.write(fd, b"sed -i 's/provider = \"sqlite\"/provider = \"postgresql\"/g' prisma/schema.prisma\n")
            
            # 1. Push DB FORCE
            print("Pushing DB changes (ACCEPT DATA LOSS)...")
            os.write(fd, b"npx -y prisma db push --accept-data-loss\n")
            time.sleep(10)
            
            # 2. Restart server
            print("Restarting server...")
            os.write(fd, b"echo '12f46g63H:)' | sudo -S pkill -f 'node server.js'\n")
            time.sleep(3)
            
            os.write(fd, b"nohup node server.js > server.log 2>&1 &\n")
            time.sleep(2)
            
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
    force_db_push()
