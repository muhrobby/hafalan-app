# 📥 Instalasi & Setup Guide

## 📋 Prerequisites

### System Requirements

- **PHP**: >= 8.2
- **Node.js**: >= 18.x
- **Composer**: >= 2.x
- **Database**: MySQL 8.0+ atau PostgreSQL 13+
- **Web Server**: Apache/Nginx
- **Memory**: Minimum 512MB RAM
- **Storage**: Minimum 1GB free space

### PHP Extensions Required

```bash
# Check installed extensions
php -m

# Required extensions:
- BCMath
- Ctype
- cURL
- DOM
- Fileinfo
- JSON
- Mbstring
- OpenSSL
- PDO
- PDO_MySQL (atau PDO_PGSQL)
- Tokenizer
- XML
- ZIP
```

---

## 🚀 Installation Steps

### 1. Clone Repository

```bash
# Via HTTPS
git clone https://github.com/your-org/hafalan-app.git

# Via SSH
git clone git@github.com:your-org/hafalan-app.git

# Navigate to project directory
cd hafalan-app
```

### 2. Install Backend Dependencies

```bash
# Install PHP dependencies via Composer
composer install

# For production, use:
composer install --optimize-autoloader --no-dev
```

### 3. Install Frontend Dependencies

```bash
# Install Node.js dependencies
npm install

# For production optimized build:
npm ci
```

### 4. Environment Configuration

```bash
# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate
```

#### Configure `.env` File

```env
# Application
APP_NAME="Hafalan App"
APP_ENV=local
APP_KEY=base64:xxxxx # Auto-generated
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=hafalan_app
DB_USERNAME=root
DB_PASSWORD=

# Mail (for password reset, notifications)
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="noreply@hafalan-app.com"
MAIL_FROM_NAME="${APP_NAME}"

# Session & Cache
SESSION_DRIVER=file
CACHE_DRIVER=file
QUEUE_CONNECTION=sync
```

### 5. Database Setup

```bash
# Create database (MySQL example)
mysql -u root -p
CREATE DATABASE hafalan_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

# Run migrations
php artisan migrate

# Seed initial data (roles, admin user, surahs)
php artisan db:seed

# Or migrate & seed in one command
php artisan migrate --seed
```

#### Default Seeded Data

After seeding, you'll have:

**Roles:**
- `admin` - Full system access
- `teacher` - Manage hafalan for assigned students
- `guardian` / `wali` - View children's progress
- `student` - View own progress

**Default Admin User:**
- Email: `admin@example.com`
- Password: `Password!123`
- Role: Admin

**Sample Users:**
- Teacher: `ustadz.ahmad@example.com` / `Password!123`
- Guardian: `wali.robby@example.com` / `Password!123`
- Student: `robby@example.com` / `Password!123`

**Al-Quran Surahs:**
- All 114 surahs with correct ayah counts

### 6. Storage Link

```bash
# Create symbolic link for public storage
php artisan storage:link
```

### 7. Build Frontend Assets

```bash
# Development mode (with hot reload)
npm run dev

# Production build (optimized)
npm run build
```

### 8. File Permissions

```bash
# Set proper permissions for Laravel directories
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache

# For development with local user:
sudo chown -R $USER:www-data storage bootstrap/cache
```

### 9. Start Development Server

```bash
# Start Laravel development server
php artisan serve

# In another terminal, start Vite dev server
npm run dev
```

Visit: `http://localhost:8000`

---

## 🔧 Additional Configuration

### Configure Queue Worker (Optional)

For background jobs (email notifications, imports):

```bash
# .env
QUEUE_CONNECTION=database

# Create jobs table
php artisan queue:table
php artisan migrate

# Start queue worker
php artisan queue:work

# For production, use supervisor
```

### Configure Mail Server

**Using Mailtrap (Development):**

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your-username
MAIL_PASSWORD=your-password
```

**Using Gmail (Production):**

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
```

### Configure Cache (Production)

```env
CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
```

