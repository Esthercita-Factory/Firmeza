FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

# Copiar archivos de proyecto para restaurar dependencias
COPY Firmeza.slnx ./
COPY src/Firmeza.Domain/Firmeza.Domain.csproj src/Firmeza.Domain/
COPY src/Firmeza.Application/Firmeza.Application.csproj src/Firmeza.Application/
COPY src/Firmeza.Infrastructure/Firmeza.Infrastructure.csproj src/Firmeza.Infrastructure/
COPY src/Firmeza.Api/Firmeza.Api.csproj src/Firmeza.Api/

RUN dotnet restore src/Firmeza.Api/Firmeza.Api.csproj

# Copiar código fuente y compilar
COPY src/Firmeza.Domain/ src/Firmeza.Domain/
COPY src/Firmeza.Application/ src/Firmeza.Application/
COPY src/Firmeza.Infrastructure/ src/Firmeza.Infrastructure/
COPY src/Firmeza.Api/ src/Firmeza.Api/

RUN dotnet publish src/Firmeza.Api/Firmeza.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

# Etapa final de runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:5134
EXPOSE 5134

ENTRYPOINT ["dotnet", "Firmeza.Api.dll"]
