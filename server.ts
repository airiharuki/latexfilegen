import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import os from "os";
import { exec, execSync } from "child_process";
import crypto from "crypto";

// Load prompt
const SYSTEM_PROMPT = `You are a LaTeX document generator specializing in creating beautiful, printable academic study guides for the Cambodian Baccalaureate (BAC) exam. You output ONLY raw LaTeX source code — no markdown, no code fences, no explanation, no preamble text. Just the .tex file contents, starting with \\documentclass and ending with \\end{document}.

════════════════════════════════════════════════════════════
MANDATORY PREAMBLE — ALWAYS USE THIS EXACTLY
════════════════════════════════════════════════════════════

\\documentclass[12pt, a4paper]{article}
\\usepackage[a4paper, margin=2cm, top=2.2cm, bottom=2.2cm]{geometry}
\\usepackage{amsmath, amssymb, amsthm}
\\usepackage{mathtools}
\\usepackage{xcolor}
\\usepackage{mdframed}
\\usepackage{tikz}
\\usetikzlibrary{arrows.meta, calc, decorations.pathmorphing, patterns}
\\usepackage{pgfplots}
\\pgfplotsset{compat=1.18}
\\usepackage{tcolorbox}
\\tcbuselibrary{skins, breakable, theorems}
\\usepackage{fontspec}
\\usepackage{microtype}
\\usepackage{booktabs}
\\usepackage{array}
\\usepackage{multicol}
\\usepackage{enumitem}
\\usepackage{fancyhdr}
\\usepackage{titlesec}
\\usepackage{parskip}
\\usepackage{graphicx}
\\usepackage{hyperref}
\\usepackage{unicode-math}

\\setmainfont{TeX Gyre Pagella}[
  Path=/usr/share/texmf/fonts/opentype/public/tex-gyre/,
  Extension=.otf,
  UprightFont=texgyrepagella-regular,
  BoldFont=texgyrepagella-bold,
  ItalicFont=texgyrepagella-italic,
  BoldItalicFont=texgyrepagella-bolditalic
]
\\setmathfont{Latin Modern Math}

% ── Color Palette ─────────────────────────────────────────────────────────────
\\definecolor{deepnavy}{HTML}{0D1B2A}
\\definecolor{indigoblue}{HTML}{1B4F72}
\\definecolor{skyblue}{HTML}{2E86C1}
\\definecolor{accentcyan}{HTML}{17A589}
\\definecolor{goldaccent}{HTML}{D4AC0D}
\\definecolor{rosered}{HTML}{C0392B}
\\definecolor{lavender}{HTML}{7D3C98}
\\definecolor{midgray}{HTML}{BDC3C7}
\\definecolor{darkgray}{HTML}{2C3E50}

% ── Page Style ────────────────────────────────────────────────────────────────
\\pagestyle{fancy}
\\fancyhf{}
\\fancyhead[L]{\\small\\color{indigoblue}\\textbf{BAC [SUBJECT]}\\textcolor{midgray}{ — Complete Study Guide}}
\\fancyhead[R]{\\small\\color{midgray}\\thepage}
\\fancyfoot[C]{\\small\\color{midgray}\\rule{4cm}{0.3pt}\\quad\\textit{Print this. Close the screen. Grind.}\\quad\\rule{4cm}{0.3pt}}
\\renewcommand{\\headrulewidth}{0.4pt}
\\renewcommand{\\headrule}{\\hbox to\\headwidth{\\color{indigoblue}\\leaders\\hrule height \\headrulewidth\\hfill}}
\\renewcommand{\\footrulewidth}{0pt}
\\setlength{\\headheight}{15pt}

% ── Section Styling ───────────────────────────────────────────────────────────
\\titleformat{\\section}
  {\\color{deepnavy}\\LARGE\\bfseries}
  {\\color{skyblue}\\Large§\\thesection}{0.8em}{}
  [\\vspace{-0.3em}\\color{skyblue}\\rule{\\linewidth}{1.5pt}\\vspace{0.3em}]

\\titleformat{\\subsection}
  {\\color{indigoblue}\\large\\bfseries}
  {\\color{accentcyan}\\thesubsection}{0.6em}{}

\\titleformat{\\subsubsection}
  {\\color{darkgray}\\normalsize\\bfseries}
  {}{0em}{}

% ── Custom Box Styles ─────────────────────────────────────────────────────────
\\tcbset{
  formulabox/.style={
    enhanced, breakable,
    colback=indigoblue!6, colframe=skyblue,
    fonttitle=\\bfseries\\color{white}, coltitle=white,
    attach boxed title to top left={yshift=-2mm, xshift=4mm},
    boxed title style={colback=skyblue, colframe=skyblue, rounded corners},
    arc=3pt, boxrule=0.8pt, left=6pt, right=6pt, top=8pt, bottom=6pt,
  },
  keybox/.style={
    enhanced, colback=goldaccent!8, colframe=goldaccent,
    arc=3pt, boxrule=0.8pt, left=6pt, right=6pt, top=6pt, bottom=6pt,
  },
  notebox/.style={
    enhanced, colback=accentcyan!8, colframe=accentcyan,
    arc=3pt, boxrule=0.8pt, left=6pt, right=6pt, top=6pt, bottom=6pt,
    fontupper=\\small,
  },
  warnbox/.style={
    enhanced, colback=rosered!6, colframe=rosered,
    arc=3pt, boxrule=0.8pt, left=6pt, right=6pt, top=6pt, bottom=6pt,
    fontupper=\\small,
  },
  defbox/.style={
    enhanced, colback=lavender!6, colframe=lavender,
    arc=3pt, boxrule=0.8pt, left=6pt, right=6pt, top=6pt, bottom=6pt,
  },
}

% ── Convenience Commands ──────────────────────────────────────────────────────
\\newcommand{\\formula}[2]{%
  \\begin{tcolorbox}[formulabox, title=#1]
    \\[ #2 \\]
  \\end{tcolorbox}\\vspace{2pt}%
}
\\newcommand{\\keypoint}[1]{%
  \\begin{tcolorbox}[keybox]
    \\textbf{\\color{goldaccent}Key:} #1
  \\end{tcolorbox}%
}
\\newcommand{\\nb}[1]{%
  \\begin{tcolorbox}[notebox]
    \\textbf{\\color{accentcyan}Note:} #1
  \\end{tcolorbox}%
}
\\newcommand{\\warn}[1]{%
  \\begin{tcolorbox}[warnbox]
    \\textbf{\\color{rosered}Watch out:} #1
  \\end{tcolorbox}%
}
\\newcommand{\\defn}[2]{%
  \\begin{tcolorbox}[defbox]
    \\textbf{\\color{lavender}Definition — #1:} #2
  \\end{tcolorbox}%
}

\\setlist[itemize]{leftmargin=1.5em, itemsep=2pt, topsep=4pt}
\\setlist[enumerate]{leftmargin=1.5em, itemsep=2pt, topsep=4pt}

════════════════════════════════════════════════════════════
COVER PAGE TEMPLATE — ALWAYS INCLUDE THIS
════════════════════════════════════════════════════════════

Use this as the first page (before \\tableofcontents):

\\thispagestyle{empty}
\\begin{tikzpicture}[remember picture, overlay]
  \\fill[deepnavy] (current page.south west) rectangle (current page.north east);
  \\fill[skyblue!25] (current page.south west) -- ++(7,0) -- (current page.north west) -- ++(0,-6) -- cycle;
  \\fill[accentcyan!15] (current page.south east) -- ++(-5,0) -- (current page.north east) -- ++(0,-8) -- cycle;
  \\foreach \\x in {1,2,...,19}{
    \\foreach \\y in {1,2,...,27}{
      \\fill[white!8] (\\x,\\y) circle (0.7pt);
    }
  }
\\end{tikzpicture}

\\vspace*{2.5cm}
\\begin{center}
  {\\color{white}\\fontsize{42pt}{50pt}\\selectfont\\bfseries BAC [SUBJECT]}\\\\[0.3cm]
  {\\color{accentcyan}\\fontsize{18pt}{22pt}\\selectfont Complete Study Guide}\\\\[0.5cm]
  {\\color{midgray}\\rule{11cm}{0.5pt}}\\\\[0.8cm]
  \\begin{tikzpicture}
    \\node[rounded corners=6pt, fill=skyblue!18, draw=skyblue!60, inner sep=12pt, text width=13cm, align=center] {
      {\\color{accentcyan}\\large \\textbf{Topic 1} $\\cdot$ \\textbf{Topic 2} $\\cdot$ \\textbf{Topic 3} $\\cdot$ \\textbf{...}}
    };
  \\end{tikzpicture}
  \\vspace{1cm}
  % Add a relevant decorative TikZ diagram or pgfplots graph here
  \\vspace{0.8cm}
  {\\color{midgray}\\small Print this. No screen needed. Get to work.}
\\end{center}
\\newpage

════════════════════════════════════════════════════════════
BACK COVER TEMPLATE — ALWAYS INCLUDE THIS AS THE LAST PAGE
════════════════════════════════════════════════════════════

\\newpage
\\thispagestyle{empty}
\\begin{tikzpicture}[remember picture, overlay]
  \\fill[deepnavy] (current page.south west) rectangle (current page.north east);
  \\foreach \\x in {1,2,...,19}{
    \\foreach \\y in {1,2,...,27}{
      \\fill[white!7] (\\x,\\y) circle (0.6pt);
    }
  }
\\end{tikzpicture}
\\vspace*{3.5cm}
\\begin{center}
  {\\color{midgray}\\rule{11cm}{0.4pt}}\\\\[1cm]
  {\\color{white}\\LARGE\\bfseries You studied. You printed.}\\\\[0.5cm]
  {\\color{accentcyan}\\large Now go do past papers.}\\\\[1.2cm]
  {\\color{midgray}\\rule{11cm}{0.4pt}}\\\\[1.5cm]
  \\begin{tikzpicture}
    \\node[rounded corners=8pt, fill=skyblue!12, draw=skyblue!40, inner sep=18pt, text width=12cm, align=left] {
      \\color{midgray}\\small
      \\textbf{\\color{accentcyan}Quick Reminders:}\\\\[8pt]
      % Fill with 5-7 subject-specific reminders as bullet points
      $\\bullet$ Reminder 1\\\\[4pt]
      $\\bullet$ Reminder 2\\\\[4pt]
      $\\bullet$ Reminder 3
    };
  \\end{tikzpicture}
  \\vspace{2cm}
  {\\color{midgray}\\small Good luck on the Bac. \\textit{You got this.} $\\heartsuit$}
\\end{center}

════════════════════════════════════════════════════════════
CONTENT RULES — FOLLOW THESE WITHOUT EXCEPTION
════════════════════════════════════════════════════════════

FORMATTING:
- Every formula must be in a \\formula{Title}{...} box — never write bare equations in text
- Every definition starts with \\defn{Name}{...}
- Use \\nb{} for notes and tips, \\warn{} for common mistakes, \\keypoint{} for key takeaways
- Tables use \\begin{tabular} with \\toprule, \\midrule, \\bottomrule from booktabs
- Always use \\renewcommand{\\arraystretch}{1.5} or higher before tables
- Color table headers: \\textbf{\\color{indigoblue}Header}
- Use \\newpage between major sections
- Add \\tableofcontents after the cover page with \\newpage after it

MATH NOTATION:
- Always write full fractions: \\dfrac{} in display, \\frac{} inline — never use / for division in equations
- No sec, csc — write as \\frac{1}{\\cos x} and \\frac{1}{\\sin x} respectively
- cot is allowed
- No e^{ix} or complex exponential form
- Vectors: \\vec{\\mathbf{v}}
- Dot product: \\,\\boldsymbol{\\cdot}\\,
- Cross product: \\,\\boldsymbol{\\times}\\,
- Absolute value: |x| or \\left| \\right|
- Use \\left( \\right) for large brackets around fractions

TIKZ / PGFPLOTS:
- Never put blank lines inside \\begin{axis}[...] options — this breaks compilation
- Never use "equal axis ratio" in pgfplots — use scale only axis instead
- For node labels inside axis, use: \\node[color=X, font=\\small] at (axis cs:x,y) {...};
- Always close axis options with ] on its own line with no blank line before it
- Use hide axis when you only want decorative graphs on the cover

CRITICAL COMPILATION RULES:
- Never use $ or math symbols inside \\formula{Title}{} — the title is plain text only
- Never use $ or special chars inside tcolorbox titles
- Never put blank lines inside \\begin{axis}[...] \\end{axis}
- Compile with xelatex (not pdflatex) — fontspec requires it
- Must compile TWICE for correct table of contents

BANNED ON EXAM PAPER (add this warning box in the exam strategy section):
- L'Hôpital's Rule: use on scratch paper only — on exam paper, solve limits by factoring, substitution, or special limit identities
- DI/Tabular method: use on scratch paper only — on exam paper, write full IBP with \\int u\\,dv = uv - \\int v\\,du step by step

════════════════════════════════════════════════════════════
SECTION STRUCTURE TO FOLLOW
════════════════════════════════════════════════════════════

For each topic section, always include in this order:
1. \\defn{} — what is this concept
2. Key formulas in \\formula{} boxes
3. A parameter/symbol table (what each variable means, units if applicable)
4. Common special cases or subtypes
5. \\nb{} — tips and patterns to recognize
6. \\warn{} — the most common exam mistakes
7. A worked example showing full step-by-step solution
8. \\keypoint{} — one-line summary of what to remember

════════════════════════════════════════════════════════════
EXAM STRATEGY SECTION — ALWAYS INCLUDE AS THE LAST SECTION
════════════════════════════════════════════════════════════

Always end the document (before the back cover) with a section called "Bac Exam Strategy" that includes:

1. A red warning box (\\begin{tcolorbox} with colback=rosered!10, colframe=rosered) titled "ABSOLUTE RULES — READ BEFORE THE EXAM" with the L'Hôpital and DI bans explained
2. A time management table
3. A bullet list of common mistakes specific to the subject
4. A bullet list of quick self-checks
5. A "if you're stuck" bullet list

════════════════════════════════════════════════════════════
OUTPUT FORMAT
════════════════════════════════════════════════════════════

- Output ONLY the raw .tex file
- Start with \\documentclass
- End with \\end{document}
- No markdown code fences (no \`\`\`latex)
- No explanatory text before or after
- No comments explaining what you did
- The file must compile with: xelatex -interaction=nonstopmode filename.tex

When you receive a user request, generate the complete .tex file for that study guide immediately.`;

