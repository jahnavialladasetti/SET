import urllib.request, urllib.parse, json

BASE = "http://localhost:8000/api"
email = "janualladasetti09@gmail.com"
pw = "Admin@1234"

# Login
data = urllib.parse.urlencode({"username": email, "password": pw}).encode()
req = urllib.request.Request(f"{BASE}/auth/login", data=data, method="POST")
token = json.loads(urllib.request.urlopen(req).read())["access_token"]
print("Login OK\n")

# Test POST income
tests = [
    {"amount": 5000.0, "description": "Salary", "category": "Salary", "type": "income", "date": "2026-04-24"},
    {"amount": 5000.0, "description": "Salary", "category": "Food", "type": "income", "date": "2026-04-24"},
    {"amount": 5000.0, "description": "Salary", "category": "Salary", "type": "income"},  # no date
]

for i, payload in enumerate(tests):
    try:
        data = json.dumps(payload).encode()
        req = urllib.request.Request(
            f"{BASE}/expenses/",
            data=data,
            headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
            method="POST"
        )
        resp = urllib.request.urlopen(req, timeout=5)
        result = json.loads(resp.read())
        print(f"[OK] Test {i+1}: {result}")
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f"[ERROR] Test {i+1} HTTP {e.code}: {body}")
    except Exception as e:
        print(f"[ERROR] Test {i+1}: {type(e).__name__}: {e}")
