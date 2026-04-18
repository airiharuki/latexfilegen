# StudyForge 🔨📚

**Because crying over past papers is a rite of passage, but formatting your study notes shouldn't be.**

Welcome to **StudyForge**, the ultimate weapon for surviving the Cambodian Baccalaureate (BAC) exam. Powered by Gemini, this app takes your desperate plea for knowledge (e.g., "Subject: Math, Topics: Integration") and transmutes it into beautifully formatted, battle-ready LaTeX (`.tex`) code. 

## What does it actually do?
1. **You tell it what you need to study.** (e.g., "Physics: Kinematics" + "Extra rule: Explain it like I have 5 minutes until the exam").
2. **The AI does the heavy lifting.** It generates a comprehensive, meticulously structured study guide packed with definitions, formulas, warnings, and strategies.
3. **You get raw, unfiltered LaTeX.** No weird Markdown artifacts. Just pure `.tex` goodness ready to be compiled into a gorgeous PDF.

## Why did we build this?
Because using L'Hôpital's Rule on the BAC exam is illegal, and someone needs to remind you before you lose 15 points. Our AI is specifically instructed to *yell at you* in a nicely formatted `\warn{}` box if you try to use university-level calculus shortcuts. 

## Features 🚀
* **Dark Mode UI:** Because let's be honest, you're only using this at 3:00 AM.
* **Strict BAC Guidelines:** It knows what you can and can't do on the exam. (Seriously, stop trying to use the Tabular DI method).
* **Copy-Paste Ready:** Just dump the output into [Overleaf](https://www.overleaf.com/) or run it locally through `xelatex`. 
* **100% BS-Free Output:** The app spits out nothing but pure LaTeX. No introductory chat filler like *"Here is your study guide! I hope it helps!"* 🤖 Just code.

## How to use 🛠️
1. Install dependencies: `npm install`
2. Set your Google Gemini API key: Create a `.env` file and add `GEMINI_API_KEY=your_key_here`
3. Run the dev server: `npm run dev`
4. Type in your subject and topics.
5. Hit **Generate**.
6. Download the `.tex` file.
7. Print it out. **Close your laptop.** Go actually study.

## Disclaimer ⚠️
StudyForge generates the *guide*. It cannot generate the *motivation* to actually read it, nor can it take the exam for you. May the curve be ever in your favor. Good luck! 🍀
