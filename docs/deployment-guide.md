# راهنمای استقرار - پنل مدیریت سیمان بان

## نمای کلی

این راهنما شامل تمام مراحل استقرار سیستم مدیریت سیمان بان در محیط‌های مختلف است.

## محیط‌های استقرار

### 1. محیط توسعه (Development)

```bash
# کلون پروژه
git clone <repository-url>
cd siman-ban-dashboard

# نصب وابستگی‌ها
npm install

# تنظیم متغیرهای محیطی
cp .env.example .env.local

# راه‌اندازی Supabase محلی (اختیاری)
npx supabase start

# اجرای سرور توسعه
npm run dev
```

### 2. محیط تست (Staging)

```bash
# ساخت پروژه
npm run build

# تست build
npm start

# اجرای تست‌ها
npm run test
npm run test:ui
```

### 3. محیط تولید (Production)

## استقرار روی Vercel (توصیه شده)

### 1. تنظیمات اولیه

```bash
# نصب Vercel CLI
npm i -g vercel

# ورود به حساب Vercel
vercel login

# استقرار اولیه
vercel --prod
```

### 2. تنظیم متغیرهای محیطی در Vercel

در پنل Vercel، بخش Settings > Environment Variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Next.js Configuration
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-secret-key
```

### 3. تنظیمات vercel.json

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "functions": {
    "app/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

## استقرار روی سرور مجازی

### 1. تنظیمات سرور (Ubuntu/Debian)

```bash
# به‌روزرسانی سیستم
sudo apt update && sudo apt upgrade -y

# نصب Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# نصب PM2 برای مدیریت پروسه
sudo npm install -g pm2

# نصب Nginx
sudo apt install nginx -y
```

### 2. کلون و راه‌اندازی پروژه

```bash
# کلون پروژه
git clone <repository-url> /var/www/siman-ban
cd /var/www/siman-ban

# نصب وابستگی‌ها
npm ci --only=production

# ساخت پروژه
npm run build

# تنظیم متغیرهای محیطی
sudo nano .env.production
```

### 3. تنظیم PM2

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'siman-ban-dashboard',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/siman-ban',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/siman-ban-error.log',
    out_file: '/var/log/pm2/siman-ban-out.log',
    log_file: '/var/log/pm2/siman-ban.log',
    time: true
  }]
};
```

