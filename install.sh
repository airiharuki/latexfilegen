#!/bin/bash

# StudyForge Setup Script (macOS / Linux)
# This script is fully automatic. It clones the repo, gets Node running, starts Ollama in the background, and yanks Gemma 4 down.

echo "🚀 Bootstrapping StudyForge..."
echo ""

# 0. Check for Git and Clone
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

# 1. Check for Node.js
if ! command -v npm &> /dev/null; then
    echo "❌ ERROR: Node.js and npm are not installed."
    echo "Please install Node.js (v18+) from https://nodejs.org/ first."
    exit 1
fi
echo "✅ Node.js found."

# 2. Check for Ollama
if ! command -v ollama &> /dev/null; then
    echo "🛠️ Ollama not found. Installing automatically..."
    curl -fsSL https://ollama.com/install.sh | sh
else
    echo "✅ Ollama is already installed."
fi

# 3. Start daemon & Pull Gemma 4
if command -v ollama &> /dev/null; then
    echo "⚙️ Starting Ollama daemon in the background..."
    
    # Try starting the service gracefully, send output to void
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS handles serve heavily via the app, but we can try spinning the CLI
        ollama serve >/dev/null 2>&1 &
    else
        # Linux systemd (if applicable) or fallback
        sudo systemctl start ollama >/dev/null 2>&1 || ollama serve >/dev/null 2>&1 &
    fi

    # Give it a second to wake up
    sleep 3

    echo "🧠 Auto-installing Gemma 4 weights via Ollama..."
    echo "(Go grab a coffee ☕ This might take a few minutes...)"
    ollama pull gemma4
fi

# 4. Install Node dependencies
echo ""
echo "📦 Installing StudyForge dependencies..."
npm install

echo ""
echo "✨ Setup complete!"
echo "--------------------------------------------------------"
echo "To start StudyForge, simply run:"
echo "  npm run dev"
echo "--------------------------------------------------------"
