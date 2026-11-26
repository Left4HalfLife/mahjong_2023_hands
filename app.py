"""Serve the local JavaScript scorer; no scoring or network inference in Python."""

import os
from pathlib import Path

from flask import Flask, jsonify, render_template, send_from_directory
from markdown import markdown
from markupsafe import Markup

app = Flask(__name__)
ROOT = Path(__file__).resolve().parent


def scoring_reference():
    source = (ROOT / "RULES.md").read_text(encoding="utf-8")
    _, start, remainder = source.partition("<!-- scoring-reference:start -->")
    section, end, _ = remainder.partition("<!-- scoring-reference:end -->")
    if not start or not end:
        raise ValueError("RULES.md must contain the scoring-reference start/end markers")
    # Only repository-authored documentation is rendered, never user hand input.
    return Markup(markdown(section, extensions=["tables"]))


@app.get("/")
def index():
    return render_template("index.html", scoring_reference=scoring_reference())


@app.get("/health")
def health():
    return jsonify(status="ok")


@app.get("/rules")
def rules():
    return send_from_directory(ROOT, "RULES.md", mimetype="text/plain")


@app.get("/audit")
def audit():
    return send_from_directory(ROOT, "RULES_AUDIT.md", mimetype="text/plain")


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=int(os.environ.get("PORT", "8000")), debug=False)
