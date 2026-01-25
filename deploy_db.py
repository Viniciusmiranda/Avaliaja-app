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

def db_push():
    pid, fd = pty.fork()
    
    if pid == 0:
        os.execvp("ssh", ["ssh", "-o", "StrictHostKeyChecking=no", "vinicius@31.97.90.3"])
    else:
        try:
            read_until(fd, b"password:")
            os.write(fd, b"12f46g63H:)\n")
            read_until(fd, b"$")
            
            # Run prisma as root
            print("Running prisma db push as root...")
            # Note: need full path to npx or ensure it's in path. Assuming root has it if vinicius has it.
            # OR use --schema flag
            
            cmd = "echo '12f46g63H:)' | sudo -S bash -c 'cd /srv/www-avaliaja/backend && npm install && npx prisma db push'"
            os.write(fd, (cmd + "\n").encode())
            time.sleep(10)
            
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
    db_push()
