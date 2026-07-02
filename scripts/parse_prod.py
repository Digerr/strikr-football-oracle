import json
d = json.load(open("/tmp/prod3.json"))
print(f"OK: {d.get('ok')}")
print(f"Source: {d.get('source')}")
print(f"Count: {d.get('count')}")
matches = d.get("matches", [])
print()
for m in matches:
    home = m["homeTeam"]["name"][:20]
    away = m["awayTeam"]["name"][:20]
    comp = m["leagueShort"]
    status = m["status"]
    score = m.get("score")
    s = f'{score.get("home","?")}:{score.get("away","?")}' if score else "VS"
    minute = m.get("minute", "")
    stage = (m.get("stage") or "")[:10]
    date = m["kickoff"][:16]
    conf = m["prediction"]["confidence"]
    print(f"  [{comp:5}] {date} {status:8} {stage:10} | {home:20} {s:5} {away:20} ({conf}%)")
