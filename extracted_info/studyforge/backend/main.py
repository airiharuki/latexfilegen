import os
import uuid
import subprocess
import tempfile
import shutil
import re
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restrict in production
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Load API key ───────────────────────────────────────────────────────────────
genai.configure(api_key=os.environ["GEMINI_API_KEY"])

# ── Load system prompt from file ───────────────────────────────────────────────
PROMPT_PATH = os.path.join(os.path.dirname(__file__), "system_prompt.txt")
with open(PROMPT_PATH, "r") as f:
    SYSTEM_PROMPT = f.read()

# ── Request schema ─────────────────────────────────────────────────────────────
class GenerateRequest(BaseModel):
    subject: str          # e.g. "Physics"
    topics: list[str]     # e.g. ["Thermodynamics", "Waves", "Electricity"]
    extra_rules: str = "" # optional extra instructions

# ── Gemini call ────────────────────────────────────────────────────────────────
def call_gemini(subject: str, topics: list[str], extra_rules: str) -> str:
    model = genai.GenerativeModel(
        model_name="gemini-2.0-flash",
        system_instruction=SYSTEM_PROMPT,
    )

    topic_list = ", ".join(topics)
    user_message = f"""Generate a complete BAC study guide for:

Subject: {subject}
Topics to cover: {topic_list}
{f"Additional rules: {extra_rules}" if extra_rules else ""}

Output ONLY the raw .tex file. Start with \\documentclass. End with \\end{{document}}.
No markdown fences. No explanation."""

    response = model.generate_content(
        user_message,
        generation_config=genai.GenerationConfig(
            temperature=0.2,        # low temp = consistent, structured output
            max_output_tokens=8192,
        )
    )
    return response.text

# ── Sanitize + validate LaTeX output ──────────────────────────────────────────
def sanitize_latex(raw: str) -> str:
    # Strip markdown fences if model wrapped it anyway
    raw = re.sub(r"^```[a-z]*\n?", "", raw.strip(), flags=re.MULTILINE)
    raw = re.sub(r"\n?```$", "", raw.strip(), flags=re.MULTILINE)
    raw = raw.strip()

    # Basic safety: block shell escape
    if r"\write18" in raw or r"\input|" in raw:
        raise ValueError("Unsafe LaTeX command detected")

    # Must start and end correctly
    if not raw.startswith(r"\documentclass"):
        raise ValueError(f"Output did not start with \\documentclass. Got: {raw[:80]}")
    if not raw.endswith(r"\end{document}"):
        # Try to find and trim to last \end{document}
        idx = raw.rfind(r"\end{document}")
        if idx == -1:
            raise ValueError("Output missing \\end{document}")
        raw = raw[:idx + len(r"\end{document}")]

    return raw

# ── xelatex compilation ────────────────────────────────────────────────────────
def compile_latex(tex_source: str) -> bytes:
    tmpdir = tempfile.mkdtemp(prefix="studyforge_")
    try:
        tex_path = os.path.join(tmpdir, "output.tex")
        pdf_path = os.path.join(tmpdir, "output.pdf")

        with open(tex_path, "w", encoding="utf-8") as f:
            f.write(tex_source)

        # Run xelatex twice for TOC
        cmd = [
            "xelatex",
            "-interaction=nonstopmode",
            "-output-directory", tmpdir,
            tex_path
        ]

        for run in range(2):
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=120,
                cwd=tmpdir
            )

        if not os.path.exists(pdf_path):
            # Grab last 50 lines of log for debugging
            log_path = os.path.join(tmpdir, "output.log")
            log_tail = ""
            if os.path.exists(log_path):
                with open(log_path) as lf:
                    lines = lf.readlines()
                    log_tail = "".join(lines[-50:])
            raise RuntimeError(f"PDF not generated.\n\nxelatex log (last 50 lines):\n{log_tail}")

        with open(pdf_path, "rb") as f:
            return f.read()

    finally:
        shutil.rmtree(tmpdir, ignore_errors=True)

# ── Routes ─────────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/generate")
async def generate(req: GenerateRequest):
    """
    Full pipeline: Gemini → .tex → xelatex → PDF (base64 in JSON)
    """
    try:
        # 1. Generate LaTeX via Gemini
        raw_tex = call_gemini(req.subject, req.topics, req.extra_rules)

        # 2. Sanitize
        try:
            clean_tex = sanitize_latex(raw_tex)
        except ValueError as e:
            raise HTTPException(status_code=422, detail=f"LaTeX validation failed: {e}")

        # 3. Compile
        try:
            pdf_bytes = compile_latex(clean_tex)
        except RuntimeError as e:
            raise HTTPException(status_code=500, detail=f"Compilation failed: {e}")

        # 4. Return PDF as base64 + tex source for debugging
        import base64
        return JSONResponse({
            "success": True,
            "pdf_base64": base64.b64encode(pdf_bytes).decode(),
            "tex_source": clean_tex,   # useful for debugging / letting user download .tex too
            "pages_approx": len(pdf_bytes) // 3000,  # rough estimate
        })

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/compile-tex")
async def compile_tex_only(body: dict):
    """
    Compile a raw .tex string directly — no Gemini call.
    Useful if user edits the .tex manually.
    """
    tex_source = body.get("tex_source", "")
    if not tex_source:
        raise HTTPException(status_code=400, detail="tex_source is required")

    try:
        clean_tex = sanitize_latex(tex_source)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    try:
        pdf_bytes = compile_latex(clean_tex)
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))

    import base64
    return JSONResponse({
        "success": True,
        "pdf_base64": base64.b64encode(pdf_bytes).decode(),
    })
