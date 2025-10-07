# ===== build =====
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY demo/pom.xml ./pom.xml
RUN mvn -B -q -DskipTests dependency:go-offline
COPY demo/src ./src
RUN mvn -B -q -DskipTests package

# ===== runtime =====
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
ENV JAVA_TOOL_OPTIONS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75"
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
