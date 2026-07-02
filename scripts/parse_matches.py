import json
d = json.load(open("/tmp/range.json"))
print(f"Total: {d['resultSet']['count']}")
matches = d["matches"]
print(f"Got {len(matches)} matches")
for m in matches:
    ht = m.get("homeTeam")
    at = m.get("awayTeam")
    if not ht or not at:
        print(f"  SKIP (TBD): {m['utcDate'][:16]} - {ht} vs {at}")
        continue
    home = ht["name"][:20]
    away = at["name"][:20]
    date = m["utcDate"][:16]
    status = m["status"]
    s = m["score"]["fullTime"]
    if s is not None and s.get("home") is not None:
        score = f'{s["home"]}:{s["away"]}'
    else:
        score = "VS"
    stage = (m.get("stage") or "")[:10]
    print(f"  {date} {status:10} {stage:10} | {home:20} {score:5} {away}")

