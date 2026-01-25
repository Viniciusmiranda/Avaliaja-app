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

def verify_prod():
    pid, fd = pty.fork()
    
    if pid == 0:
        os.execvp("ssh", ["ssh", "-o", "StrictHostKeyChecking=no", "vinicius@31.97.90.3"])
    else:
        try:
            read_until(fd, b"password:")
            os.write(fd, b"12f46g63H:)\n")
            read_until(fd, b"$")
            
            # 1. Run Seed Script (Assuming it was pushed via git)
            # Path should be /srv/www-avaliaja/backend/scripts/setup_id_url.js
            print("Running seed script...")
            os.write(fd, b"cd /srv/www-avaliaja/backend\n")
            os.write(fd, b"node scripts/setup_id_url.js\n")
            time.sleep(3)
            
            # 2. Check logs of my manual process (to see if it crashed)
            os.write(fd, b"cat server.log\n")
            time.sleep(2)
            
            # 3. Validating via curl against localhost (port 3000)
            # This hits whichever process is listening (Root or mine)
            print("Curling endpoint...")
            os.write(fd, b"curl -v http://localhost:3000/acesso-secreto-123\n")
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
    verify_prod()
