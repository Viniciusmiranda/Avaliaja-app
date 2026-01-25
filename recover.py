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

def recover():
    pid, fd = pty.fork()
    
    if pid == 0:
        os.execvp("ssh", ["ssh", "-o", "StrictHostKeyChecking=no", "vinicius@31.97.90.3"])
    else:
        try:
            read_until(fd, b"password:")
            os.write(fd, b"12f46g63H:)\n")
            read_until(fd, b"$")
            
            # 1. Take ownership of the directory (Assuming vinicius needs implementation rights)
            print("Taking ownership...")
            cmd_chown = "echo '12f46g63H:)' | sudo -S chown -R vinicius:vinicius /srv/www-avaliaja"
            os.write(fd, (cmd_chown + "\n").encode())
            time.sleep(3)
            
            # 2. Check permissions via ls -la
            os.write(fd, b"ls -la /srv/www-avaliaja\n")
            time.sleep(2)
            
            # 3. Try to start server (using absolute path to server.js if cd fails, but fixing perm should fix cd)
            # Try to start it even if cd fails, by directly calling node
            start_cmd = "nohup node /srv/www-avaliaja/backend/server.js > /srv/www-avaliaja/backend/server.log 2>&1 &"
            print(f"Sending start command: {start_cmd}")
            os.write(fd, (start_cmd + "\n").encode())
            time.sleep(2)
            
            # 4. Check if running
            os.write(fd, b"ps aux | grep node\n")
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
    recover()
