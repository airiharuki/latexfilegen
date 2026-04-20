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
* **Remote PDF Compilation:** Installing LaTeX takes an entire hard drive and parts of your soul. We pipe the output straight into an external texlive compiler and serve you the live PDF directly.
* **Lecture BS You Ignored (OCR):** Handwriting looks like a doctor having a stroke? Zoned out for 50 slides? Drop them in this uploader. Gemini will decipher your professor's unhinged yapping and your terrible notes, turning them into a pristine cheat sheet.
* **Full Syllabus Mode:** Don't even know what you don't know? Hit the "Auto-generate" toggle. The AI will psychically deduce the standard Grade 12 syllabus and map it out.
* **Strict BAC Guidelines:** It knows the Ministry's rules. Seriously, if you try to use L'Hôpital's Rule, it will aggressively format a `\warn{}` box to remind you that the grading committee hates happiness.
* **100% BS-Free Output:** The app spits out nothing but pure code. No AI filler like *"Here is your study guide! I hope you ace your test to become a productive member of society!"* 🤖 Just math.

## Installation & Setup 🛠️

### The "My Exam is Tomorrow" Install (Automatic / Online Mode)
We wrote scripts to instantly download the project, bootstrap your dependencies, and optionally fetch the **Gemma 4** local model via Ollama. Just run the one-liner for your OS from anywhere in your terminal and let it cook.

**macOS & Linux:**
```bash
curl -fsSL https://raw.githubusercontent.com/airiharuki/latexfilegen/main/install.sh | bash
```

**Windows (Run in PowerShell):**
```powershell
irm https://raw.githubusercontent.com/airiharuki/latexfilegen/main/install.ps1 | iex
```

### The "I Like Doing Things the Hard Way" Install (Manual)

**1. macOS**
* Install [Node.js](https://nodejs.org/) (we recommend `nvm` or `brew install node`).
* *Optional for open-source mode:* Install [Ollama](https://ollama.com/download/mac).
* Open terminal and run `ollama pull gemma4`.
* Clone this repo, run `npm install`.
* Start it: `npm run dev`

**2. Linux (Debian/Ubuntu)**
* `sudo apt update && sudo apt install nodejs npm`
* *Optional for open-source mode:* `curl -fsSL https://ollama.com/install.sh | sh`
* `ollama pull gemma4`
* `npm install`
* `npm run dev`

**3. Windows**
* Download and install [Node.js](https://nodejs.org/).
* *Optional for open-source mode:* Open Terminal and run `winget install Ollama.Ollama`. Close/reopen terminal.
* `ollama pull gemma4`
* `npm install`
* `npm run dev`

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

## Disclaimer ⚠️
StudyForge generates the *guide*. It cannot generate the *motivation* to read it, nor can it absorb the knowledge into your brain via osmosis. May the curve be ever in your favor. 🍀
