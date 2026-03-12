# Stage 1: Build file JAR bằng Maven
FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /app
# Copy file pom.xml và source code vào container
COPY pom.xml .
COPY src ./src
# Build project và bỏ qua test để chạy nhanh hơn
RUN mvn clean package -DskipTests

# Stage 2: Chạy ứng dụng bằng JRE siêu nhẹ
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
# Copy file JAR từ Stage 1 sang
COPY --from=builder /app/target/*.jar app.jar

# Expose port mặc định của Spring Boot
EXPOSE 8080

# Lệnh chạy ứng dụng
ENTRYPOINT ["java", "-jar", "app.jar"]