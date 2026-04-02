# Sử dụng image Python 3.11-slim làm base image
FROM python:3.11-slim

# Thiết lập working directory trong container
WORKDIR /app

# Sao chép file requirements.txt vào container và cài đặt dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Sao chép toàn bộ mã nguồn của ứng dụng vào container
COPY . .

# Expose port 8000 (port mặc định của Uvicorn)
EXPOSE 8000

# Khởi động ứng dụng bằng Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