```bash
# راه‌اندازی با PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 4. تنظیم Nginx

```nginx
# /etc/nginx/sites-available/siman-ban
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # بهینه‌سازی برای فایل‌های استاتیک
    location /_next/static/ {
        alias /var/www/siman-ban/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # تنظیمات امنیتی
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
```

```bash
# فعال‌سازی سایت
sudo ln -s /etc/nginx/sites-available/siman-ban /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5. تنظیم SSL با Let's Encrypt

```bash
# نصب Certbot
sudo apt install certbot python3-certbot-nginx -y

# دریافت گواهی SSL
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# تست تجدید خودکار
sudo certbot renew --dry-run
```

## تنظیمات پایگاه داده

### 1. Supabase Production Setup

```sql
-- تنظیم Row Level Security
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE pre_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE pre_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- ایجاد policies
CREATE POLICY "Users can view own clients" ON clients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clients" ON clients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clients" ON clients
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own clients" ON clients
  FOR DELETE USING (auth.uid() = user_id);
```

### 2. Database Migrations

```bash
# اجرای migrations
npx supabase db push

# بازگردانی backup
npx supabase db dump --file backup.sql
```

## مانیتورینگ و لاگ‌گیری

### 1. تنظیم Logging

```javascript
// lib/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'siman-ban-dashboard' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

export default logger;
```

### 2. Health Check Endpoint

```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';

export async function GET() {
  try {
    // بررسی اتصال به پایگاه داده
    const { data, error } = await supabase
      .from('clients')
      .select('count')
      .limit(1);

    if (error) throw error;

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    }, { status: 500 });
  }
}
```

### 3. Performance Monitoring

```typescript
// lib/analytics.ts
export const trackPageView = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'GA_MEASUREMENT_ID', {
      page_path: url,
    });
  }
};

export const trackEvent = (action: string, category: string, label?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
    });
  }
};
```

## بکاپ و بازیابی

### 1. Database Backup

```bash
#!/bin/bash
# scripts/backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/siman-ban"
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sql"

# ایجاد دایرکتوری بکاپ
mkdir -p $BACKUP_DIR

# بکاپ پایگاه داده
npx supabase db dump --file $BACKUP_FILE

# فشرده‌سازی
gzip $BACKUP_FILE

# حذف بکاپ‌های قدیمی (بیش از 30 روز)
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_FILE.gz"
```

### 2. Application Backup

```bash
#!/bin/bash
# scripts/app-backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
APP_DIR="/var/www/siman-ban"
BACKUP_DIR="/var/backups/siman-ban-app"
BACKUP_FILE="$BACKUP_DIR/app_backup_$DATE.tar.gz"

mkdir -p $BACKUP_DIR

# بکاپ فایل‌های اپلیکیشن (بدون node_modules)
tar -czf $BACKUP_FILE \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='logs' \
  -C $APP_DIR .

echo "Application backup completed: $BACKUP_FILE"
```

### 3. Automated Backup with Cron

```bash
# crontab -e
# بکاپ روزانه در ساعت 2 شب
0 2 * * * /var/www/siman-ban/scripts/backup.sh

# بکاپ هفتگی اپلیکیشن
0 3 * * 0 /var/www/siman-ban/scripts/app-backup.sh
```

## امنیت

### 1. Firewall Configuration

```bash
# تنظیم UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 2. SSL/TLS Configuration

```nginx
# تنظیمات SSL در Nginx
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
```

### 3. Environment Security

```bash
# تنظیم دسترسی‌های فایل
chmod 600 .env.production
chown www-data:www-data .env.production

# محدود کردن دسترسی به لاگ‌ها
chmod 640 /var/log/pm2/*.log
chown www-data:adm /var/log/pm2/*.log
```

## بهینه‌سازی عملکرد

### 1. Next.js Optimizations

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['your-supabase-url.supabase.co'],
    formats: ['image/webp', 'image/avif'],
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  httpAgentOptions: {
    keepAlive: true,
  },
};

module.exports = nextConfig;
```

### 2. Caching Strategy

```nginx
# تنظیمات cache در Nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header Vary Accept-Encoding;
    access_log off;
}

location ~* \.(html|json)$ {
    expires 1h;
    add_header Cache-Control "public, must-revalidate";
}
```

## مشکل‌یابی

### 1. لاگ‌های مفید

```bash
# لاگ‌های PM2
pm2 logs siman-ban-dashboard

# لاگ‌های Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# لاگ‌های سیستم
sudo journalctl -u nginx -f
```

### 2. بررسی وضعیت سرویس‌ها

```bash
# وضعیت PM2
pm2 status

# وضعیت Nginx
sudo systemctl status nginx

# بررسی پورت‌ها
sudo netstat -tlnp | grep :3000
sudo netstat -tlnp | grep :80
```

### 3. تست عملکرد

```bash
# تست سرعت
curl -o /dev/null -s -w "%{time_total}\n" https://your-domain.com

# تست SSL
openssl s_client -connect your-domain.com:443 -servername your-domain.com
```

## چک‌لیست استقرار

### قبل از استقرار

- [ ] تست کامل در محیط staging
- [ ] بررسی تمام متغیرهای محیطی
- [ ] بکاپ از پایگاه داده فعلی
- [ ] تست عملکرد و بار
- [ ] بررسی امنیت و آسیب‌پذیری‌ها

### بعد از استقرار

- [ ] تست عملکرد سایت
- [ ] بررسی لاگ‌ها
- [ ] تست تمام قابلیت‌ها
- [ ] تنظیم مانیتورینگ
- [ ] اطلاع‌رسانی به تیم

### نگهداری مداوم

- [ ] بکاپ‌گیری منظم
- [ ] به‌روزرسانی امنیتی
- [ ] مانیتورینگ عملکرد
- [ ] بررسی لاگ‌ها
- [ ] تست دوره‌ای