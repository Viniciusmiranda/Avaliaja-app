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

def diagnose_prod():
    pid, fd = pty.fork()
    
    if pid == 0:
        os.execvp("ssh", ["ssh", "-o", "StrictHostKeyChecking=no", "vinicius@31.97.90.3"])
    else:
        try:
            read_until(fd, b"password:")
            os.write(fd, b"12f46g63H:)\n")
            read_until(fd, b"$")
            
            # Check the directory user is actually using
            dir_path = "/srv/app-avaliaja"
            
            print(f"Checking {dir_path}...")
            os.write(fd, f"cd {dir_path}\n".encode())
            os.write(fd, b"git status\n") 
            time.sleep(2)
            
            print("Checking schema content...")
            os.write(fd, b"grep 'id_url' backend/prisma/schema.prisma\n")
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
    diagnose_prod()
