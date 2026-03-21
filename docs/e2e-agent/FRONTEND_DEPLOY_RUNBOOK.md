# Frontend Deploy Runbook (e2e.egsmyapps.biz.id)

## 1) One-time Nginx setup

Set `root` to the atomic symlink path:

```nginx
server {
    listen 80;
    server_name e2e.egsmyapps.biz.id;

    root /var/www/e2e-frontend/current;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /health {
        proxy_pass http://127.0.0.1:8000/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

Then:

```bash
nginx -t && systemctl reload nginx
certbot --nginx -d e2e.egsmyapps.biz.id
```

## 2) Each deploy

From frontend repo:

```bash
npm ci
npm run build
```

Copy build artifact to server (example):

```bash
rsync -avz dist/ root@<vps-ip>:/root/dist-e2e/
```

On VPS:

```bash
cd /root/.openclaw/workspace/e2e-agent-kit
FRONTEND_DIST=/root/dist-e2e npm run deploy:frontend
```

(Equivalent direct call)

```bash
bash deploy/frontend-deploy.sh /root/dist-e2e
```

## 3) Validate

```bash
curl -I https://e2e.egsmyapps.biz.id
curl -I https://e2e.egsmyapps.biz.id/health
curl -I https://e2e.egsmyapps.biz.id/api/items/
```

## 4) Rollback

```bash
cd /var/www/e2e-frontend/releases
ls -1dt */
ln -sfn /var/www/e2e-frontend/releases/<previous-release>/ /var/www/e2e-frontend/current
```
