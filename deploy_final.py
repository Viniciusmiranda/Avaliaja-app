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

def deploy():
    pid, fd = pty.fork()
    
    if pid == 0:
        os.execvp("ssh", ["ssh", "-o", "StrictHostKeyChecking=no", "vinicius@31.97.90.3"])
    else:
        try:
            read_until(fd, b"password:")
            os.write(fd, b"12f46g63H:)\n")
            read_until(fd, b"$")
            
            # Combine commands to ensure directory context
            cmds = [
                "cd /srv/www-avaliaja",
                "git pull",
                "cd backend && npm install",
                "cd /srv/www-avaliaja/backend && npx -y prisma db push",
                "echo '12f46g63H:)' | sudo -S pkill -f 'node server.js'", # Kill existing root process
                "sleep 3",
                "cd /srv/www-avaliaja/backend && nohup node server.js > server.log 2>&1 &", # Start new process
                "exit"
            ]
            
            for cmd in cmds:
                print(f"Sending: {cmd}")
                os.write(fd, (cmd + "\n").encode())
                time.sleep(5)
            
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
    deploy()
