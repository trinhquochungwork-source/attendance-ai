import sqlite3
import pandas as pd
import os

DB_PATH = "attendance.db"

def list_users():
    if not os.path.exists(DB_PATH):
        print("Database chưa được tạo!")
        return
    conn = sqlite3.connect(DB_PATH)
    df = pd.read_sql_query("SELECT id, username, full_name, email, phone, role FROM users", conn)
    print("\n--- DANH SÁCH NGƯỜI DÙNG ---")
    if df.empty:
        print("(Trống)")
    else:
        print(df.to_string(index=False))
    conn.close()

def delete_user():
    list_users()
    user_id = input("\nNhập ID người dùng muốn XÓA (hoặc nhấn Enter để hủy): ")
    if not user_id: return
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
    conn.commit()
    if cursor.rowcount > 0:
        print(f"✅ Đã xóa User ID {user_id} thành công!")
    else:
        print("❌ Không tìm thấy User với ID này.")
    conn.close()

def list_logs():
    conn = sqlite3.connect(DB_PATH)
    df = pd.read_sql_query("SELECT * FROM attendance_logs ORDER BY created_at DESC LIMIT 10", conn)
    print("\n--- NHẬT KÝ ĐIỂM DANH (10 BẢN GHI MỚI NHẤT) ---")
    print(df.to_string(index=False))
    conn.close()

def reset_database():
    confirm = input("⚠️  Bạn có chắc muốn RESET toàn bộ Database (Xóa sạch sành sanh)? (y/n): ")
    if confirm.lower() == 'y':
        if os.path.exists(DB_PATH):
            os.remove(DB_PATH)
            print("✨ Đã xóa database cũ. Hãy khởi động lại backend để tạo mới.")
        else:
            print("Database không tồn tại.")

if __name__ == "__main__":
    while True:
        print("\n" + "="*30)
        print("   CÔNG CỤ QUẢN LÝ TQH DB")
        print("="*30)
        print("1. Xem danh sách User")
        print("2. XÓA một User (theo ID)")
        print("3. Xem nhật ký điểm danh")
        print("4. RESET Database (Xóa hết)")
        print("q. Thoát")
        
        choice = input("\nChọn thao tác (1-4/q): ")
        if choice == '1': list_users()
        elif choice == '2': delete_user()
        elif choice == '3': list_logs()
        elif choice == '4': reset_database()
        elif choice == 'q': break
        else: print("Lựa chọn không hợp lệ!")
