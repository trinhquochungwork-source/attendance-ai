import sqlite3

def migrate():
    try:
        conn = sqlite3.connect('attendance.db')
        cursor = conn.cursor()
        
        print("Đang nâng cấp cơ sở dữ liệu...")
        
        # Thêm cột reset_code
        try:
            cursor.execute("ALTER TABLE users ADD COLUMN reset_code VARCHAR")
            print("- Đã thêm cột reset_code")
        except sqlite3.OperationalError:
            print("- Cột reset_code đã tồn tại")
            
        # Thêm cột reset_expiry
        try:
            cursor.execute("ALTER TABLE users ADD COLUMN reset_expiry DATETIME")
            print("- Đã thêm cột reset_expiry")
        except sqlite3.OperationalError:
            print("- Cột reset_expiry đã tồn tại")
            
        conn.commit()
        conn.close()
        print("\n✅ Nâng cấp hoàn tất! Bạn có thể thử lại tính năng Quên mật khẩu.")
    except Exception as e:
        print(f"❌ Lỗi: {e}")

if __name__ == "__main__":
    migrate()
