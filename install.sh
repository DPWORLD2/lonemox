#!/bin/bash

set -e  # Exit on error
LOGFILE="/var/log/lonemox-install.log"
exec > >(tee -a $LOGFILE) 2>&1  # Log everything

echo "🚀 Starting Lonemox VE installation..."

# Update system packages
sudo apt update && sudo apt upgrade -y

# Install dependencies
echo "📦 Installing required dependencies..."
sudo apt install -y curl git docker.io docker-compose nodejs npm nginx \
  postgresql postgresql-contrib python3-pip tmux ufw

# Enable and start PostgreSQL
echo "🛠 Setting up PostgreSQL..."
sudo systemctl enable postgresql
sudo systemctl start postgresql

# Configure PostgreSQL Database
echo "📊 Creating Lonemox database and user..."
sudo -u postgres psql <<EOF
CREATE DATABASE lonemox;
CREATE USER lonemox_user WITH ENCRYPTED PASSWORD 'securepassword';
GRANT ALL PRIVILEGES ON DATABASE lonemox TO lonemox_user;
EOF

# Enable Docker and Nginx
echo "⚙️ Enabling Docker and Nginx services..."
sudo systemctl enable docker
sudo systemctl start docker
sudo systemctl enable nginx
sudo systemctl start nginx

# Set up firewall rules
echo "🛡 Configuring firewall..."
sudo ufw allow 22/tcp  # SSH
sudo ufw allow 80/tcp  # HTTP
sudo ufw allow 443/tcp # HTTPS
sudo ufw allow 5000/tcp # Backend API
sudo ufw allow 3000/tcp # Frontend
sudo ufw enable

# Clone Lonemox VE repository
echo "📂 Cloning Lonemox VE repository..."
git clone https://github.com/your-repo/lonemox-ve.git /opt/lonemox-ve
cd /opt/lonemox-ve

# Set up Backend
echo "🖥 Setting up backend..."
cd backend
npm install
cat <<EOF > .env
DATABASE_URL=postgresql://lonemox_user:securepassword@localhost/lonemox
PORT=5000
EOF

# Run backend as a systemd service
sudo tee /etc/systemd/system/lonemox-backend.service > /dev/null <<EOF
[Unit]
Description=Lonemox Backend
After=network.target postgresql.service

[Service]
WorkingDirectory=/opt/lonemox-ve/backend
ExecStart=/usr/bin/node server.js
Restart=always
User=root
Environment=DATABASE_URL=postgresql://lonemox_user:securepassword@localhost/lonemox
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=lonemox-backend

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable lonemox-backend
sudo systemctl start lonemox-backend

# Set up Frontend
echo "🎨 Setting up frontend..."
cd ../frontend
npm install
npm run build

# Serve frontend with Nginx (localhost instead of domain)
sudo tee /etc/nginx/sites-available/lonemox > /dev/null <<EOF
server {
    listen 80;
    server_name localhost;

    root /opt/lonemox-ve/frontend/build;
    index index.html;
    
    location / {
        try_files \$uri /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:5000/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/lonemox /etc/nginx/sites-enabled/
sudo systemctl restart nginx

# GPU Support (AMD & Intel)
echo "🎮 Configuring GPU support..."
sudo apt install -y mesa-utils vulkan-tools
if lspci | grep -i amd; then
  echo "🟠 Installing ROCm for AMD GPUs..."
  sudo apt install -y rocm-opencl-runtime
elif lspci | grep -i intel; then
  echo "🔵 Installing Intel GPU drivers..."
  sudo apt install -y intel-media-va-driver-non-free
fi

# Final steps
echo "✅ Installation complete!"
echo "🌐 Access Lonemox VE dashboard at http://localhost"
echo "📜 Logs are saved at $LOGFILE"

