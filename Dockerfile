FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy shared projects
COPY ["Backend/Shared/Shared.Domain/Shared.Domain.csproj", "Shared/Shared.Domain/"]
COPY ["Backend/Shared/Shared.Infrastructure/Shared.Infrastructure.csproj", "Shared/Shared.Infrastructure/"]

# Copy Marketplace API project
COPY ["Backend/Services/Marketplace.API/Marketplace.API.csproj", "Services/Marketplace.API/"]

# Restore
RUN dotnet restore "Services/Marketplace.API/Marketplace.API.csproj"

# Copy source files
COPY Backend/Shared/ Shared/
COPY Backend/Services/Marketplace.API/ Services/Marketplace.API/

# Build and publish
WORKDIR "/src/Services/Marketplace.API"
RUN dotnet publish -c Release -o /app/publish

# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .

# Render uses PORT environment variable
ENV ASPNETCORE_URLS=http://+:${PORT:-8080}

ENTRYPOINT ["dotnet", "Marketplace.API.dll"]
