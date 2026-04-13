# app/core/utils.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from bson import ObjectId
from app.core.config import settings
from app.db import users_collection, token_blacklist_collection
from app.models.user import User
from app.core.security import SECRET_KEY, ALGORITHM
from typing import Optional
from datetime import datetime, timedelta
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType
from app.core.config import settings
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")
conf = ConnectionConfig(
    MAIL_USERNAME = settings.EMAIL_USER,
    MAIL_PASSWORD = settings.EMAIL_PASSWORD,
    MAIL_FROM = settings.EMAIL_USER,
    MAIL_PORT = settings.EMAIL_PORT,
    MAIL_SERVER = settings.EMAIL_SERVER,
    MAIL_FROM_NAME = "Family Expense",  # Thêm dòng này để đổi tên hiển thị
    MAIL_STARTTLS = True,
    MAIL_SSL_TLS = False,
    USE_CREDENTIALS = True,
    VALIDATE_CERTS = True
)

async def send_verify_email(email: str, otp: str):
    message = MessageSchema(
        subject="Xác thực tài khoản Family Expense",
        recipients=[email],
        body=f"Mã xác thực của bạn là: {otp}. Tài khoản sẽ bị xóa sau 24h nếu không xác thực.",
        subtype=MessageType.plain
    )
    fm = FastMail(conf)
    await fm.send_message(message)
async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        jti: str = payload.get("jti")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    blacklisted = await token_blacklist_collection.find_one({"jti": jti})
    if blacklisted:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has been invalidated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    # user_id là string, convert sang ObjectId để truy vấn
    user_doc = await users_collection.find_one({"_id": ObjectId(user_id)})
    if user_doc is None:
        raise credentials_exception

    # Convert _id -> str
    user_doc["_id"] = str(user_doc["_id"])

    return User(**user_doc)

def check_role(required_role: str):
    async def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role != required_role:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
    return role_checker

async def send_reset_email(email_to: str, reset_link: str):
    # Sử dụng MessageSchema và FastMail giống hàm verify
    message = MessageSchema(
        subject="Đặt lại mật khẩu - Family Expense",
        recipients=[email_to],
        body=f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2 style="color: #4f46e5;">Khôi phục mật khẩu</h2>
                <p>Chào bạn, chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
                <p>Vui lòng click vào nút bên dưới để tiến hành (Link có hiệu lực trong 15 phút):</p>
                <div style="margin: 20px 0;">
                    <a href="{reset_link}" 
                       style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                       Đặt lại mật khẩu
                    </a>
                </div>
                <p>Nếu bạn không yêu cầu điều này, hãy bỏ qua email này.</p>
                <p>Trân trọng,<br>Đội ngũ Family Expense</p>
            </body>
        </html>
        """,
        subtype=MessageType.html
    )
    fm = FastMail(conf)
    await fm.send_message(message)

async def send_email(to_email: str, subject: str, body: str):
    from_email = settings.EMAIL_USER
    password = settings.EMAIL_PASSWORD

    msg = MIMEMultipart()
    msg['From'] = from_email
    msg['To'] = to_email
    msg['Subject'] = subject

    msg.attach(MIMEText(body, 'plain'))

    try:
        server = smtplib.SMTP(settings.EMAIL_SERVER, settings.EMAIL_PORT)
        server.starttls()
        server.login(from_email, password)
        text = msg.as_string()
        server.sendmail(from_email, to_email, text)
        server.quit()
    except Exception as e:
        print(f"Failed to send email to {to_email}: {e}")
