# Cloudflare Tunnel Setup Script for MandiApp
# Prerequisites: Cloudflare account and domain added to Cloudflare

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('install', 'login', 'create', 'start', 'status', 'stop', 'dns')]
    [string]$Action = 'status',
    
    [Parameter(Mandatory=$false)]
    [string]$Domain = 'mandiapp.in'
)

$ErrorActionPreference = 'Stop'

function Test-CloudflaredInstalled {
    try {
        $null = Get-Command cloudflared -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

function Install-Cloudflared {
    Write-Host '[INFO] Installing cloudflared...' -ForegroundColor Cyan
    
    $downloadUrl = 'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe'
    $installPath = "$env:LOCALAPPDATA\cloudflared"
    $exePath = "$installPath\cloudflared.exe"
    
    if (-not (Test-Path $installPath)) {
        New-Item -ItemType Directory -Path $installPath -Force | Out-Null
    }
    
    Write-Host '[INFO] Downloading cloudflared from GitHub...' -ForegroundColor Cyan
    try {
        Invoke-WebRequest -Uri $downloadUrl -OutFile $exePath -UseBasicParsing
    } catch {
        Write-Host "[ERROR] Failed to download: $_" -ForegroundColor Red
        exit 1
    }
    
    $currentPath = [Environment]::GetEnvironmentVariable('Path', 'User')
    if ($currentPath -notlike "*$installPath*") {
        Write-Host '[INFO] Adding cloudflared to user PATH...' -ForegroundColor Cyan
        try {
            [Environment]::SetEnvironmentVariable('Path', "$currentPath;$installPath", 'User')
            $env:Path = "$env:Path;$installPath"
        } catch {
            Write-Host '[WARN] Could not update PATH. Add manually:' -ForegroundColor Yellow
            Write-Host "[INFO] Path to add: $installPath" -ForegroundColor Cyan
        }
    }
    
    Write-Host "[SUCCESS] cloudflared installed: $exePath" -ForegroundColor Green
    
    # Try to get version, but Windows Defender might block it
    try {
        $version = & $exePath --version 2>&1
        Write-Host "[INFO] Version: $version" -ForegroundColor Cyan
    } catch {
        Write-Host "[WARN] Windows Defender may be blocking cloudflared.exe" -ForegroundColor Yellow
        Write-Host "[INFO] Add exclusion: Windows Security > Virus & threat protection > Exclusions" -ForegroundColor Cyan
        Write-Host "[INFO] Add folder exclusion: $installPath" -ForegroundColor Cyan
    }
    
    Write-Host '[WARN] Restart your terminal for PATH changes to take effect' -ForegroundColor Yellow
}

function Connect-Cloudflare {
    Write-Host '[INFO] Authenticating with Cloudflare...' -ForegroundColor Cyan
    Write-Host '[INFO] Browser window will open. Login and authorize cloudflared.' -ForegroundColor Cyan
    
    cloudflared tunnel login
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host '[SUCCESS] Authentication successful' -ForegroundColor Green
        Write-Host "[INFO] Credentials: $env:USERPROFILE\.cloudflared" -ForegroundColor Cyan
    } else {
        Write-Host '[ERROR] Authentication failed' -ForegroundColor Red
        exit 1
    }
}

function New-CloudflareTunnel {
    param([string]$tunnelName = 'mandiapp-tunnel')
    
    Write-Host "[INFO] Creating tunnel: $tunnelName" -ForegroundColor Cyan
    
    $existingTunnels = cloudflared tunnel list 2>&1 | Out-String
    if ($existingTunnels -match $tunnelName) {
        Write-Host "[WARN] Tunnel '$tunnelName' already exists" -ForegroundColor Yellow
        $response = Read-Host 'Delete and recreate? (y/N)'
        if ($response -eq 'y' -or $response -eq 'Y') {
            Write-Host '[INFO] Deleting existing tunnel...' -ForegroundColor Cyan
            cloudflared tunnel delete $tunnelName
        } else {
            Write-Host '[INFO] Using existing tunnel' -ForegroundColor Cyan
            cloudflared tunnel list | Select-String $tunnelName
            return
        }
    }
    
    cloudflared tunnel create $tunnelName
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host '[SUCCESS] Tunnel created' -ForegroundColor Green
        
        $tunnelInfo = cloudflared tunnel list | Select-String $tunnelName
        if ($tunnelInfo) {
            Write-Host "`n[INFO] Tunnel Information:" -ForegroundColor Cyan
            Write-Host $tunnelInfo
            
            if ($tunnelInfo -match '([a-f0-9-]{36})') {
                $tunnelId = $matches[1]
                $credsFile = "$env:USERPROFILE\.cloudflared\$tunnelId.json"
                Write-Host "`n[IMPORTANT] Update cloudflared-config.yml line 2:" -ForegroundColor Yellow
                Write-Host "credentials-file: $credsFile" -ForegroundColor White
            }
        }
        
        Write-Host "`n[NEXT STEPS]" -ForegroundColor Cyan
        Write-Host "1. Update cloudflared-config.yml with tunnel ID"
        Write-Host "2. Run: .\cloudflare-setup.ps1 -Action dns -Domain $Domain"
        Write-Host "3. Run: .\cloudflare-setup.ps1 -Action start"
    } else {
        Write-Host '[ERROR] Failed to create tunnel' -ForegroundColor Red
        exit 1
    }
}

