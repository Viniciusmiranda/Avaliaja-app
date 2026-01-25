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

            js_script = """
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const target = '63257567-c3ee-4fad-9eb1-e92f16803f63';
    console.log('DIAGNOSTIC_START');
    console.log(`Checking PROD for: ${target}`);
    const companies = await prisma.company.findMany({ select: { id: true, name: true, slug: true, id_url: true, users: true } });
    const match = companies.find(c => c.id === target || c.slug === target || c.id_url === target);
    if (!match) {
        console.log("NOT FOUND in PROD.");
    } else {
        console.log(`FOUND: Name=${match.name}`);
        console.log(`Values: ID=${match.id} | Slug=${match.slug} | ID_URL=${match.id_url}`);
        console.log(`User Count: ${match.users.length}`);
        if(match.users.length === 0) console.log("WARNING: NO USERS!");
        else console.log("Users exist.");
    }
    console.log('DIAGNOSTIC_END');
}
main().catch(console.error).finally(() => prisma.$disconnect());
"""
            print("Injecting script into Docker...")
            # Use docker exec to write file
            # We need to escape the script for shell properly or use a simpler write method
            # Writing to a temp file on host first might be cleaner, but let's try direct pipe
            # Be careful with quotes in js_script when wrapping in bash
            
            # Simple approach: write logic to a one-liner or use cat with heredoc inside the docker exec
            
            docker_cmd = f"docker exec -i app-backend sh -c 'cat > /app/diagnose_remote.js'"
            os.write(fd, docker_cmd.encode() + b"\n")
            # Send the script content
            os.write(fd, js_script.encode())
            # Close the file with Ctrl+D behavior? No, we need EOF marker if using cat
            # Wait, cat > file reads from stdin.
            # I need to close stdin of the docker exec command.
            # In pty, I can't easily close stdin without closing fd.
            # Better: use heredoc in the command itself if possible, but js_script has newlines.
            
            # Alternative: echo line by line or use base64?
            # Let's use the previous cat << 'EOF' approach but wrap it in docker exec?
            # "docker exec app-backend sh -c \"cat << 'EOF' > /app/diagnose.js ...\"" will be hard to quote.
            
            # BEST WAY: Write to host, then docker cp
            
            print("Writing to host...")
            cmd = f"cat << 'EOS' > diagnose_host.js\n{js_script}\nEOS\n"
            os.write(fd, cmd.encode())
            time.sleep(1)
            
            print("Copying to container...")
            os.write(fd, b"docker cp diagnose_host.js app-backend:/app/diagnose_remote.js\n")
            time.sleep(1)
            
            print("Running in container...")
            os.write(fd, b"docker exec app-backend node /app/diagnose_remote.js > /home/vinicius/diag_output.txt 2>&1\n")
            time.sleep(5)
            
            print("Reading output...")
            os.write(fd, b"cat /home/vinicius/diag_output.txt\n")
            
            # Cleanup
            os.write(fd, b"rm diagnose_host.js\n")
            os.write(fd, b"docker exec app-backend rm /app/diagnose_remote.js\n")
            
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
