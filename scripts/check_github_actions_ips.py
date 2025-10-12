#!/usr/bin/env python3
"""Fetch GitHub Actions runner IP ranges and detect changes."""
from __future__ import annotations

import json
import sys
import textwrap
from pathlib import Path
from typing import Dict, List
from urllib.error import URLError, HTTPError
from urllib.request import urlopen


API_URL = "https://api.github.com/meta"
CACHE_PATH = Path(__file__).with_name("github_actions_ip_cache.json")


def fetch_actions_ip_ranges() -> Dict[str, List[str]]:
    """Return the GitHub Actions IP ranges grouped by key."""
    try:
        with urlopen(API_URL, timeout=10) as response:
            metadata = json.load(response)
    except HTTPError as exc:  # pragma: no cover - network failure
        raise RuntimeError(f"GitHub API request failed: {exc}") from exc
    except URLError as exc:  # pragma: no cover - network failure
        raise RuntimeError(f"Unable to reach GitHub API: {exc}") from exc

    # Some accounts expose separate IPv4/IPv6 keys; normalize them if present.
    actions_keys = [
        "actions",
        "actions_ipv4",
        "actions_ipv6",
    ]
    results: Dict[str, List[str]] = {}
    for key in actions_keys:
        ranges = metadata.get(key)
        if not ranges:
            continue
        results[key] = sorted(set(ranges))
    if not results:
        raise RuntimeError(
            "GitHub API did not return any Actions IP ranges. "
            "The response structure may have changed."
        )
    return results


def load_cached_ranges() -> Dict[str, List[str]]:
    """Load cached IP ranges from disk if they exist."""
    if not CACHE_PATH.exists():
        return {}
    try:
        with CACHE_PATH.open("r", encoding="utf-8") as file:
            data = json.load(file)
    except json.JSONDecodeError as exc:
        raise RuntimeError(
            f"Cached IP list is corrupted ({CACHE_PATH}): {exc}"
        ) from exc
    # Ensure entries are sorted strings for deterministic comparison.
    return {key: sorted(set(value)) for key, value in data.items()}


def save_ranges(ranges: Dict[str, List[str]]) -> None:
    """Persist the latest IP ranges to disk."""
    with CACHE_PATH.open("w", encoding="utf-8") as file:
        json.dump(ranges, file, indent=2)
        file.write("\n")


def diff_ranges(
    previous: Dict[str, List[str]],
    current: Dict[str, List[str]],
) -> str:
    """Compute a human-readable diff between two range sets."""
    lines = []
    keys = sorted(set(previous) | set(current))
    for key in keys:
        old_set = set(previous.get(key, []))
        new_set = set(current.get(key, []))
        added = sorted(new_set - old_set)
        removed = sorted(old_set - new_set)
        if not added and not removed:
            continue
        lines.append(f"[{key}]")
        if added:
            lines.append("  Added:")
            lines.extend(f"    + {value}" for value in added)
        if removed:
            lines.append("  Removed:")
            lines.extend(f"    - {value}" for value in removed)
    return "\n".join(lines)


def main() -> int:
    print("Fetching GitHub Actions IP ranges…")
    current_ranges = fetch_actions_ip_ranges()
    previous_ranges = load_cached_ranges()

    if not previous_ranges:
        save_ranges(current_ranges)
        print(
            textwrap.dedent(
                f"""
                No cached IP list found. Cached the current ranges at:
                  {CACHE_PATH}

                Use these CIDR blocks to update the Cafe24 SSH 허용 IP 목록.
                Re-run the script later to detect changes automatically.
                """
            ).strip()
        )
        return 0

    diff = diff_ranges(previous_ranges, current_ranges)
    if not diff:
        print("No changes detected. Cached list is up to date.")
        return 0

    print("Detected changes in GitHub Actions IP ranges:")
    print(diff)
    save_ranges(current_ranges)
    print(
        textwrap.dedent(
            f"""
            Updated cache written to:
              {CACHE_PATH}

            Apply the Added/Removed CIDR 블록을 Cafe24 설정에 반영하세요.
            """
        ).strip()
    )
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except RuntimeError as exc:
        print(f"Error: {exc}", file=sys.stderr)
        sys.exit(1)
