import urllib.request, urllib.parse, json

BASE = "http://localhost:8000/api"
email = "janualladasetti09@gmail.com"
pw = "Admin@1234"

# Login
data = urllib.parse.urlencode({"username": email, "password": pw}).encode()
req = urllib.request.Request(f"{BASE}/auth/login", data=data, method="POST")
token = json.loads(urllib.request.urlopen(req).read())["access_token"]
print("Login OK\n")

# Get an expense to edit
req = urllib.request.Request(f"{BASE}/expenses/", headers={"Authorization": f"Bearer {token}"})
expenses = json.loads(urllib.request.urlopen(req).read())
if not expenses:
    print("No expenses to test edit")
else:
    target = expenses[0]
    print(f"Testing edit on expense {target['id']}...")
    payload = {
        "amount": target['amount'] + 1,
        "description": target['description'] + " (Edited)",
        "category": target['category'],
        "date": target['date'],
        "type": target['type']
    }
    try:
        data = json.dumps(payload).encode()
        req = urllib.request.Request(
            f"{BASE}/expenses/{target['id']}",
            data=data,
            headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
            method="PUT"
        )
        resp = urllib.request.urlopen(req)
        print(f"[OK] Expense PUT: {json.loads(resp.read())}")
    except Exception as e:
        print(f"[ERROR] Expense PUT failed: {e}")

# Get a sub to edit
req = urllib.request.Request(f"{BASE}/subscriptions/", headers={"Authorization": f"Bearer {token}"})
subs = json.loads(urllib.request.urlopen(req).read())
if not subs:
    print("No subs to test edit")
else:
    target = subs[0]
    print(f"\nTesting edit on sub {target['id']}...")
    payload = {
        "name": target['name'] + " (Edited)",
        "amount": target['amount'],
        "billing_cycle": target['billing_cycle']
    }
    try:
        data = json.dumps(payload).encode()
        req = urllib.request.Request(
            f"{BASE}/subscriptions/{target['id']}",
            data=data,
            headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
            method="PUT"
        )
        resp = urllib.request.urlopen(req)
        print(f"[OK] Sub PUT: {json.loads(resp.read())}")
    except Exception as e:
        print(f"[ERROR] Sub PUT failed: {e}")
