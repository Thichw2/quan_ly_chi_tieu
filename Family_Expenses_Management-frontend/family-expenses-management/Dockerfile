# Bước 1: Sử dụng Node image làm base image cho việc build ứng dụng
FROM node:18 AS build

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Sao chép package.json và package-lock.json vào container
COPY package*.json ./

# Cài đặt các dependencies
RUN npm install

# Sao chép toàn bộ mã nguồn vào container
COPY . .

# Build ứng dụng với Vite
RUN npm run build

# Bước 2: Dùng một image nhẹ hơn để phục vụ ứng dụng, sử dụng Nginx
FROM nginx:alpine

# Sao chép các tệp build từ bước build vào thư mục phục vụ của Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Mở cổng 80 để phục vụ ứng dụng
EXPOSE 80

# Chạy Nginx
CMD ["nginx", "-g", "daemon off;"]
