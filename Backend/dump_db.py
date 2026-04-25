import sqlite3

conn = sqlite3.connect("spendsense.db")
cur = conn.cursor()

print("=== EXPENSES ===")
cur.execute("SELECT id, amount, description, category, date, type, user_id FROM expenses")
for row in cur.fetchall():
    print(row)

print("\n=== SUBSCRIPTIONS ===")
cur.execute("SELECT id, name, amount, billing_cycle, start_date, next_billing_date, color, icon, category, note, user_id FROM subscriptions")
for row in cur.fetchall():
    print(row)

conn.close()
