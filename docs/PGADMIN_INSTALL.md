# Guia Completo: pgAdmin 4 na VPS com Domínio Próprio 🚀

Este guia cobre o processo de ponta a ponta para instalar o pgAdmin na sua VPS e acessá-lo profissionalmente via `https://db.seudominio.com`.

---

## Passo 1: Preparar o Ambiente (Docker)

O pgAdmin roda melhor e mais seguro dentro de um container Docker.

1. **Verifique se o Docker está instalado:**
   ```bash
   docker --version
   ```
   *Se não estiver, instale:* `apt update && apt install docker.io docker-compose -y`

2. **Crie o arquivo de configuração:**
   Na pasta do seu projeto (ou na raiz do usuário), crie um arquivo chamado `pgadmin-compose.yml`:

   ```yaml
   version: '3.8'
   services:
     pgadmin:
       image: dpage/pgadmin4
       container_name: pgadmin_avaliaja
       restart: always
       environment:
         PGADMIN_DEFAULT_EMAIL: "admin@seudominio.com"  # <--- SEU EMAIL
         PGADMIN_DEFAULT_PASSWORD: "MUDAR_ESSA_SENHA_123" # <--- SUA SENHA SEGURA
       ports:
         - "5050:80"
       volumes:
         - pgadmin-data:/var/lib/pgadmin

   volumes:
     pgadmin-data:
   ```

3. **Suba o serviço:**
   ```bash
   docker-compose -f pgadmin-compose.yml up -d
   ```
   *Agora o pgAdmin está rodando internamente na porta 5050.*

---

## Passo 2: Configurar o DNS (Seu Domínio)

Vá no painel onde você comprou seu domínio (Registro.br, Cloudflare, GoDaddy, Hostinger...):

1. Crie uma entrada **Tipo A**.
2. **Nome/Host:** `db` (para ficar `db.seudominio.com`) ou `pgadmin`.
3. **Valor/Destino:** O endereço IP da sua VPS.
4. Salve e aguarde alguns minutos.

---

## Passo 3: Configurar o Nginx (Proxy Reverso)

O Nginx vai receber quem acessa `db.seudominio.com` e enviar para o Docker na porta 5050.

1. **Crie o arquivo de configuração do site:**
   ```bash
   sudo nano /etc/nginx/sites-available/pgadmin
   ```

2. **Cole o conteúdo abaixo (Ajuste o `server_name`):**

   ```nginx
   server {
       server_name db.seudominio.com; # <--- COLOQUE SEU DOMÍNIO AQUI

       location / {
           proxy_pass http://127.0.0.1:5050;
           proxy_http_version 1.1;
           proxy_set_header X-Script-Name /;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. **Ative o site:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/pgadmin /etc/nginx/sites-enabled/
   ```

4. **Teste a configuração e reinicie:**
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

   *Neste ponto, você já consegue acessar `http://db.seudominio.com`.*

---

## Passo 4: Segurança (HTTPS / Cadeado Verde) 🔒

Não acesse seu banco sem HTTPS! Vamos usar o Certbot (Let's Encrypt) gratuito.

1. **Instale o Certbot (se não tiver):**
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   ```

2. **Gere o certificado:**
   ```bash
   sudo certbot --nginx -d db.seudominio.com
   ```

3. **Responda as perguntas:**
   - Digite seu email.
   - Aceite os termos (Y).
   - Escolha redirecionar para HTTPS (Opção 2, se perguntar).

---

## 🎉 Pronto!

1. Acesse `https://db.seudominio.com`.
2. Logue com o email e senha que você definiu no PASSO 1 (Docker).
3. **Conecte no Banco:**
   - Host: `host.docker.internal` (ou o IP interno do Docker, geralmente 172.17.0.1).
   - Porta: `5432`.
   - User/Pass: Do seu Postgres.
