# File: Dockerfile

# --- STAGE 1: Build Dependencies (Builder Stage) ---
FROM composer:2.7 as builder
WORKDIR /app
COPY composer.json composer.lock ./
# PERUBAHAN DI SINI: Ditambahkan --ignore-platform-reqs
RUN composer install --no-dev --prefer-dist --optimize-autoloader --ignore-platform-reqs --no-scripts

# --- STAGE 2: Node Build (Vite/React Assets) ---
FROM node:20-alpine as node_builder
WORKDIR /app
COPY --from=builder /app /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build


# --- STAGE 3: Final PHP-FPM Image (Production) ---
FROM php:8.2-fpm-alpine

# Install essential extensions for Laravel
# (Ini sudah benar, ext-gd dan pdo_pgsql diinstal di sini)
RUN apk add --no-cache \
    nginx-light \
    libzip-dev \
    libpng-dev \
    libjpeg-turbo-dev \
    postgresql-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) gd pdo_pgsql bcmath dom zip pcntl

# Install Laravel's common CLI tools (optional but helpful)
RUN wget https://raw.githubusercontent.com/laravel/installer/master/artisan -O /usr/local/bin/artisan \
    && chmod +x /usr/local/bin/artisan

# Set working directory for the application
WORKDIR /var/www/html

# Copy application code and optimized dependencies from the builder stage
COPY --from=builder /app /var/www/html

# Copy built frontend assets from the node_builder stage
COPY --from=node_builder /app/public/build /var/www/html/public/build
COPY --from=node_builder /app/resources /var/www/html/resources

# Copy the rest of the application files (e.g., controllers, views, routes)
COPY . /var/www/html

# Adjust permissions for storage and cache directories (important for runtime)
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache \
    && find /var/www/html -type f -exec chmod 664 {} \; \
    && find /var/www/html -type d -exec chmod 775 {} \;

# Expose PHP-FPM default port
EXPOSE 9000

# Start PHP-FPM
CMD ["php-fpm"]