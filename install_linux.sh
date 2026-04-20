#!/bin/bash

# StudyForge Setup Script (Linux)
# This script is fully automatic. It gets Node running, asks about TeX Live, starts Ollama in the background, and yanks Gemma 4 down.

echo "🚀 Bootstrapping StudyForge for Linux..."
echo ""

# 0. Prompt for TeX Live
read -p "📄 Do you want to install TeX Live for local, offline PDF generation? (WARNING: ~1.5GB download) [y/N]: " -n 1 -r < /dev/tty
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if ! command -v apt-get &> /dev/null; then
        echo "❌ apt-get not found. You will need to install texlive manually using your package manager."
    else
        echo "📦 Installing TeX Live packages..."
        sudo apt-get update && sudo apt-get install -y texlive-xetex texlive-latex-extra texlive-science texlive-fonts-recommended
    fi
else
    echo "⏭️ Skipping TeX Live. (Cloud compiler fallback will be used - NOT RECOMMENDED for offline privacy setups)"
fi
echo ""

# 1. Check for Git and Clone
if ! command -v git &> /dev/null; then
    echo "❌ ERROR: Git is not installed."
    echo "Please install Git first."
    exit 1
fi

if [ ! -f "package.json" ]; then
    REPO_URL="https://github.com/airiharuki/latexfilegen.git"
    TARGET_DIR="latexfilegen"
    
    echo "📦 Cloning repository from $REPO_URL..."
    git clone "$REPO_URL" "$TARGET_DIR"
    
    echo "📂 Switching to $TARGET_DIR directory..."
    cd "$TARGET_DIR" || exit 1
else
    echo "✅ Repository files found locally."
fi

# 2. Check for Node.js
if ! command -v npm &> /dev/null; then
    echo "❌ ERROR: Node.js and npm are not installed."
    echo "Please install Node.js (v18+) from https://nodejs.org/ first."
    exit 1
fi
echo "✅ Node.js found."

# 3. Check for Ollama
if ! command -v ollama &> /dev/null; then
    echo "🛠️ Ollama not found. Installing automatically..."
    curl -fsSL https://ollama.com/install.sh | sh
else
    echo "✅ Ollama is already installed."
fi

# 4. Start daemon & Pull Gemma 4
if command -v ollama &> /dev/null; then
    echo "⚙️ Starting Ollama daemon in the background..."
    
    # Try systemd first, fallback to basic spin
    sudo systemctl start ollama >/dev/null 2>&1 || ollama serve >/dev/null 2>&1 &

    # Give it a second to wake up
    sleep 3

    echo "🧠 Auto-installing Gemma 4 weights via Ollama..."
    echo "(Go grab a coffee ☕ This might take a few minutes...)"
    ollama pull gemma4
fi

# 5. Install Node dependencies
echo ""
echo "📦 Installing StudyForge dependencies..."
npm install

echo ""
echo "✨ Setup complete!"
echo "--------------------------------------------------------"
echo "To start StudyForge, simply run:"
echo "  npm run dev"
echo "--------------------------------------------------------"
