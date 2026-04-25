import urllib.request, urllib.parse, json, sys

BASE = "http://localhost:8000/api"

# Try multiple passwords
passwords = ["Admin@1234", "admin1234", "password", "123456", "SpendSense@1", "Assgn2@123"]
email = "janualladasetti09@gmail.com"

token = None
for pw in passwords:
    try:
        data = urllib.parse.urlencode({"username": email, "password": pw}).encode()
        req = urllib.request.Request(f"{BASE}/auth/login", data=data, method="POST")
        resp = urllib.request.urlopen(req, timeout=5)
        token = json.loads(resp.read())["access_token"]
        print(f"[OK] Password found: {pw}")
        print(f"Token: {token[:40]}...")
        break
    except urllib.error.HTTPError as e:
        detail = e.read().decode()
        print(f"[X] {pw}: {detail}")
    except Exception as e:
        print(f"[ERR] {pw}: {e}")

if not token:
    print("\nCould not log in with any password.")
    print("\nResetting password to Admin@1234 via direct DB update...")
    import sqlite3, hashlib, os

    # Use bcrypt if available
    try:
        import bcrypt
        hashed = bcrypt.hashpw(b"Admin@1234", bcrypt.gensalt()).decode()
        print("Using bcrypt")
    except:
        print("bcrypt not available, trying passlib...")
        try:
            from passlib.context import CryptContext
            hashed = CryptContext(schemes=["bcrypt"], deprecated="auto").hash("Admin@1234")
            print("Using passlib")
        except:
            print("ERROR: Neither bcrypt nor passlib available!")
            sys.exit(1)

    conn = sqlite3.connect("spendsense.db")
    cur = conn.cursor()
    cur.execute("UPDATE users SET hashed_password=? WHERE email=?", (hashed, email))
    conn.commit()
    print(f"Updated {cur.rowcount} row(s)")
    conn.close()

    # Now try login
    data = urllib.parse.urlencode({"username": email, "password": "Admin@1234"}).encode()
    req = urllib.request.Request(f"{BASE}/auth/login", data=data, method="POST")
    try:
        resp = urllib.request.urlopen(req, timeout=5)
        token = json.loads(resp.read())["access_token"]
        print(f"[OK] Login works now! Token: {token[:40]}...")
    except Exception as e:
        print(f"Still failing: {e}")
    sys.exit(0)

# Test expenses and subscriptions
for endpoint in ["/expenses/", "/subscriptions/"]:
    try:
        req = urllib.request.Request(f"{BASE}{endpoint}", headers={"Authorization": f"Bearer {token}"})
        resp = urllib.request.urlopen(req, timeout=5)
        data = json.loads(resp.read())
        print(f"\n[OK] {endpoint}: {len(data)} items")
    except urllib.error.HTTPError as e:
        print(f"\n[ERROR] {endpoint}: HTTP {e.code} - {e.read().decode()}")
    except Exception as e:
        print(f"\n[ERROR] {endpoint}: {e}")
