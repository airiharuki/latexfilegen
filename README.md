# StudyForge 🔨📚

**Because crying over past papers is a rite of passage, but formatting your study notes shouldn't be.**

Welcome to **StudyForge**, the ultimate weapon for surviving the Cambodian Baccalaureate (BAC) exam. Powered by Google's GenAI and pure, unfiltered panic, this app takes your desperate 3:00 AM pleas for knowledge (e.g., "Subject: Math, Topics: Integration", "Rule: Explain it like my exam is tomorrow") and transmutes them into beautifully formatted, battle-ready LaTeX (`.tex`) code. All wrapped in a sleek "Liquid Glass" interface, so at least your screen looks good while you question your life choices.

## What does it actually do?
1. **You tell it what to do.** (e.g., "Physics: Kinematics". "Rule: Pretend I am 5 years old but still need to pass the BAC").
2. **The AI does the heavy lifting.** It churns out a meticulous study guide packed with definitions, formulas, and strategies. It basically spoon-feeds you knowledge.
3. **You get raw, unadulterated LaTeX.** No weird Markdown artifacts. Just pure `.tex` code ready to be compiled into a gorgeous PDF. Because real students suffer through LaTeX compilation.

## Features 🚀
* **Model Selection Engine:** Choose your fighter. Toggle between **Gemini 3.1 Pro** for heavy logic, **Gemini 3 Flash** for when the exam starts in 10 minutes, or **Gemma 4** for access via open weights! (Because we love open source shits in this house 🏡)
* **Liquid Glass Interface:** An insanely unnecessary but absolutely gorgeous visual aesthetic. Fluid, crystal-clear glassmorphism with VHS grain. If you're going to fail, fail *aesthetic*.
* **Intelligent PDF Compilation:** The app operates on true dual-mode logic. 
  - **Local/Offline:** If you're running Gemma 4 offline and have `texlive` (`xelatex`) installed on your system, it compiles the PDF natively using `child_process`.
  - **Remote (Fallback):** Don't have a 6GB LaTeX installation lying around? The app dynamically falls back to piping the `.tex` output straight to an external texlive API. *(Note: Using this cloud fallback while running the "offline" Gemma 4 mode is highly unrecommended, as it completely defeats the purpose of an isolated, offline privacy stack. Install MiKTeX or MacTeX if you want to stay off the grid!)*
* **Lecture BS You Ignored (OCR):** Handwriting looks like a doctor having a stroke? Zoned out for 50 slides? Drop them in this uploader. Gemini will decipher your professor's unhinged yapping and your terrible notes, turning them into a pristine cheat sheet.
* **Full Syllabus Mode:** Don't even know what you don't know? Hit the "Auto-generate" toggle. The AI will psychically deduce the standard Grade 12 syllabus and map it out.
* **Strict BAC Guidelines:** It knows the Ministry's rules. Seriously, if you try to use L'Hôpital's Rule, it will aggressively format a `\warn{}` box to remind you that the grading committee hates happiness.
* **100% BS-Free Output:** The app spits out nothing but pure code. No AI filler like *"Here is your study guide! I hope you ace your test to become a productive member of society!"* 🤖 Just math.

## Installation & Setup 🛠️

### The "I Only Have a Phone" Setup (iOS & Android)
If you're cramming from an iPhone or Android because you left your laptop at home, **do not attempt to run these scripts.** Just use the live, deployed web application! 
Because we built the **Remote PDF Compilation** API fallback, the server handles all the massive LaTeX compilation for you in the cloud. No 8GB `texlive` installation needed on your phone. Just open the browser, tap "Construct Guide", and get your PDF.

### The "My Exam is Tomorrow" Install (Automatic / Online Mode)
We wrote scripts to instantly download the project, bootstrap your dependencies, and optionally fetch the **Gemma 4** local model via Ollama. 
*Note: During execution, the scripts will optionally ask if you want to install MacTeX/TeX Live/MiKTeX for true local offline PDF generation. If your internet is slow, just hit 'N' and the app will use our Cloud Compiler fallback automatically!*