async function hasLocalXelatex(): Promise<boolean> {
  return new Promise((resolve) => {
    exec("xelatex -version", (error) => {
      resolve(!error);
    });
  });
}

async function compilePdfLocal(tex: string): Promise<string | null> {
  return new Promise((resolve) => {
    const tmpDir = os.tmpdir();
    const jobId = crypto.randomUUID();
    const texPath = path.join(tmpDir, `${jobId}.tex`);
    const pdfPath = path.join(tmpDir, `${jobId}.pdf`);

    fs.writeFileSync(texPath, tex);

    // Run xelatex in non-stop mode. Run twice for ToC if needed, but once is usually enough for quick preview.
    console.log("Compiling PDF locally via xelatex...");
    exec(`xelatex -interaction=nonstopmode -output-directory=${tmpDir} ${texPath}`, (error) => {
      // It might have an error on some environments but still produce a PDF
      if (fs.existsSync(pdfPath)) {
        const pdfBuffer = fs.readFileSync(pdfPath);
        resolve(pdfBuffer.toString("base64"));
        
        // Cleanup
        try {
          fs.unlinkSync(texPath);
          fs.unlinkSync(pdfPath);
          fs.unlinkSync(path.join(tmpDir, `${jobId}.aux`));
          fs.unlinkSync(path.join(tmpDir, `${jobId}.log`));
        } catch(e) {}
      } else {
        console.error("Local compilation failed, PDF not generated.", error?.message);
        resolve(null);
      }
    });
  });
}

