"""Serve the local JavaScript scorer; no scoring or network inference in Python."""

import os
from pathlib import Path

from flask import Flask, jsonify, render_template, send_from_directory

app = Flask(__name__)
ROOT = Path(__file__).resolve().parent


@app.get("/")
def index():
    return render_template("index.html")


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
