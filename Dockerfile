# 1단계: 빌드 스테이지
# gradle 공식 이미지를 사용하여 빌드 진행
FROM gradle:7.6-jdk17 AS build
WORKDIR /app
COPY . .
RUN chmod +x ./gradlew
RUN ./gradlew clean bootJar --no-daemon

# 2단계: 실행 스테이지
# openjdk 대신 유지보수가 잘 되는 eclipse-temurin 이미지를 사용합니다.
FROM eclipse-temurin:17-jdk-jammy
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]