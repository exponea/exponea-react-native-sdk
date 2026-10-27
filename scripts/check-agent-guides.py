#!/usr/bin/env python3
"""Offline check of agent guides: local links and template placeholders. Does not prove semantics."""

import argparse
from pathlib import Path
import re
import subprocess
import sys
from urllib.parse import unquote, urlsplit


GUIDE_NAMES = ("AGENTS.md", "CLAUDE.md")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    args = parser.parse_args()
    root = args.root.resolve()

    # Tracked and new files; ignored output such as lib/ and node_modules/ is skipped.
    listed = subprocess.run(
        ["git", "-C", str(root), "ls-files", "--cached", "--others", "--exclude-standard"],
        check=True, capture_output=True, text=True,
    ).stdout.splitlines()
    guides = sorted({path for path in listed if Path(path).name in GUIDE_NAMES and (root / path).is_file()})
    failures = []

    for relative in guides:
        guide = root / relative
        body = guide.read_text()
        if re.search(r"\{\{[^}\n]+\}\}", body):
            failures.append(relative + ": unfilled template placeholder")
        # External URLs and anchors are deliberately not fetched/validated by this offline tool.
        prose = re.sub(r"```.*?```", "", body, flags=re.S)
        for destination in re.findall(r"\[[^\]\n]+\]\(([^)\s]+)\)", prose):
            url = urlsplit(destination.strip("<>"))
            if url.scheme or url.netloc or not url.path:
                continue
            linked = (guide.parent / unquote(url.path)).resolve()
            if root not in linked.parents and linked != root:
                failures.append(relative + ": link escapes repository: " + destination)
            elif not linked.exists():
                failures.append(relative + ": broken local link: " + destination)
        # The ReadMe workflows upload documentation/ in full.
        if relative.startswith("documentation/"):
            failures.append(relative + ": agent file in ReadMe upload tree")

    for failure in failures:
        print("FAIL: " + failure)
    if failures:
        return 1
    print("PASS: {} agent guides; local links resolve, no placeholders.".format(len(guides)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
