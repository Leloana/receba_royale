# ===== stage de build =====
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# baixar deps em cache
COPY pom.xml .
RUN mvn -B -q -DskipTests dependency:go-offline

# copiar código e empacotar o jar "fat" do Spring Boot
COPY src ./src
RUN mvn -B -q -DskipTests package

# ===== stage de runtime =====
FROM eclipse-temurin:21-jre
WORKDIR /app

# copia o .jar gerado pelo stage de build
COPY --from=build /app/target/*.jar app.jar

# boas flags padrão de container
ENV JAVA_TOOL_OPTIONS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75"
ENV SERVER_PORT=8080
EXPOSE 8080

# healthcheck (ajuste a rota se não usa actuator)
HEALTHCHECK --interval=30s --timeout=5s --retries=5 \
  CMD wget -qO- http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java","-jar","/app/app.jar"]
