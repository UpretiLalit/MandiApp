FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy shared projects (relative to Backend/Services/Logistics.Hub)
COPY ["../../Shared/Shared.Domain/Shared.Domain.csproj", "Shared/Shared.Domain/"]
COPY ["../../Shared/Shared.Infrastructure/Shared.Infrastructure.csproj", "Shared/Shared.Infrastructure/"]

# Copy Logistics Hub project
COPY ["Logistics.Hub.csproj", "Logistics.Hub/"]

# Restore
RUN dotnet restore "Logistics.Hub/Logistics.Hub.csproj"

# Copy everything
COPY ../../Shared/ Shared/
COPY . Logistics.Hub/

# Build and publish
WORKDIR "/src/Logistics.Hub"
RUN dotnet publish -c Release -o /app/publish

# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .

# Render uses PORT environment variable
ENV ASPNETCORE_URLS=http://+:${PORT:-8080}

ENTRYPOINT ["dotnet", "Logistics.Hub.dll"]
