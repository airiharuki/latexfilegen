# StudyForge Setup Script (Windows)
# This script is fully automatic. It clones the repo, asks for MiKTeX, gets Node running, installs Ollama silently, spins it up, and yanks Gemma 4 down.

Write-Host "🚀 Bootstrapping StudyForge for Windows..." -ForegroundColor Cyan
Write-Host ""

# 0. Ask for LaTeX Engine
Write-Host "📄 Select your preferred LaTeX engine for local, offline PDF generation:" -ForegroundColor Cyan
Write-Host "1. MiKTeX (Recommended for Windows - Installs packages on-the-fly)"
Write-Host "2. TeX Live (Massive complete ecosystem - ~5GB download)"
Write-Host "3. Skip (Use cloud compiler fallback - NOT RECOMMENDED for offline privacy setups)"
$texChoice = Read-Host "Choose [1/2/3]"

if ($texChoice -eq '1') {
    Write-Host "📦 Auto-installing MiKTeX silently via Winget..." -ForegroundColor Yellow
    winget install MiKTeX.MiKTeX --accept-package-agreements --accept-source-agreements --silent
} elseif ($texChoice -eq '2') {
    Write-Host "📦 Auto-installing TeX Live silently via Winget..." -ForegroundColor Yellow
    winget install GNU.TeXLive --accept-package-agreements --accept-source-agreements --silent
} else {
    Write-Host "⏭️ Skipping LaTeX installation. (The app will use the cloud compiler fallback automatically)" -ForegroundColor DarkGray
}
Write-Host ""

# 1. Check for Git and Clone
if (!(Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "🛠️ Git is not installed. Auto-installing silently via Winget..." -ForegroundColor Yellow
    winget install Git.Git --accept-package-agreements --accept-source-agreements --silent
    
    Write-Host "🔄 Refreshing environment variables to add Git to PATH..." -ForegroundColor Cyan
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    
    if (!(Get-Command git -ErrorAction SilentlyContinue)) {
        Write-Host "❌ ERROR: Git installation failed or PATH couldn't be resolved. Please install manually from https://git-scm.com/" -ForegroundColor Red
        Exit 1
    }
    Write-Host "✅ Git installed and PATH updated successfully!" -ForegroundColor Green
} else {
    Write-Host "✅ Git is already installed." -ForegroundColor Green
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
