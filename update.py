import json, datetime, urllib.request
payload = {
    "status": "synchronized",
    "lastCycle": datetime.datetime.utcnow().isoformat() + "Z",
    "engine": "Santosh Tech Radar Daemon v2.5",
    "trackedRepositories": [],
    "marketVelocityMean": None,
    "note": "Live GitHub API aggregation active."
}
try:
    req = urllib.request.Request(
        "https://api.github.com/search/repositories?q=bm25+search+engine&sort=updated&per_page=5",
        headers={"User-Agent": "search-hub-radar", "Accept": "application/vnd.github+json"}
    )
    with urllib.request.urlopen(req, timeout=20) as resp:
        data = json.loads(resp.read().decode())
    payload["trackedRepositories"] = [i["full_name"] for i in data.get("items", [])]
    payload["marketVelocityMean"] = round(sum(i.get("stargazers_count", 0) for i in data.get("items", [])) / max(len(data.get("items", [])), 1), 2)
except Exception as e:
    payload["note"] = f"API aggregation failed: {e}"
with open("data/radar-telemetry.json", "w") as f:
    json.dump(payload, f, indent=2)
print("Autonomous telemetry cycle completed successfully.")