Install Redis:
```bash
# Ubuntu/Debian
sudo apt install redis-server

# Install PHP Redis extension
sudo pecl install redis
sudo echo "extension=redis.so" >> /etc/php/8.2/cli/php.ini
```

---

## 🧪 Testing Installation

### 1. Run Health Check

```bash
# Check application status
curl http://localhost:8000/up

# Should return: "200 OK"
```

### 2. Login Test

1. Navigate to `http://localhost:8000/login`
2. Login with admin credentials:
   - Email: `admin@example.com`
   - Password: `Password!123`
3. You should be redirected to dashboard

### 3. Test Database Connection

```bash
php artisan tinker
> \DB::connection()->getPdo();
# Should show PDO object without errors
```

### 4. Run Tests (Optional)

```bash
# Run all tests
php artisan test

# Run specific test suite
php artisan test --testsuite=Feature
```

---

## 🐳 Docker Installation (Alternative)

### Using Laravel Sail

```bash
# Install Sail
composer require laravel/sail --dev

# Publish Sail configuration
php artisan sail:install

# Start Docker containers
./vendor/bin/sail up -d

# Run migrations
./vendor/bin/sail artisan migrate --seed

# Access application
http://localhost
```

### Custom Docker Setup

```dockerfile
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "8000:8000"
    volumes:
      - .:/var/www/html
    environment:
      - DB_HOST=db
  db:
    image: mysql:8.0
    environment:
      MYSQL_DATABASE: hafalan_app
      MYSQL_ROOT_PASSWORD: secret
    ports:
      - "3306:3306"
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
```

---

## 🔒 Post-Installation Security

### 1. Change Default Passwords

```bash
# Login as admin and change password immediately
# Go to: Settings > Password > Change Password
```

### 2. Set APP_DEBUG to false (Production)

```env
APP_DEBUG=false
APP_ENV=production
```

### 3. Configure HTTPS

```bash
# Force HTTPS in production
# AppServiceProvider.php
if ($this->app->environment('production')) {
    \URL::forceScheme('https');
}
```

### 4. Set Up Backups

```bash
# Install backup package
composer require spatie/laravel-backup

# Configure backup
php artisan vendor:publish --provider="Spatie\Backup\BackupServiceProvider"

# Run backup
php artisan backup:run
```

---

## 🐛 Common Installation Issues

### Issue: "Class not found"
```bash
# Solution: Regenerate autoload files
composer dump-autoload
```

### Issue: "Permission denied" on storage
```bash
# Solution: Fix permissions
sudo chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache
```

### Issue: "NPM build fails"
```bash
# Solution: Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Issue: "Database connection refused"
```bash
# Solution: Check MySQL service
sudo systemctl status mysql
sudo systemctl start mysql

# Verify credentials in .env
php artisan config:clear
```

### Issue: "Vite manifest not found"
```bash
# Solution: Build assets
npm run build
php artisan optimize:clear
```

---

## ✅ Installation Checklist

- [ ] PHP 8.2+ installed
- [ ] Composer installed
- [ ] Node.js 18+ installed
- [ ] Database created
- [ ] `.env` configured
- [ ] Dependencies installed (`composer install`, `npm install`)
- [ ] Application key generated
- [ ] Database migrated and seeded
- [ ] Storage linked
- [ ] Assets built
- [ ] File permissions set
- [ ] Application accessible
- [ ] Admin login working
- [ ] Default password changed

---

## 📞 Need Help?

If you encounter issues during installation:

1. Check [Troubleshooting Guide](./TROUBLESHOOTING.md)
2. Review Laravel logs: `storage/logs/laravel.log`
3. Enable debug mode: `APP_DEBUG=true` in `.env`
4. Contact support team

---

## 🔄 Updating Existing Installation

```bash
# Pull latest changes
git pull origin main

# Update dependencies
composer install
npm install

# Run new migrations
php artisan migrate

# Rebuild assets
npm run build

# Clear caches
php artisan optimize:clear
```

---

**Next:** [Arsitektur Sistem](./ARCHITECTURE.md)
