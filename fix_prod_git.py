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

def fix_prod_git():
    pid, fd = pty.fork()
    
    if pid == 0:
        os.execvp("ssh", ["ssh", "-o", "StrictHostKeyChecking=no", "vinicius@31.97.90.3"])
    else:
        try:
            read_until(fd, b"password:")
            os.write(fd, b"12f46g63H:)\n")
            read_until(fd, b"$")
            
            dir_path = "/srv/app-avaliaja"
            os.write(fd, f"cd {dir_path}\n".encode())
            
            # 1. Check Info
            print("Checking remote and log...")
            os.write(fd, b"git remote -v\n")
            os.write(fd, b"git log -1\n")
            time.sleep(2)
            
            # 2. Fix Remote (Force it to correct one)
            print("Setting up correct remote and pulling...")
            os.write(fd, b"git remote set-url origin https://github.com/Viniciusmiranda/Feedback-Nacional24h.git\n")
            os.write(fd, b"git pull origin main\n")
            time.sleep(5)
            
            # 3. Check schema again
            print("Verifying schema...")
            os.write(fd, b"grep 'id_url' backend/prisma/schema.prisma\n")
            
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
    fix_prod_git()