function Set-DnsRecords {
    param(
        [string]$tunnelName = 'mandiapp-tunnel',
        [string]$domain
    )
    
    Write-Host '[INFO] Configuring DNS records...' -ForegroundColor Cyan
    
    $subdomains = @(
        "identity-api.$domain",
        "marketplace-api.$domain",
        "ordering-api.$domain",
        "logistics-hub.$domain"
    )
    
    foreach ($subdomain in $subdomains) {
        Write-Host "  -> $subdomain" -ForegroundColor White
        cloudflared tunnel route dns $tunnelName $subdomain
    }
    
    Write-Host '[SUCCESS] DNS records configured' -ForegroundColor Green
    Write-Host '[WARN] DNS propagation takes 2-5 minutes' -ForegroundColor Yellow
}

function Start-CloudflareTunnel {
    Write-Host '[INFO] Starting Cloudflare Tunnel...' -ForegroundColor Cyan
    Write-Host "`n[REQUIRED] Backend services must be running:" -ForegroundColor Cyan
    Write-Host '  Identity.API:    http://localhost:5003'
    Write-Host '  Marketplace.API: http://localhost:5001'
    Write-Host '  Ordering.API:    http://localhost:5002'
    Write-Host '  Logistics.Hub:   http://localhost:5004'
    Write-Host ''
    
    $configPath = Join-Path $PSScriptRoot 'cloudflared-config.yml'
    
    if (-not (Test-Path $configPath)) {
        Write-Host "[ERROR] Config not found: $configPath" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "[INFO] Using config: $configPath" -ForegroundColor Cyan
    Write-Host '[INFO] Press Ctrl+C to stop' -ForegroundColor Cyan
    Write-Host ''
    
    cloudflared tunnel --config $configPath run mandiapp-tunnel
}

function Get-TunnelStatus {
    Write-Host '[INFO] Tunnel status...' -ForegroundColor Cyan
    
    Write-Host "`n=== Installed Tunnels ===" -ForegroundColor Yellow
    cloudflared tunnel list
    
    Write-Host "`n=== DNS Routes ===" -ForegroundColor Yellow
    cloudflared tunnel route dns --list 2>&1
}

function Stop-CloudflareTunnel {
    Write-Host '[INFO] To stop tunnel: Press Ctrl+C in tunnel terminal' -ForegroundColor Cyan
    Write-Host '[INFO] To uninstall service: cloudflared service uninstall' -ForegroundColor Cyan
}

Write-Host "`n=== Cloudflare Tunnel Setup - MandiApp ===" -ForegroundColor Magenta
Write-Host ''

switch ($Action) {
    'install' {
        if (Test-CloudflaredInstalled) {
            Write-Host '[WARN] cloudflared already installed' -ForegroundColor Yellow
            Write-Host "[INFO] Version: $(cloudflared --version)" -ForegroundColor Cyan
        } else {
            Install-Cloudflared
        }
    }
    
    'login' {
        if (-not (Test-CloudflaredInstalled)) {
            Write-Host '[ERROR] cloudflared not installed. Run: .\cloudflare-setup.ps1 -Action install' -ForegroundColor Red
            exit 1
        }
        Connect-Cloudflare
    }
    
    'create' {
        if (-not (Test-CloudflaredInstalled)) {
            Write-Host '[ERROR] cloudflared not installed. Run: .\cloudflare-setup.ps1 -Action install' -ForegroundColor Red
            exit 1
        }
        New-CloudflareTunnel
    }
    
    'dns' {
        if (-not (Test-CloudflaredInstalled)) {
            Write-Host '[ERROR] cloudflared not installed. Run: .\cloudflare-setup.ps1 -Action install' -ForegroundColor Red
            exit 1
        }
        Set-DnsRecords -tunnelName 'mandiapp-tunnel' -domain $Domain
    }
    
    'start' {
        if (-not (Test-CloudflaredInstalled)) {
            Write-Host '[ERROR] cloudflared not installed. Run: .\cloudflare-setup.ps1 -Action install' -ForegroundColor Red
            exit 1
        }
        Start-CloudflareTunnel
    }
    
    'status' {
        if (-not (Test-CloudflaredInstalled)) {
            Write-Host '[ERROR] cloudflared not installed. Run: .\cloudflare-setup.ps1 -Action install' -ForegroundColor Red
            exit 1
        }
        Get-TunnelStatus
    }
    
    'stop' {
        Stop-CloudflareTunnel
    }
}

Write-Host ''
Write-Host '[INFO] Full guide: CLOUDFLARE_TUNNEL_GUIDE.md' -ForegroundColor Cyan
Write-Host ''
