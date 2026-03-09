from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey, Float, Boolean, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
import datetime
import enum
import os
from dotenv import load_dotenv

# Load biến môi trường
load_dotenv()

# Định nghĩa các vai trò trong hệ thống
class UserRole(enum.Enum):
    STUDENT = "student"
    TEACHER = "teacher"
    ADMIN = "admin"

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./attendance.db")

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    phone = Column(String, nullable=True)
    password_hash = Column(String) 
    role = Column(String, default=UserRole.STUDENT.value)
    is_active = Column(Boolean, default=True)
    reset_code = Column(String, nullable=True) # Mã OTP để reset MK
    reset_expiry = Column(DateTime, nullable=True) # Thời gian hết hạn OTP
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Quan hệ với bảng điểm danh nếu là sinh viên
    attendance_logs = relationship("AttendanceLog", back_populates="user")

class AttendanceLog(Base):
    __tablename__ = "attendance_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    liveness_score = Column(Float)
    is_spoof = Column(Boolean, default=False)
    session_id = Column(String)

    user = relationship("User", back_populates="attendance_logs")

# Tạo tables
Base.metadata.create_all(bind=engine)
