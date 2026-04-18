# ── Stage 1: TeX Live base ────────────────────────────────────────────────────
FROM texlive/texlive:latest

# ── Install Python ─────────────────────────────────────────────────────────────
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

# ── App directory ──────────────────────────────────────────────────────────────
WORKDIR /app

# ── Install Python deps ────────────────────────────────────────────────────────
COPY requirements.txt .
RUN pip3 install --break-system-packages -r requirements.txt

# ── Copy app files ─────────────────────────────────────────────────────────────
COPY main.py .
COPY system_prompt.txt .

# ── Expose port ───────────────────────────────────────────────────────────────
EXPOSE 8000

# ── Run ───────────────────────────────────────────────────────────────────────
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
