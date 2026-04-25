import sqlite3

def patch_db():
    conn = sqlite3.connect('spendsense.db')
    cursor = conn.cursor()
    
    # Get current columns
    cursor.execute("PRAGMA table_info(users)")
    columns = [row[1] for row in cursor.fetchall()]
    
    new_columns = [
        ("is_verified", "BOOLEAN DEFAULT 0"),
        ("verification_token", "VARCHAR"),
        ("reset_token", "VARCHAR"),
        ("reset_token_expiry", "DATETIME"),
        ("refresh_token", "VARCHAR")
    ]
    
    for col_name, col_type in new_columns:
        if col_name not in columns:
            print(f"Adding column {col_name} to users table...")
            try:
                cursor.execute(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}")
            except Exception as e:
                print(f"Error adding {col_name}: {e}")
    
    conn.commit()
    conn.close()
    print("Database patching complete.")

if __name__ == "__main__":
    patch_db()
