import sqlite3
import urllib.request, urllib.parse, json

DB = "spendsense.db"
conn = sqlite3.connect(DB)
cur = conn.cursor()

cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
print("Tables:", [r[0] for r in cur.fetchall()])

cur.execute("PRAGMA table_info(expenses)")
print("Expenses cols:", [r[1] for r in cur.fetchall()])

cur.execute("PRAGMA table_info(subscriptions)")
print("Subscriptions cols:", [r[1] for r in cur.fetchall()])

cur.execute("SELECT COUNT(*) FROM expenses")
print("Expense rows:", cur.fetchone()[0])

cur.execute("SELECT COUNT(*) FROM subscriptions")
print("Subscription rows:", cur.fetchone()[0])

conn.close()

# Test the backend directly
print("\n--- Testing backend ---")
try:
    req = urllib.request.Request("http://localhost:8000/")
    resp = urllib.request.urlopen(req, timeout=3)
    print("Root:", resp.read().decode())
except Exception as e:
    print("Root error:", e)
