#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
PORT="${PORT:-8090}"
python3 -m http.server "$PORT" >/tmp/future-post-office-posters.log 2>&1 &
PID=$!
trap 'kill "$PID" 2>/dev/null || true' EXIT
sleep 1

render() {
  local name="$1"
  local query="$2"
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' \
    --headless=new --disable-gpu --hide-scrollbars \
    --window-size=1080,1920 \
    --screenshot="marketing/assets/${name}.png" \
    "http://127.0.0.1:${PORT}/marketing/poster.html?${query}" \
    >/tmp/future-post-office-poster-${name}.log 2>&1
}

render "poster-01" "title=%E6%8A%8A%E4%BB%8A%E5%A4%A9%E7%9A%84%E8%AF%9D%EF%BC%8C%E5%AF%84%E7%BB%99%E6%9C%AA%E6%9D%A5&detail=%E4%B8%8D%E6%98%AF%E6%99%AE%E9%80%9A%E8%B4%BA%E5%8D%A1%EF%BC%8C%E6%98%AF%E4%B8%80%E4%B8%AA%E5%8F%AA%E8%83%BD%E5%9C%A8%E6%9C%AA%E6%9D%A5%E6%89%93%E5%BC%80%E7%9A%84%E7%94%B5%E5%AD%90%E6%97%B6%E9%97%B4%E8%83%B6%E5%9B%8A%E3%80%82&price=%EF%BF%A59.9%20%E8%B5%B7"
render "poster-02" "title=%E4%B8%8D%E5%88%B0%E4%B8%80%E6%9D%AF%E5%A5%B6%E8%8C%B6%EF%BC%8C%E9%80%81%E4%B8%80%E4%B8%AA%E4%BC%9A%E7%AD%89%E5%88%B0%E6%9C%AA%E6%9D%A5%E7%9A%84%E7%A4%BC%E7%89%A9&subtitle=%E7%94%9F%E6%97%A5%20%C2%B7%20%E7%BA%AA%E5%BF%B5%E6%97%A5%20%C2%B7%20%E5%BC%82%E5%9C%B0%E6%81%8B%20%C2%B7%20%E6%AF%95%E4%B8%9A&detail=%E6%8A%8A%E7%9C%9F%E5%AE%9E%E7%9A%84%E8%AF%9D%E3%80%81%E7%85%A7%E7%89%87%E5%92%8C%E5%BC%80%E5%90%AF%E6%97%A5%E6%9C%9F%EF%BC%8C%E5%B0%81%E6%88%90%E4%B8%80%E9%A2%97%E6%97%B6%E9%97%B4%E8%83%B6%E5%9B%8A%E3%80%82&price=%EF%BF%A59.9%20%E8%B5%B7"
render "poster-03" "title=%E5%BC%82%E5%9C%B0%E6%81%8B%E6%9C%80%E9%80%82%E5%90%88%E7%9A%84%E7%A4%BC%E7%89%A9&subtitle=%E4%B8%8D%E6%98%AF%E5%8F%91%E4%B8%80%E5%8F%A5%E6%83%B3%E4%BD%A0%EF%BC%8C%E8%80%8C%E6%98%AF%E6%8A%8A%E4%BB%8A%E5%A4%A9%E7%9A%84%E6%80%9D%E5%BF%B5%E5%AF%84%E5%88%B0%E6%9C%AA%E6%9D%A5&detail=%E5%88%B0%E6%97%A5%E6%9C%9F%E6%89%8D%E8%83%BD%E6%89%93%E5%BC%80%EF%BC%8C%E5%AF%86%E7%A0%81%E5%8F%A6%E5%A4%96%E5%91%8A%E8%AF%89TA%E3%80%82&price=%EF%BF%A519.9"
render "poster-04" "title=%E7%BB%99%E4%B8%80%E5%B9%B4%E5%90%8E%E7%9A%84%E8%87%AA%E5%B7%B1%E5%86%99%E4%B8%80%E5%B0%81%E4%BF%A1&subtitle=%E5%A6%82%E6%9E%9C%E4%BD%A0%E7%8E%B0%E5%9C%A8%E5%BE%88%E8%BF%B7%E8%8C%AB&detail=%E6%9C%AA%E6%9D%A5%E7%9A%84%E4%BD%A0%EF%BC%8C%E5%8F%AF%E8%83%BD%E4%BC%9A%E6%84%9F%E8%B0%A2%E4%BD%A0%E6%B2%A1%E6%9C%89%E6%94%BE%E5%BC%83%E3%80%82&price=%EF%BF%A59.9"
render "poster-05" "title=%E4%B8%8D%E6%98%AFAI%E6%9B%BF%E4%BD%A0%E5%86%99&subtitle=%E6%98%AF%E4%BD%A0%E7%9C%9F%E7%9A%84%E6%9C%89%E8%AF%9D%E6%83%B3%E7%95%99%E4%B8%8B&detail=%E6%88%91%E4%BB%AC%E8%B4%9F%E8%B4%A3%E6%8E%92%E7%89%88%E3%80%81%E5%8A%A0%E5%AF%86%E5%92%8C%E6%9C%AA%E6%9D%A5%E6%97%A5%E6%9C%9F%E5%BC%80%E5%90%AF%E4%BD%93%E9%AA%8C%E3%80%82&price=%EF%BF%A59.9%20%E8%B5%B7"
