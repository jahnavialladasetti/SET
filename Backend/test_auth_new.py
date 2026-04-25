import urllib.request, urllib.parse, json, sys

BASE = "http://localhost:8002/api"
email = "test_standard@example.com"
password = "Password@123"

def make_request(url, method="GET", data=None, token=None, json_data=True):
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    body = None
    if data:
        if json_data:
            body = json.dumps(data).encode()
            headers["Content-Type"] = "application/json"
        else:
            body = urllib.parse.urlencode(data).encode()
            headers["Content-Type"] = "application/x-www-form-urlencoded"
    
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            return json.loads(resp.read()), resp.getcode()
    except urllib.error.HTTPError as e:
        raw = e.read().decode()
        try:
            return json.loads(raw), e.code
        except:
            return raw, e.code
    except Exception as e:
        return str(e), 500

print("--- 1. Signup ---")
res, code = make_request(f"{BASE}/auth/signup", "POST", {"email": email, "password": password})
print(f"Signup: {code} - {res}")

print("\n--- 2. Login ---")
res, code = make_request(f"{BASE}/auth/login", "POST", {"username": email, "password": password}, json_data=False)
if code == 200:
    access_token = res["access_token"]
    refresh_token = res["refresh_token"]
    print(f"Login OK. Access: {access_token[:30]}..., Refresh: {refresh_token[:30]}...")
else:
    print(f"Login Failed: {code} - {res}")
    sys.exit(1)

print("\n--- 3. Refresh Token ---")
res, code = make_request(f"{BASE}/auth/refresh", "POST", {"refresh_token": refresh_token})
if code == 200:
    new_access_token = res["access_token"]
    new_refresh_token = res["refresh_token"]
    print(f"Refresh OK. New Access: {new_access_token[:30]}...")
else:
    print(f"Refresh Failed: {code} - {res}")

print("\n--- 4. Protected Route ---")
res, code = make_request(f"{BASE}/auth/me", "GET", token=new_access_token)
print(f"/auth/me: {code} - {res}")

print("\n--- 5. Logout ---")
res, code = make_request(f"{BASE}/auth/logout", "POST", token=new_access_token)
print(f"Logout: {code} - {res}")

print("\n--- 6. Verify Refresh Token Invalidation ---")
res, code = make_request(f"{BASE}/auth/refresh", "POST", {"refresh_token": new_refresh_token})
print(f"Refresh after logout (should fail): {code} - {res}")
