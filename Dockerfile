# 1. 자바 17 버전 환경 준비 (본인 프로젝트 자바 버전에 맞춰 변경 가능)
FROM openjdk:17-jdk-slim

# 2. JAR 파일을 컨테이너 내부로 복사
# build/libs/ 폴더 안에 생성된 JAR 파일 이름을 정확히 적어주세요.
ARG JAR_FILE=build/libs/*.jar
COPY ${JAR_FILE} app.jar

# 3. 서버 실행
ENTRYPOINT ["java", "-jar", "/app.jar"]