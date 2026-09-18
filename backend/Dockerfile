# Container image for the Yarani TTS backend.
# Works on Hugging Face Spaces (Docker SDK, port 7860), Render (Docker), Koyeb, Fly.io.
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PORT=7860

# Hugging Face runs containers as uid 1000; create a matching non-root user.
RUN useradd -m -u 1000 app
WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY --chown=app:app . .
USER app

EXPOSE 7860
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT}"]