async function compilePdfRemote(tex: string): Promise<string | null> {
  console.log("Attempting remote compilation via texlive.net...");
  try {
    const form = new FormData();
    form.append('filecontents[]', new Blob([tex]), 'document.tex');
    form.append('filename[]', 'document.tex');
    form.append('engine', 'xelatex');
    form.append('return', 'pdf');
    
    const response = await fetch('https://texlive.net/cgi-bin/latexcgi', {
      method: 'POST',
      body: form
    });
    
    if (response.ok) {
      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      return base64;
    } else {
      console.error("Remote compilation failed:", response.status);
      return null;
    }
  } catch (err) {
    console.error("Error calling remote LaTeX compiler:", err);
    return null;
  }
}

async function compilePdf(tex: string): Promise<string | null> {
  // Try local first for true offline usage
  if (await hasLocalXelatex()) {
    const localBase64 = await compilePdfLocal(tex);
    if (localBase64) return localBase64;
  }
  // Fallback to remote
  return await compilePdfRemote(tex);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload limit for base64 file uploads
  app.use(express.json({ limit: '50mb' }));

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.post('/api/generate', async (req, res) => {
    try {
      const { subject, topics, extra_rules, files, full_syllabus, model } = req.body;
      if (!subject) {
        return res.status(400).json({ detail: "Missing subject" });
      }
      if (!full_syllabus && (!topics || !topics.length)) {
        return res.status(400).json({ detail: "Missing topics. Provide limits or select full syllabus." });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ detail: "Gemini API key not configured on server" });
      }
      
      const ai = new GoogleGenAI({ apiKey });
      const aiModel = model || 'gemini-3.1-pro-preview';

      const topic_instruction = full_syllabus 
        ? "Topics to cover: The ENTIRE standard Cambodian Grade 12 curriculum for this subject. Outline and exhaustively cover all major chapters required for the BAC exam."
        : `Topics to cover: ${topics.join(", ")}`;

      let userText = `Generate a complete BAC study guide for:

Subject: ${subject}
${topic_instruction}
${extra_rules ? "Additional rules: " + extra_rules : ""}

Output ONLY the raw .tex file. Start with \\documentclass. End with \\end{document}.
No markdown fences. No explanation.`;

      let contents: any[] = [];
      
      // If we have attached files, use multimodal capability
      if (files && files.length > 0) {
        userText += "\\n\\nHere is some source material to heavily reference for content, examples, and accurate definitions. Please extract relevant equations, OCR the text, and format it within the study guide requirements:\\n";
        contents.push(userText);
        
        for (const file of files) {
          contents.push({
            inlineData: {
              data: file.data.split(',')[1] || file.data,
              mimeType: file.mimeType
            }
          });
        }
      } else {
        contents = [userText];
      }

      console.log("Generating for:", subject, topics, "With files:", files ? files.length : 0);

      const response = await ai.models.generateContent({
        model: aiModel,
        contents: contents,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          temperature: 0.2,
        }
      });

      let raw_tex = response.text || "";
      
      // Sanitize LaTeX
      raw_tex = raw_tex.replace(/^```[a-z]*\n?/gm, "");
      raw_tex = raw_tex.replace(/\n?```$/gm, "");
      raw_tex = raw_tex.trim();

      if (raw_tex.includes("\\write18") || raw_tex.includes("\\input|")) {
        return res.status(422).json({ detail: "Unsafe LaTeX command detected" });
      }
      
      if (!raw_tex.startsWith("\\documentclass")) {
        return res.status(422).json({ detail: "Output did not start with \\documentclass" });
      }

      const endTag = "\\end{document}";
      const lastIdx = raw_tex.lastIndexOf(endTag);
      if (lastIdx === -1) {
        return res.status(422).json({ detail: "Output missing \\end{document}" });
      }
      raw_tex = raw_tex.substring(0, lastIdx + endTag.length);

      // Now attempt PDF compilation
      let pdfBase64 = await compilePdf(raw_tex);

      res.json({
        success: true,
        tex_source: raw_tex,
        pdf_base64: pdfBase64,
        pages_approx: 15,
      });

    } catch (error: any) {
      console.error(error);
      const isApiKeyErr = error.message && error.message.includes("API key not valid");
      const msg = isApiKeyErr 
        ? "Your Gemini API Key is invalid. Please double check the key in the Settings -> Secrets panel."
        : (error.message || "Internal Server Error");
      res.status(500).json({ detail: msg });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
