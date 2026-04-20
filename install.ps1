# StudyForge Setup Script (Windows)
# This script is fully automatic. It clones the repo, gets Node running, installs Ollama silently, spins it up, and yanks Gemma 4 down.

Write-Host "🚀 Bootstrapping StudyForge for Windows..." -ForegroundColor Cyan
Write-Host ""

# 0. Check for Git and Clone
if (!(Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "❌ ERROR: Git is not installed. Please install Git from https://git-scm.com/" -ForegroundColor Red
    Exit 1
}

if (-not (Test-Path "package.json")) {
    $repoUrl = "https://github.com/airiharuki/latexfilegen.git"
    $targetDir = "latexfilegen"
    
    Write-Host "📦 Cloning repository from $repoUrl..." -ForegroundColor Cyan
    git clone $repoUrl $targetDir
    
    Write-Host "📂 Switching to $targetDir directory..." -ForegroundColor Cyan
    Set-Location $targetDir
} else {
    Write-Host "✅ Repository files found locally." -ForegroundColor Green
}

# 1. Check for Node.js
if (Get-Command npm -ErrorAction SilentlyContinue) {
    Write-Host "✅ Node.js found." -ForegroundColor Green
} else {
    Write-Host "❌ ERROR: Node.js and npm are not installed." -ForegroundColor Red
    Write-Host "Please install Node.js (v18+) from https://nodejs.org/" -ForegroundColor Yellow
    Exit 1
}

# 2. Check for Ollama
if (Get-Command ollama -ErrorAction SilentlyContinue) {
    Write-Host "✅ Ollama is installed." -ForegroundColor Green
} else {
    Write-Host "🛠️ Ollama not found. Auto-installing silently via Winget..." -ForegroundColor Yellow
    winget install Ollama.Ollama --accept-package-agreements --accept-source-agreements --silent
    
    # Refresh Path locally just in case 
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
}

# 3. Start daemon & Pull Gemma 4
if (Get-Command ollama -ErrorAction SilentlyContinue) {
    Write-Host "⚙️ Starting Ollama daemon in the background..." -ForegroundColor Magenta
    Start-Process ollama -ArgumentList "serve" -WindowStyle Hidden -ErrorAction SilentlyContinue

    Start-Sleep -Seconds 3

    Write-Host "🧠 Auto-installing Gemma 4 weights via Ollama..." -ForegroundColor Cyan
    Write-Host "(Go grab a coffee ☕ This might take a few minutes...)" -ForegroundColor DarkGray
    ollama pull gemma4
}

# 4. Install Node dependencies
Write-Host ""
Write-Host "📦 Installing StudyForge dependencies..." -ForegroundColor Cyan
npm install

Write-Host ""
Write-Host "✨ Setup complete!" -ForegroundColor Magenta
Write-Host "--------------------------------------------------------"
Write-Host "To start StudyForge, simply run:"
Write-Host "  npm run dev" -ForegroundColor Yellow
Write-Host "--------------------------------------------------------"
