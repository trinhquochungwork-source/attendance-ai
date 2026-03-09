from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from typing import Optional
import base64
import numpy as np
import cv2
import json
import uuid
import random
import datetime

from database import SessionLocal, User, AttendanceLog, UserRole
from ai_engine.face_processor import processor

# --- CONFIGURATION ---
CURRENT_SESSION = str(uuid.uuid4())[:8]

app = FastAPI(
    title="TQH AI Attendance System",
    description="Professional Student Monitoring",
    version="1.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DB CONNECTION ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- SCHEMAS ---
class UserRegister(BaseModel):
    username: str
    password: str
    full_name: str
    email: EmailStr
    phone: str
    role: str = "student"

class UserLogin(BaseModel):
    identifier: str # Chấp nhận Email hoặc Số điện thoại
    password: str

class ForgotPassword(BaseModel):
    identifier: str

class ResetPassword(BaseModel):
    identifier: str
    code: str
    new_password: str

# --- API ENDPOINTS ---

@app.get("/")
def health():
    return {"status": "online", "session": CURRENT_SESSION, "info": "TQH AI System Root"}

@app.get("/api")
def api_root():
    return {"status": "ok", "message": "API Gateway is running. Use /api/login, /api/register, etc."}

@app.post("/api/register")
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    # Kiểm tra trùng lặp
    existing = db.query(User).filter(
        (User.username == user_data.username) | 
        (User.email == user_data.email) | 
        (User.phone == user_data.phone)
    ).first()
    
    if existing:
        return {"status": "error", "message": "Email, SĐT hoặc Tên đăng nhập đã tồn tại!"}
    
    new_user = User(
        username=user_data.username,
        full_name=user_data.full_name,
        email=user_data.email,
        phone=user_data.phone,
        password_hash=user_data.password,
        role=user_data.role
    )
    db.add(new_user)
    db.commit()
    return {"status": "success", "message": "Đăng ký thành công"}

@app.post("/api/login")
async def login(credentials: UserLogin, db: Session = Depends(get_db)):
    # Logic Đăng nhập linh hoạt qua Email hoặc SĐT
    user = db.query(User).filter(
        ((User.email == credentials.identifier) | (User.phone == credentials.identifier)),
        (User.password_hash == credentials.password)
    ).first()
    
    if not user:
        return {"status": "error", "message": "Tài khoản hoặc Mật khẩu không chính xác!"}
        
    return {
        "status": "success", 
        "user": {
            "username": user.username,
            "full_name": user.full_name,
            "role": user.role,
            "email": user.email,
            "phone": user.phone
        }
    }

@app.post("/api/forgot-password")
async def forgot_password(data: ForgotPassword, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        (User.email == data.identifier) | (User.phone == data.identifier)
    ).first()
    
    if not user:
        return {"status": "error", "message": "Không tìm thấy tài khoản với thông tin này!"}
    
    # Tạo mã OTP 6 số
    otp = str(random.randint(100000, 999999))
    user.reset_code = otp
    user.reset_expiry = datetime.datetime.utcnow() + datetime.timedelta(minutes=10)
    db.commit()
    
    # GIẢ LẬP GỬI EMAIL/SMS: In ra console để dev copy
    print(f"\n[DEMO AUTH] MÃ XÁC THỰC CỦA {user.full_name} LÀ: {otp}\n")
    
    return {"status": "success", "message": "Mã xác thực đã được gửi!"}

@app.post("/api/reset-password")
async def reset_password(data: ResetPassword, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        (User.email == data.identifier) | (User.phone == data.identifier)
    ).first()
    
    if not user or user.reset_code != data.code:
        return {"status": "error", "message": "Mã xác thực không chính xác!"}
    
    if user.reset_expiry < datetime.datetime.utcnow():
        return {"status": "error", "message": "Mã xác thực đã hết hạn!"}
    
    # Cập nhật mật khẩu mới
    user.password_hash = data.new_password
    user.reset_code = None # Xóa code sau khi dùng
    user.reset_expiry = None
    db.commit()
    
    return {"status": "success", "message": "Mật khẩu đã được cập nhật thành công!"}

# --- AI WEBSOCKET ENGINE ---

@app.websocket("/ws/stream")
async def websocket_endpoint(websocket: WebSocket, db: Session = Depends(get_db)):
    await websocket.accept()
    print(f"INFO: New streaming session started: {CURRENT_SESSION}")
    
    try:
        while True:
            data = await websocket.receive_text()
            try:
                # 1. Giải mã ảnh
                encoded_data = data.split(',')[1]
                nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
                img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                
                # 2. Xử lý AI
                ai_result = processor.process_frame(img)
                liveness = ai_result.get("liveness_score", 0.0)
                recognized_user = ai_result.get("recognized_user", "Unknown")
                
                # 3. Ghi log nếu nhận diện được
                user_found = db.query(User).filter(User.full_name == recognized_user).first()
                if user_found:
                    db.add(AttendanceLog(
                        user_id=user_found.id,
                        liveness_score=liveness,
                        is_spoof=(liveness < 0.7),
                        session_id=CURRENT_SESSION
                    ))
                    db.commit()
                
                # 4. Phản hồi Real-time
                await websocket.send_text(json.dumps({
                    "liveness_score": liveness,
                    "recognized_user": recognized_user,
                    "role": user_found.role if user_found else "guest",
                    "status": ai_result.get("status", "Scanning"),
                    "session": CURRENT_SESSION
                }))

            except Exception as e:
                print(f"WARN: Frame error: {e}")
                
    except WebSocketDisconnect:
        print("INFO: Client disconnected")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
