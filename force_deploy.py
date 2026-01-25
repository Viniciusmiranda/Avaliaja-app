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

def force_deploy():
    pid, fd = pty.fork()
    
    if pid == 0:
        os.execvp("ssh", ["ssh", "-o", "StrictHostKeyChecking=no", "vinicius@31.97.90.3"])
    else:
        try:
            read_until(fd, b"password:")
            os.write(fd, b"12f46g63H:)\n")
            read_until(fd, b"$")
            
            # 1. Kill PID 532219
            print("Killing process 532219...")
            kill_cmd = "echo '12f46g63H:)' | sudo -S kill -9 532219"
            os.write(fd, (kill_cmd + "\n").encode())
            time.sleep(2)
            
            # 2. Check if gone
            os.write(fd, b"ps aux | grep node\n")
            time.sleep(2)
            
            # 3. Start server
            print("Starting server...")
            # We assume permissions are fixed from previous step, but let's run npm install if we couldn't before
            # First cd to backend
            os.write(fd, b"cd /srv/www-avaliaja/backend\n")
            os.write(fd, b"npm install\n") # Ensure deps
            os.write(fd, b"npx -y prisma db push\n") # Ensure db
            
            start_cmd = "nohup node server.js > server.log 2>&1 &"
            os.write(fd, (start_cmd + "\n").encode())
            time.sleep(5)
            
            # 4. Verify
            os.write(fd, b"ps aux | grep node\n")
            time.sleep(1)
            # Check log
            os.write(fd, b"tail -n 20 server.log\n")
            time.sleep(1)
            
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
    force_deploy()
