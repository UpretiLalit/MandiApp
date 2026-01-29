FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy shared projects (relative to Backend/Services/Ordering.API)
COPY ["../../Shared/Shared.Domain/Shared.Domain.csproj", "Shared/Shared.Domain/"]
COPY ["../../Shared/Shared.Infrastructure/Shared.Infrastructure.csproj", "Shared/Shared.Infrastructure/"]

# Copy Ordering API project
COPY ["Ordering.API.csproj", "Ordering.API/"]

# Restore
RUN dotnet restore "Ordering.API/Ordering.API.csproj"

# Copy everything
COPY ../../Shared/ Shared/
COPY . Ordering.API/

# Build and publish
WORKDIR "/src/Ordering.API"
RUN dotnet publish -c Release -o /app/publish

# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .

# Render uses PORT environment variable
ENV ASPNETCORE_URLS=http://+:${PORT:-8080}

ENTRYPOINT ["dotnet", "Ordering.API.dll"]
