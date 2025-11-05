# --- STAGE 1: Composer deps
FROM composer:2.7 AS builder
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --prefer-dist --optimize-autoloader --ignore-platform-reqs --no-scripts
COPY . .
# Cache laravel
RUN php artisan config:cache && php artisan route:cache && php artisan view:cache

# --- STAGE 2: Node build (Vite)
FROM node:20-alpine AS assets
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY resources/ resources/
COPY vite.config.* ./
# kalau ada tailwind/postcss config, COPY juga
RUN npm run build

# --- STAGE 3: Final PHP-FPM
FROM php:8.2-fpm-alpine

# Ekstensi minimal + opcache
RUN apk add --no-cache \
    libzip-dev libpng-dev libjpeg-turbo-dev postgresql-dev icu-dev freetype-dev libxml2-dev \
 && docker-php-ext-configure gd --with-freetype --with-jpeg \
 && docker-php-ext-install -j$(nproc) gd pdo_pgsql bcmath dom zip pcntl intl opcache

# Non-root user
RUN addgroup -S laravel && adduser -S -G laravel laravel
USER laravel

WORKDIR /var/www/html

# Salin app & vendor dari builder (saja)
COPY --chown=laravel:laravel --from=builder /app /var/www/html
# Salin hasil build Vite
COPY --chown=laravel:laravel --from=assets /app/public/build /var/www/html/public/build

# Permission storage/cache
USER root
RUN chown -R laravel:laravel /var/www/html \
 && chmod -R 775 storage bootstrap/cache
USER laravel

ENV APP_ENV=production APP_DEBUG=false

EXPOSE 9000
CMD ["php-fpm"]
