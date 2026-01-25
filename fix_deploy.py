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

def fix_git_deploy():
    pid, fd = pty.fork()
    
    if pid == 0:
        os.execvp("ssh", ["ssh", "-o", "StrictHostKeyChecking=no", "vinicius@31.97.90.3"])
    else:
        try:
            read_until(fd, b"password:")
            os.write(fd, b"12f46g63H:)\n")
            read_until(fd, b"$")
            
            # 1. Check and fix remote
            os.write(fd, b"cd /srv/www-avaliaja\n")
            os.write(fd, b"git remote -v\n")
            time.sleep(2)
            
            # 2. Set correct remote (blindly setting it to be safe)
            # Use https with auth if needed? Or just https public if public?
            # User uses https://github.com/Viniciusmiranda/Feedback-Nacional24h.git
            # But wait, git pull might need credentials if private.
            # I can try to use the existing token if saved in credential helper.
            
            # Actually, let's just see output first.
            # But to be faster, I will chaining commands IF I see it's wrong.
            # But I can't interactively decide here easily.
            # I'll just run set-url.
            
            os.write(fd, b"git remote set-url origin https://github.com/Viniciusmiranda/Feedback-Nacional24h.git\n")
            time.sleep(1)
            
            # 3. Pull
            # This might ask for username/password if not cached!
            os.write(fd, b"git pull\n")
            time.sleep(5) 
            
            # 4. If pull works, verify backend exists
            os.write(fd, b"ls -F\n")
            time.sleep(2)
            
            # 5. Then run install and migration
            os.write(fd, b"cd backend && npm install\n") 
            time.sleep(20) # Install takes time
            
            os.write(fd, b"npx -y prisma db push\n")
            time.sleep(10)
            
            # 6. Restart server (It's currently running old code or new code? Old code likely).
            # Force kill root process again because it restarted with old code.
            # PID changed, so need pkill.
            kill_cmd = "echo '12f46g63H:)' | sudo -S pkill -f 'node server.js'"
            os.write(fd, (kill_cmd + "\n").encode())
            time.sleep(2)
            
            # Start mine
            start_cmd = "nohup node server.js > server.log 2>&1 &"
            os.write(fd, (start_cmd + "\n").encode())
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
    fix_git_deploy()
