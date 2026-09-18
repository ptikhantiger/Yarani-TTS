"""
Vercel entry point.

Vercel's Python runtime looks for an ASGI `app` in files under `api/`. The real
application lives in ../main.py so it can also run under uvicorn locally, on
Render, or in the Dockerfile. vercel.json rewrites every path to this function.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from main import app  # noqa: E402  (must follow the sys.path tweak)

__all__ = ["app"]
