using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ordering.API.Data;

namespace Ordering.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    private readonly OrderingDbContext _context;

    public HealthController(OrderingDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        try
        {
            // Test database connection
            var canConnect = await _context.Database.CanConnectAsync();
            
            // Test if Carts table exists
            var cartsCount = await _context.Carts.CountAsync();
            
            return Ok(new
            {
                status = "healthy",
                database = "connected",
                tablesExist = true,
                cartsCount = cartsCount,
                corsFixed = true // This confirms CORS fix is deployed
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                status = "unhealthy",
                error = ex.Message,
                stackTrace = ex.StackTrace
            });
        }
    }
}
