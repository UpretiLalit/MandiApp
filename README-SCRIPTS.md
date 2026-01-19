# MandiApp Development Scripts

This folder contains scripts to start the development environment easily.

## 🚀 Quick Start

### Option 1: Simple Start (Recommended)
Opens backend and frontend in separate PowerShell windows:
```powershell
.\start-simple.ps1
```

### Option 2: Combined Start
Runs both services in the same terminal:
```powershell
.\start-dev.ps1
```

## 📝 Manual Start

If you prefer to start services manually:

### Backend API
```powershell
cd Backend\Services\Ordering.API
dotnet run
```

### Frontend UI
```powershell
cd Frontend
ng serve
```

## 🔧 One-Time Setup (Already Done)

The following has been permanently added to your system PATH:
- `C:\Program Files\dotnet` - .NET SDK
- `C:\Users\lalit\AppData\Roaming\npm` - Node.js global packages (Angular CLI)

You can now use `dotnet` and `ng` commands from any terminal without additional setup.

## 🌐 Access URLs

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:5002
- **API Swagger**: http://localhost:5002/swagger

## 💡 Tips

- Use `start-simple.ps1` for easier debugging (each service in its own window)
- Press `Ctrl+C` in each terminal to stop services
- Frontend auto-reloads on file changes
- Backend requires manual restart after code changes
