# StudyForge — BAC Study Guide Generator

Gemini generates LaTeX → XeLaTeX compiles → PDF downloaded.

## Project Structure

```
studyforge/
├── backend/
│   ├── main.py              # FastAPI app (Gemini + xelatex pipeline)
│   ├── system_prompt.txt    # The LaTeX system prompt (copy from gemini_latex_system_prompt.txt)
│   ├── requirements.txt
│   └── Dockerfile
└── frontend/
    └── index.html           # Single-file frontend, no build step needed
```

---

## Setup

### 1. Copy the system prompt

Copy `gemini_latex_system_prompt.txt` into `backend/system_prompt.txt`.

### 2. Get a Gemini API key

https://aistudio.google.com/app/apikey — free tier is enough for testing.

---

## Running locally (with Docker — recommended)

```bash
cd backend

# Build the image (includes TeX Live + Python)
docker build -t studyforge-backend .

# Run it
docker run -p 8000:8000 -e GEMINI_API_KEY=your_key_here studyforge-backend
```

Then open `frontend/index.html` in your browser directly (no server needed).
Set Backend URL to `http://localhost:8000` and generate.

---

## Running locally (without Docker)

You need TeX Live installed:
- Mac: `brew install --cask mactex`
- Ubuntu/Debian: `sudo apt install texlive-full`
- Windows: install MikTeX or TeX Live

```bash
cd backend

pip install -r requirements.txt

GEMINI_API_KEY=your_key_here uvicorn main:app --reload --port 8000
```

---

## Deploying to Railway (easiest)

1. Push to GitHub
2. Go to railway.app → New Project → Deploy from GitHub
3. Select the `backend/` directory
4. Add environment variable: `GEMINI_API_KEY=your_key`
5. Railway auto-detects Dockerfile and deploys

Host the frontend on GitHub Pages or Netlify — it's a single HTML file, no build needed.

---

## Deploying to Render

1. New Web Service → connect repo
2. Root directory: `backend`
3. Runtime: Docker
4. Add env var: `GEMINI_API_KEY`

---

## API Endpoints

### POST /generate
Generate a full study guide PDF via Gemini + XeLaTeX.

```json
// Request
{
  "subject": "Physics",
  "topics": ["Thermodynamics", "Waves", "Electricity & Magnetism"],
  "extra_rules": "Use g = 10 m/s². Include SI units table."
}

// Response
{
  "success": true,
  "pdf_base64": "JVBERi0xLjQ...",   // base64-encoded PDF bytes
  "tex_source": "\\documentclass...", // raw LaTeX for debugging / download
  "pages_approx": 35
}
```

### POST /compile-tex
Compile a raw `.tex` string directly (no Gemini call). 
Useful if the user edits the LaTeX manually.

```json
// Request
{ "tex_source": "\\documentclass..." }

// Response
{ "success": true, "pdf_base64": "..." }
```

### GET /health
Returns `{ "status": "ok" }`. Use for uptime monitoring.

---

## Notes

- **Compilation takes 15–40 seconds** — the loading animation buys time
- Gemini sometimes returns markdown fences around the LaTeX — the backend strips these automatically
- If compilation fails, the full xelatex log tail is returned in `detail` for debugging
- The `\write18` shell escape is blocked for safety
- XeLaTeX runs **twice** for correct table of contents generation
- `temperature=0.2` keeps Gemini output structured and consistent

## Customizing the system prompt

The system prompt in `backend/system_prompt.txt` controls everything Gemini generates.
Edit it to:
- Change the color palette (hex values in the MANDATORY PREAMBLE section)
- Add subject-specific rules (e.g. "for chemistry, always include molar mass tables")
- Change the font (replace TeX Gyre Pagella with any font available in your TeX installation)
- Add or remove sections from the required structure
