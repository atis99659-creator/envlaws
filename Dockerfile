# 1단계: 빌드 (Gradle을 사용하여 JAR 파일 생성)
FROM gradle:7.6-jdk17 AS build
COPY --chown=gradle:gradle . /home/gradle/src
WORKDIR /home/gradle/src
# gradlew에 실행 권한을 주고 빌드 시작
RUN chmod +x ./gradlew
RUN ./gradlew clean bootJar --no-daemon

# 2단계: 실행 (생성된 JAR 실행)
FROM openjdk:17-jdk-slim
EXPOSE 8080
COPY --from=build /home/gradle/src/build/libs/*.jar app.jar
ENTRYPOINT ["java", "-jar", "/app.jar"]