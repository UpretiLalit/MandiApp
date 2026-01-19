using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ordering.API.Services;
using Ordering.API.DTOs;

namespace Ordering.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous] // Temporarily allow anonymous for testing
public class CartController : ControllerBase
{
    private readonly ICartService _cartService;

    public CartController(ICartService cartService)
    {
        _cartService = cartService;
    }

    [HttpGet]
    public async Task<IActionResult> GetCart()
    {
        var buyerId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (buyerId == null)
            buyerId = "test-buyer-001"; // Dev testing fallback

        var cart = await _cartService.GetCartAsync(buyerId);
        return Ok(cart);
    }

    [HttpPost("add")]
    public async Task<IActionResult> AddToCart([FromBody] AddToCartRequest request)
    {
        var buyerId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (buyerId == null)
            buyerId = "test-buyer-001"; // Dev testing fallback

        var cartItem = await _cartService.AddToCartAsync(buyerId, request);
        return Ok(cartItem);
    }

    [HttpPut("update/{cartItemId}")]
    public async Task<IActionResult> UpdateCartItem(int cartItemId, [FromQuery] int quantity)
    {
        var buyerId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (buyerId == null)
            buyerId = "test-buyer-001"; // Dev testing fallback

        var success = await _cartService.UpdateCartItemAsync(buyerId, cartItemId, quantity);
        if (!success)
            return NotFound();

        return Ok(new { message = "Cart item updated" });
    }

    [HttpDelete("remove/{cartItemId}")]
    public async Task<IActionResult> RemoveFromCart(int cartItemId)
    {
        var buyerId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (buyerId == null)
            buyerId = "test-buyer-001"; // Dev testing fallback

        var success = await _cartService.RemoveFromCartAsync(buyerId, cartItemId);
        if (!success)
            return NotFound();

        return Ok(new { message = "Item removed from cart" });
    }

    [HttpDelete("clear")]
    public async Task<IActionResult> ClearCart()
    {
        var buyerId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (buyerId == null)
            buyerId = "test-buyer-001"; // Dev testing fallback

        await _cartService.ClearCartAsync(buyerId);
        return Ok(new { message = "Cart cleared" });
    }
}
