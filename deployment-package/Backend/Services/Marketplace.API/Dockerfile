FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["Marketplace.API.csproj", "./"]
COPY ["../../Shared/Shared.Domain/Shared.Domain.csproj", "../Shared/Shared.Domain/"]
COPY ["../../Shared/Shared.Infrastructure/Shared.Infrastructure.csproj", "../Shared/Shared.Infrastructure/"]
RUN dotnet restore "Marketplace.API.csproj"
COPY . .
WORKDIR "/src"
RUN dotnet build "Marketplace.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Marketplace.API.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Marketplace.API.dll"]
