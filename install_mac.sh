#!/bin/bash

# StudyForge Setup Script (macOS)
# This script is fully automatic. It gets Node running, asks about MacTeX, starts Ollama in the background, and yanks Gemma 4 down.

echo "🚀 Bootstrapping StudyForge for macOS..."
echo ""

# 0. Prompt for LaTeX Engine
echo "📄 Select your preferred LaTeX engine for local, offline PDF generation:"
echo "1. MacTeX (TeX Live native port for macOS - WARNING: ~4GB download)"
echo "2. MiKTeX (Lighter alternative, installs packages on-the-fly)"
echo "3. Skip (Use cloud compiler fallback - NOT RECOMMENDED for offline privacy setups)"
read -p "Choose [1/2/3]: " tex_choice
echo ""

if [ "$tex_choice" == "1" ]; then
    if ! command -v brew &> /dev/null; then
        echo "❌ Homebrew required but missing. Skipping MacTeX install. Install it later from https://brew.sh/"
    else
        echo "📦 Installing MacTeX in the background..."
        brew install --cask mactex-no-gui
    fi
elif [ "$tex_choice" == "2" ]; then
    if ! command -v brew &> /dev/null; then
        echo "❌ Homebrew required but missing. Skipping MiKTeX install."
    else
        echo "📦 Installing MiKTeX in the background..."
        brew install --cask miktex
    fi
else
    echo "⏭️ Skipping LaTeX installation. (The app will use the cloud compiler fallback automatically)"
fi
echo ""

# 1. Check for Git and Clone
if ! command -v git &> /dev/null; then
    echo "🛠️ Git is not installed. Auto-installing..."
    if command -v brew &> /dev/null; then
        brew install git
    else
        echo "📦 Initiating Apple Command Line Tools installation (includes Git)..."
        xcode-select --install
        echo "⚠️ Please complete the installation dialog that just appeared, then re-run this script."
        exit 1
    fi
else
    echo "✅ Git is already installed."
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
    
    # macOS handle serve gracefully
    ollama serve >/dev/null 2>&1 &

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
