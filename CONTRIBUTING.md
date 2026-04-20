# Contributing to StudyForge 🏡

First off, thank you for considering contributing to StudyForge! We love open source shits in this house. This project thrives on the chaotic energy of students and developers trying to make the Cambodian BAC exam slightly less agonizing.

## How Can I Contribute?

### 1. Code 💻
Found a bug in our "Liquid Glass" UI? Discovered a prompt injection that accidentally prints out grandma's recipes instead of calculus? 
- Open an Issue.
- Fork the repository.
- Create a feature branch: `git checkout -b feature/your-awesome-fix`
- Commit your changes: `git commit -m "Fix: Stop the AI from hallucinating inverse tangents"`
- Push to the branch: `git push origin feature/your-awesome-fix`
- Submit a Pull Request.

### 2. Syllabus Mappings 📚
Grade 12 syllabuses change. If you know the exact pacing of the MoEYS (Ministry of Education) curriculum and want to hardcode specific structures or cheat sheet definitions into the prompts, submit them! 

### 3. Translation & Localization 🇰🇭
StudyForge output relies on LaTeX. If you are a wizard at rendering **Khmer** characters beautifully in XeLaTeX via `fontspec`, we desperately need your PRs. Making the PDF output perfectly bilingual is our holy grail.

## Project Structure & Architecture
- `src/App.tsx`: The heart of the glass UI. We use Tailwind CSS + inline classes for rapid chaotic styling. Remember, if you add a UI element, *make it glass*.
- `install.sh` / `install.ps1`: The automated bootstrapping scripts for Ollama + Gemma 4. 

## Design Guidelines (The "Aesthetic" Law)
1. **Never use solid colors on the frontend.** Everything must be `base/opacity` and `backdrop-blur` (glass effect).
2. **Typography is king.** If the font isn't bold, tracking-tight, and unnecessarily large, we don't want it.
3. Keep the humor dry, sarcastic, and mildly panic-induced. 

Have fun building! 🤍
