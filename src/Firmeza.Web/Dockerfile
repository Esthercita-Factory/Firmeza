# Etapa 1: Compilar Angular Frontend
FROM node:22-alpine AS angular-build
WORKDIR /app/ClientApp

COPY src/Firmeza.Web/ClientApp/package*.json ./
RUN npm install

COPY src/Firmeza.Web/ClientApp/ ./
RUN npm run build

# Etapa 2: Compilar el host de ASP.NET Core
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS dotnet-build
WORKDIR /app

COPY src/Firmeza.Web/Firmeza.Web.csproj src/Firmeza.Web/
RUN dotnet restore src/Firmeza.Web/Firmeza.Web.csproj

COPY src/Firmeza.Web/ src/Firmeza.Web/
# Reemplazar/asegurar wwwroot con los archivos finales generados por Angular
COPY --from=angular-build /app/wwwroot/ /app/src/Firmeza.Web/wwwroot/

RUN dotnet publish src/Firmeza.Web/Firmeza.Web.csproj -c Release -o /app/publish /p:UseAppHost=false

# Etapa 3: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=dotnet-build /app/publish .

ENV ASPNETCORE_URLS=http://+:5099
EXPOSE 5099

ENTRYPOINT ["dotnet", "Firmeza.Web.dll"]
