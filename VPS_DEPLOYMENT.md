# VPS Deployment Guide

## Issues Fixed

The application now automatically:
- ✅ Creates all required directories on startup
- ✅ Verifies write permissions
- ✅ Creates default config files if missing
- ✅ Provides detailed error logging

## Deployment Steps for VPS

### 1. Upload Your Code

```bash
# On your VPS, clone or upload your code
cd /home/youruser
git clone <your-repo> myapp
# OR upload files via FTP/SFTP
cd myapp
```

### 2. Install Dependencies

```bash
# Install Node.js (if not installed)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install dependencies
npm install
```

### 3. Set Environment Variables

```bash
# Create .env file
cat > .env << 'EOF'
NODE_ENV=production
PORT=5000
EOF
```

### 4. Build the Application

```bash
# Build the frontend
npm run build
```

### 5. Start the Application

#### Option A: Using PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start the app
pm2 start npm --name "myapp" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

#### Option B: Using systemd

Create a service file:

```bash
sudo nano /etc/systemd/system/myapp.service
```

Add this content:

```ini
[Unit]
Description=MyApp Node.js Application
After=network.target

[Service]
Type=simple
User=youruser
WorkingDirectory=/home/youruser/myapp
Environment=NODE_ENV=production
Environment=PORT=5000
ExecStart=/usr/bin/npm start
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Then enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable myapp
sudo systemctl start myapp
sudo systemctl status myapp
```

### 6. Setup Nginx Reverse Proxy (Optional but Recommended)

```bash
sudo apt install nginx

sudo nano /etc/nginx/sites-available/myapp
```

Add:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/myapp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Troubleshooting

### Check Logs

```bash
# If using PM2
pm2 logs myapp

# If using systemd
sudo journalctl -u myapp -f

# Check directory permissions
ls -la uploads/
ls -la config/
ls -la data/
```

### Fix Permission Issues

If you still have permission errors:

```bash
# Make sure your user owns the directories
sudo chown -R youruser:youruser /home/youruser/myapp

# Ensure proper permissions
chmod -R 755 uploads/
chmod -R 755 config/
chmod -R 755 data/
```

### Test Directory Write Access

```bash
# The app will test this automatically on startup
# Look for these messages in the logs:
# ✓ Directory ready: uploads/payment-screenshots
# ✓ Directory ready: uploads/qr-codes
# ✓ Directory ready: uploads/product-images
# ✓ Directory ready: config
# ✓ Directory ready: data
```

## What's Different from Replit

On Replit, these directories are automatically created and managed. On your VPS:

1. **The app now creates directories automatically** - No manual setup needed
2. **Better error messages** - You'll see exactly what's failing
3. **Permission checks** - The app verifies it can write to all directories on startup
4. **Default config creation** - If config files are missing, they're created automatically

## Common Errors and Solutions

### "EACCES: permission denied"
- **Cause**: The Node.js process doesn't have write permissions
- **Solution**: Run the "Fix Permission Issues" commands above

### "ENOENT: no such file or directory"
- **Cause**: Missing directories (should be auto-created now)
- **Solution**: The app creates them automatically on startup

### "Failed to add product"
- **Cause**: Usually file system permissions
- **Solution**: Check the detailed error logs (now includes full error messages)

## Viewing Detailed Logs

The app now logs:
- ✓ When product data is received
- ✓ When files are uploaded
- ✓ When products are saved
- ✓ Detailed error messages with stack traces

Check your logs to see exactly what's happening!