**macOS:**
```bash
bash -c "$(curl -fsSL https://raw.githubusercontent.com/airiharuki/latexfilegen/main/install_mac.sh)"
```

**Linux (Debian/Ubuntu):**
```bash
bash -c "$(curl -fsSL https://raw.githubusercontent.com/airiharuki/latexfilegen/main/install_linux.sh)"
```

**Windows (Run in PowerShell):**
```powershell
irm https://raw.githubusercontent.com/airiharuki/latexfilegen/main/install.ps1 | iex
```

### The "I Like Doing Things the Hard Way" Install (Manual)

**Step 1: Grab the code**
*(You will need [Git](https://git-scm.com/) installed on your machine to clone the repository)*
```bash
git clone https://github.com/airiharuki/latexfilegen.git
cd latexfilegen
```

**Step 2: OS-Specific Dependencies**

**macOS**
* Install [Node.js](https://nodejs.org/) (we recommend `nvm` or `brew install node`).
* *Optional for open-source mode:* Install [Ollama](https://ollama.com/download/mac).
* Open terminal and run `ollama pull gemma4`.
* *Optional for true local PDF compilation:* `brew install --cask mactex-no-gui` OR `brew install --cask miktex`

**Linux (Debian/Ubuntu)**
* `sudo apt update && sudo apt install nodejs npm git`
* *Optional for open-source mode:* `curl -fsSL https://ollama.com/install.sh | sh`
* `ollama pull gemma4`
* *Optional for true local PDF compilation:* `sudo apt-get install texlive-xetex texlive-latex-extra texlive-science texlive-fonts-recommended`

**Windows**
* Download and install [Node.js](https://nodejs.org/).
* *Optional for open-source mode:* Open Terminal and run `winget install Ollama.Ollama`. Close/reopen terminal.
* `ollama pull gemma4`
* *Optional for true local PDF compilation:* `winget install MiKTeX.MiKTeX` OR `winget install GNU.TeXLive`

**Step 3: Build & Run**
```bash
npm install
npm run dev
```

## Bring Your Own Keys 🔑
If you are using the cloud-based **Gemini 3.1 Pro** or **Flash** engines (because you physically don't have the RAM to run Gemma 4 locally), you need a key.
1. Create a `.env` file in the root directory.
2. Offer your Google Gemini API key to the `.env` gods:
```env
GEMINI_API_KEY=your_key_here
```
*(If you're exclusively running local Gemma 4 offline, skip this!)*

## Contribution 🤝
Love open-source shits? Same here. 🏡 Whether you're fixing our chaotic logic or adding new UI themes, we want you! Read our [`CONTRIBUTING.md`](./CONTRIBUTING.md) to understand our aesthetic laws and how to submit a PR.

## License 📄
This project is licensed under the Apache License 2.0. See the [LICENSE](./LICENSE) file for more details.

### TL;DR (The "Human-Readable" Summary)
*Disclaimer: This is just a summary for quick reference. Please read the full [LICENSE](./LICENSE) for the actual legal terms.*

**✅ What you CAN do:**
- **Commercial Use:** Use this code for commercial purposes.
- **Modification:** Change anything you want.
- **Distribution:** Share the code or its derivatives with others.
- **Sublicensing:** Use this as part of a larger project.

**⚠️ What you MUST do:**
- **Include License:** If you redistribute the code, you MUST include the original license and copyright notice.
- **State Changes:** If you modify files, it's good practice (and required for major changes) to state that you've done so.

**❌ What you CAN'T do:**
- **Use the Trademarks:** You cannot use our trademarks or logos without permission.
- **Hold Us Liable:** This software is provided "as-is" without any warranty. We are not liable for any damages (like if the AI hallucinates a wrong formula and it breaks your study flow).

Seriously, read the [full legal text](./LICENSE) for all the specific details.

## Disclaimer ⚠️
StudyForge generates the *guide*. It cannot generate the *motivation* to read it, nor can it absorb the knowledge into your brain via osmosis. May the curve be ever in your favor. 🍀
