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
* **"Square 1" File Upload (OCR):** Handwriting looks like a doctor having a stroke? Skipped 50 slides? Drop them in the *Square 1* uploader. Gemini will decipher your terrible handwriting and turn it into a pristine cheat sheet.
* **Full Syllabus Mode:** Don't even know what you don't know? Hit the "Auto-generate" toggle. The AI will psychically deduce the standard Grade 12 syllabus and map it out.
* **Strict BAC Guidelines:** It knows the Ministry's rules. Seriously, if you try to use L'Hôpital's Rule, it will aggressively format a `\warn{}` box to remind you that the grading committee hates happiness.
* **100% BS-Free Output:** The app spits out nothing but pure code. No AI filler like *"Here is your study guide! I hope you ace your test to become a productive member of society!"* 🤖 Just math.

## How to use 🛠️
1. Clone this bad boy and run `npm install`.
2. Offer your Google Gemini API key to the `.env` gods: `GEMINI_API_KEY=your_key_here`
3. Start the dev server: `npm run dev`
4. Pick your engine, type in your subject, and hit **Construct Guide**.
5. Switch seamlessly between raw code and compiled PDF views.
6. Print it out. **Close your laptop.** Go actually study. Seriously, get off the internet.

## Disclaimer ⚠️
StudyForge generates the *guide*. It cannot generate the *motivation* to read it, nor can it absorb the knowledge into your brain via osmosis. May the curve be ever in your favor. 🍀
