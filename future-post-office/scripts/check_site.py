#!/usr/bin/env python3
"""Basic checks for the Future Post Office static site."""
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]

def main() -> int:
    required = [
        ROOT / "index.html",
        ROOT / "builder.html",
        ROOT / "styles.css",
        ROOT / "app.js",
        ROOT / "capsule-engine.js",
        ROOT / "builder.js",
    ]
    missing = [str(path) for path in required if not path.exists()]
    if missing:
        print("Missing files:", ", ".join(missing))
        return 1

    html = (ROOT / "index.html").read_text(encoding="utf-8")
    builder = (ROOT / "builder.html").read_text(encoding="utf-8")
    engine = (ROOT / "capsule-engine.js").read_text(encoding="utf-8")

    checks = {
        "Chinese page": 'lang="zh-CN"' in html,
        "RMB pricing": "¥9.9" in html and "¥19.9" in html and "¥29.9" in html,
        "WeChat contact": "data-copy-wechat" in html,
        "Email configured": "roubizhao6@gmail.com" in html,
        "Preview builder": "capsule-form" in builder,
        "Engine contains encryption": "AES-GCM" in engine,
        "Engine contains date gate": "showCountdown" in engine,
        "Public contact QR present": "wechat-contact-qr.svg" in html,
        "No public payment QR": "wechat-payment-qr.png" not in html,
    }
    failed = [name for name, ok in checks.items() if not ok]
    for name, ok in checks.items():
        print(f"{'PASS' if ok else 'FAIL'}: {name}")
    return 1 if failed else 0

if __name__ == "__main__":
    sys.exit(main())
