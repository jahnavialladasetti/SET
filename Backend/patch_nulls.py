import sqlite3

conn = sqlite3.connect("spendsense.db")
cur = conn.cursor()

# Fix NULL type in expenses
cur.execute("UPDATE expenses SET type='expense' WHERE type IS NULL")
print(f"Fixed {cur.rowcount} expense rows with NULL type")

# Fix NULL color in subscriptions
cur.execute("UPDATE subscriptions SET color='#a855f7' WHERE color IS NULL")
print(f"Fixed {cur.rowcount} subscription rows with NULL color")

# Fix NULL icon in subscriptions
cur.execute("UPDATE subscriptions SET icon='💳' WHERE icon IS NULL")
print(f"Fixed {cur.rowcount} subscription rows with NULL icon")

conn.commit()
conn.close()

print("\nDone! All NULL values patched.")

# Verify
conn = sqlite3.connect("spendsense.db")
cur = conn.cursor()
cur.execute("SELECT COUNT(*) FROM expenses WHERE type IS NULL")
print(f"Remaining NULL types in expenses: {cur.fetchone()[0]}")
cur.execute("SELECT COUNT(*) FROM subscriptions WHERE color IS NULL OR icon IS NULL")
print(f"Remaining NULL color/icon in subscriptions: {cur.fetchone()[0]}")
conn.close()
