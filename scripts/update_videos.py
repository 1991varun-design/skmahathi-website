#!/usr/bin/env python3
"""Refresh data/videos.json with the newest uploads from the YouTube channel.

Runs on GitHub (see .github/workflows/update-videos.yml). Uses only the Python
standard library and YouTube's public RSS feed (no API key needed).

Settings (environment variables, all optional):
  YT_HANDLE      channel handle, default "skMahathi"
  YT_CHANNEL_ID  channel id (starts with UC). If empty it is looked up from the handle.
"""
import json
import os
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET

HANDLE = os.environ.get("YT_HANDLE", "skMahathi").strip().lstrip("@")
CHANNEL_ID = os.environ.get("YT_CHANNEL_ID", "").strip()
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "videos.json")
LIMIT = 15
UA = "Mozilla/5.0 (compatible; skmahathi-site-updater)"
NS = {"a": "http://www.w3.org/2005/Atom", "yt": "http://www.youtube.com/xml/schemas/2015"}


def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "en"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", "replace")


def resolve_channel_id():
    html = get("https://www.youtube.com/@" + HANDLE)
    for pat in (
        r"feeds/videos\.xml\?channel_id=(UC[\w-]{22})",
        r'<link rel="canonical" href="https://www\.youtube\.com/channel/(UC[\w-]{22})"',
        r'"externalId":"(UC[\w-]{22})"',
        r'"channelId":"(UC[\w-]{22})"',
    ):
        m = re.search(pat, html)
        if m:
            return m.group(1)
    raise SystemExit("Could not find the channel id from @%s. Set the repository variable YT_CHANNEL_ID." % HANDLE)


def parse_feed(xml_text):
    root = ET.fromstring(xml_text)
    videos = []
    for e in root.findall("a:entry", NS):
        vid = e.find("yt:videoId", NS)
        title = e.find("a:title", NS)
        pub = e.find("a:published", NS)
        if vid is None or not re.fullmatch(r"[\w-]{11}", vid.text or ""):
            continue
        videos.append({
            "id": vid.text,
            "title": (title.text or "").strip() if title is not None else "",
            "published": (pub.text or "").strip() if pub is not None else "",
        })
    return videos[:LIMIT]


def main():
    cid = CHANNEL_ID or resolve_channel_id()
    videos = parse_feed(get("https://www.youtube.com/feeds/videos.xml?channel_id=" + cid))
    if not videos:
        raise SystemExit("The feed had no videos; leaving data/videos.json unchanged.")
    try:
        with open(OUT, encoding="utf-8") as f:
            old = json.load(f).get("videos")
    except Exception:
        old = None
    if old == videos:
        print("No change (%d videos)." % len(videos))
        return
    from datetime import datetime, timezone
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump({"updated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
                   "channel_id": cid, "videos": videos}, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print("Updated: %d videos, newest: %s" % (len(videos), videos[0]["title"]))


if __name__ == "__main__":
    main()
