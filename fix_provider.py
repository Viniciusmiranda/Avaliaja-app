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

def fix_provider():
    pid, fd = pty.fork()
    
    if pid == 0:
        os.execvp("ssh", ["ssh", "-o", "StrictHostKeyChecking=no", "vinicius@31.97.90.3"])
    else:
        try:
            read_until(fd, b"password:")
            os.write(fd, b"12f46g63H:)\n")
            read_until(fd, b"$")
            
            # Go to backend
            os.write(fd, b"cd /srv/app-avaliaja/backend\n")
            
            # 1. Modify schema to use postgresql
            print("Fixing provider to postgresql...")
            os.write(fd, b"sed -i 's/provider = \"sqlite\"/provider = \"postgresql\"/g' prisma/schema.prisma\n")
            time.sleep(1)
            
            # Verify change
            os.write(fd, b"head -n 10 prisma/schema.prisma\n")
            time.sleep(1)
            
            # 2. Push DB
            print("Pushing DB changes to Postgres...")
            os.write(fd, b"npx -y prisma db push\n")
            time.sleep(10)
            
            # 3. Restart server
            print("Restarting server...")
            os.write(fd, b"echo '12f46g63H:)' | sudo -S pkill -f 'node server.js'\n")
            time.sleep(3)
            
            os.write(fd, b"nohup node server.js > server.log 2>&1 &\n")
            time.sleep(2)
            
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
    fix_provider()
