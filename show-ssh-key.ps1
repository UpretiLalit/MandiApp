# Display SSH Public Key for Oracle Cloud VM

$ErrorActionPreference = "Stop"

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Your SSH Public Key" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path "$env:USERPROFILE\.ssh\id_rsa.pub")) {
    Write-Host "[ERROR] SSH key not found. Generating new key..." -ForegroundColor Red
    Write-Host ""
    
    New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.ssh" | Out-Null
    ssh-keygen -t rsa -b 4096 -f "$env:USERPROFILE\.ssh\id_rsa" -N '""'
    
    Write-Host ""
    Write-Host "[SUCCESS] SSH key generated!" -ForegroundColor Green
}

$publicKey = Get-Content "$env:USERPROFILE\.ssh\id_rsa.pub" -Raw

Write-Host "Copy this entire key:" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Green
Write-Host $publicKey -ForegroundColor White
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "How to add this key to Oracle Cloud VM:" -ForegroundColor Cyan
Write-Host ""
Write-Host "METHOD 1 - Oracle Cloud Console (Recommended):" -ForegroundColor Yellow
Write-Host "1. Go to Oracle Cloud Console > Compute > Instances" -ForegroundColor White
Write-Host "2. Click your VM (vyaparmandap-server)" -ForegroundColor White
Write-Host "3. Click 'Console Connection' button" -ForegroundColor White
Write-Host "4. Launch Cloud Shell Connection" -ForegroundColor White
Write-Host "5. In the console, run:" -ForegroundColor White
Write-Host "   mkdir -p ~/.ssh && nano ~/.ssh/authorized_keys" -ForegroundColor Cyan
Write-Host "6. Paste the key above, save (Ctrl+X, Y, Enter)" -ForegroundColor White
Write-Host "7. Run: chmod 600 ~/.ssh/authorized_keys" -ForegroundColor Cyan
Write-Host ""
Write-Host "METHOD 2 - If you can connect with password:" -ForegroundColor Yellow
Write-Host "   ssh-copy-id ubuntu@140.245.9.144" -ForegroundColor Cyan
Write-Host ""
Write-Host "After adding the key, run:" -ForegroundColor Green
Write-Host "   .\vm-setup-complete.ps1 -VMIP '140.245.9.144' -VMUser 'ubuntu'" -ForegroundColor Cyan
Write-Host ""
