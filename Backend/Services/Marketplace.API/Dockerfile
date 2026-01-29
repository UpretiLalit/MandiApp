FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy shared projects (relative to Backend/Services/Marketplace.API)
COPY ["../../Shared/Shared.Domain/Shared.Domain.csproj", "Shared/Shared.Domain/"]
COPY ["../../Shared/Shared.Infrastructure/Shared.Infrastructure.csproj", "Shared/Shared.Infrastructure/"]

# Copy Marketplace API project
COPY ["Marketplace.API.csproj", "Marketplace.API/"]

# Restore
RUN dotnet restore "Marketplace.API/Marketplace.API.csproj"

# Copy everything
COPY ../../Shared/ Shared/
COPY . Marketplace.API/

# Build and publish
WORKDIR "/src/Marketplace.API"
RUN dotnet publish -c Release -o /app/publish

# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .

# Render uses PORT environment variable
ENV ASPNETCORE_URLS=http://+:${PORT:-8080}

ENTRYPOINT ["dotnet", "Marketplace.API.dll"]
