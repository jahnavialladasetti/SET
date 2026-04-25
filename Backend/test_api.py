import urllib.request, urllib.parse, json

BASE = "http://localhost:8000/api"
email = "janualladasetti09@gmail.com"
pw = "Admin@1234"

# Login
data = urllib.parse.urlencode({"username": email, "password": pw}).encode()
req = urllib.request.Request(f"{BASE}/auth/login", data=data, method="POST")
resp = urllib.request.urlopen(req, timeout=5)
token = json.loads(resp.read())["access_token"]
print(f"Login OK. Token: {token[:50]}...\n")

# Test all protected endpoints
for endpoint in ["/auth/me", "/expenses/", "/subscriptions/"]:
    try:
        req = urllib.request.Request(f"{BASE}{endpoint}", headers={"Authorization": f"Bearer {token}"})
        resp = urllib.request.urlopen(req, timeout=5)
        result = json.loads(resp.read())
        count = len(result) if isinstance(result, list) else "object"
        print(f"[OK] GET {endpoint}: {count} item(s)")
        if isinstance(result, list) and result:
            print(f"     First item: {result[0]}")
    except urllib.error.HTTPError as e:
        print(f"[ERROR] GET {endpoint}: HTTP {e.code}")
        print(f"        Body: {e.read().decode()}")
    except Exception as e:
        print(f"[ERROR] GET {endpoint}: {type(e).__name__}: {e}")

# Test POST expense
print("\n--- Testing POST /expenses/ ---")
try:
    payload = json.dumps({"amount": 99.0, "description": "Test item", "category": "Food", "type": "expense"}).encode()
    req = urllib.request.Request(
        f"{BASE}/expenses/",
        data=payload,
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        method="POST"
    )
    resp = urllib.request.urlopen(req, timeout=5)
    print("[OK] POST /expenses/:", json.loads(resp.read()))
except urllib.error.HTTPError as e:
    print(f"[ERROR] POST /expenses/: HTTP {e.code}")
    print(f"        Body: {e.read().decode()}")
except Exception as e:
    print(f"[ERROR] {type(e).__name__}: {e}")
