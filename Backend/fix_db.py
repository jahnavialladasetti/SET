from passlib.context import CryptContext
import sqlite3
import urllib.request, urllib.parse, json

new_pass = "Admin@1234"
email = "janualladasetti09@gmail.com"

pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")
hashed = pwd.hash(new_pass)

conn = sqlite3.connect("spendsense.db")
cur = conn.cursor()
cur.execute(
    "UPDATE users SET hashed_password=?, monthly_budget=2000.0, currency='INR' WHERE email=?",
    (hashed, email)
)
conn.commit()

# Verify immediately from DB
cur.execute("SELECT hashed_password, monthly_budget, currency FROM users WHERE email=?", (email,))
row = cur.fetchone()
print("Hash match:", pwd.verify(new_pass, row[0]))
print("monthly_budget:", row[1])
print("currency:", row[2])
conn.close()

# Now test via HTTP
data = urllib.parse.urlencode({"username": email, "password": new_pass}).encode()
try:
    req = urllib.request.Request("http://localhost:8000/api/auth/login", data=data, method="POST")
    resp = urllib.request.urlopen(req)
    token = json.loads(resp.read())["access_token"]
    print("HTTP Login OK, token:", token[:30] + "...")

    req2 = urllib.request.Request("http://localhost:8000/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    resp2 = urllib.request.urlopen(req2)
    user = json.loads(resp2.read())
    print("HTTP /me OK:", user)
except Exception as e:
    print("HTTP Error:", e)
