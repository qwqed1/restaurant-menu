# PowerShell script to upload HALAL HALL to VPS
# Run this from your local machine

$VPS_IP = "194.32.142.53"
$VPS_USER = "ubuntu"
$VPS_PATH = "/home/halalhall/app"
$LOCAL_PATH = "C:\Users\Admin\Documents\Halal hail\restaurant-menu"

Write-Host "========================================" -ForegroundColor Green
Write-Host "  HALAL HALL - Upload to VPS" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Check if scp is available
if (!(Get-Command scp -ErrorAction SilentlyContinue)) {
    Write-Host "Error: scp not found. Please install OpenSSH Client." -ForegroundColor Red
    Write-Host "Go to: Settings > Apps > Optional Features > Add OpenSSH Client" -ForegroundColor Yellow
    exit 1
}

Write-Host "Uploading files to VPS..." -ForegroundColor Yellow
Write-Host "This may take a few minutes..." -ForegroundColor Yellow
Write-Host ""

# Create archive to speed up transfer
Write-Host "Step 1: Creating archive..." -ForegroundColor Cyan
$archivePath = "$env:TEMP\halal-hall.zip"

# Exclude unnecessary files
$exclude = @(
    "node_modules",
    ".git",
    "dist",
    "build",
    ".vscode",
    "*.log",
    ".env",
    ".env.local",
    ".env.development"
)

# Create zip archive
Compress-Archive -Path "$LOCAL_PATH\*" -DestinationPath $archivePath -Force -CompressionLevel Optimal

Write-Host "✓ Archive created: $archivePath" -ForegroundColor Green
Write-Host ""

# Upload archive to VPS
Write-Host "Step 2: Uploading to VPS..." -ForegroundColor Cyan
scp $archivePath "${VPS_USER}@${VPS_IP}:/tmp/halal-hall.zip"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Archive uploaded successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Upload failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 3: Extracting on VPS..." -ForegroundColor Cyan

# SSH commands to extract and setup
$sshCommands = @"
sudo mkdir -p $VPS_PATH
sudo apt install -y unzip
sudo unzip -o /tmp/halal-hall.zip -d $VPS_PATH
sudo chown -R halalhall:halalhall $VPS_PATH
sudo chmod +x $VPS_PATH/scripts/*.sh
sudo rm /tmp/halal-hall.zip
echo 'Files extracted and permissions set'
"@

ssh "${VPS_USER}@${VPS_IP}" $sshCommands

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Files extracted and configured" -ForegroundColor Green
} else {
    Write-Host "✗ Extraction failed" -ForegroundColor Red
    exit 1
}

# Cleanup local archive
Remove-Item $archivePath -Force

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Upload completed successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. SSH to server: ssh ubuntu@$VPS_IP" -ForegroundColor White
Write-Host "2. Switch user: sudo su - halalhall" -ForegroundColor White
Write-Host "3. Go to app: cd /home/halalhall/app" -ForegroundColor White
Write-Host "4. Configure: cp .env.production.example .env.production" -ForegroundColor White
Write-Host "5. Edit config: nano .env.production" -ForegroundColor White
Write-Host "6. Deploy: docker-compose -f docker-compose.prod.yml up -d" -ForegroundColor White
Write-Host ""
