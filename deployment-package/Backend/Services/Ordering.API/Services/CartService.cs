using Microsoft.EntityFrameworkCore;
using Ordering.API.Data;
using Ordering.API.Models;
using Ordering.API.DTOs;

namespace Ordering.API.Services;

public class CartService : ICartService
{
    private readonly OrderingDbContext _context;

    public CartService(OrderingDbContext context)
    {
        _context = context;
    }

    public async Task<Cart> GetCartAsync(string buyerId)
    {
        var cart = await _context.Carts
            .Include(c => c.CartItems)
            .FirstOrDefaultAsync(c => c.BuyerId == buyerId);

        if (cart == null)
        {
            cart = new Cart { BuyerId = buyerId };
            _context.Carts.Add(cart);
            await _context.SaveChangesAsync();
        }

        return cart;
    }

    public async Task<CartItem> AddToCartAsync(string buyerId, AddToCartRequest request)
    {
        var cart = await GetCartAsync(buyerId);

        var existingItem = cart.CartItems.FirstOrDefault(ci => ci.ProductId == request.ProductId);

        if (existingItem != null)
        {
            existingItem.Quantity += request.Quantity;
            existingItem.UnitPrice = request.UnitPrice;
        }
        else
        {
            existingItem = new CartItem
            {
                CartId = cart.Id,
                ProductId = request.ProductId,
                ProductName = request.ProductName,
                VendorId = request.VendorId,
                Quantity = request.Quantity,
                UnitPrice = request.UnitPrice
            };
            _context.CartItems.Add(existingItem);
        }

        cart.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return existingItem;
    }

    public async Task<bool> UpdateCartItemAsync(string buyerId, int cartItemId, int quantity)
    {
        var cart = await GetCartAsync(buyerId);
        var cartItem = cart.CartItems.FirstOrDefault(ci => ci.Id == cartItemId);

        if (cartItem == null)
            return false;

        cartItem.Quantity = quantity;
        cart.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> RemoveFromCartAsync(string buyerId, int cartItemId)
    {
        var cart = await GetCartAsync(buyerId);
        var cartItem = cart.CartItems.FirstOrDefault(ci => ci.Id == cartItemId);

        if (cartItem == null)
            return false;

        _context.CartItems.Remove(cartItem);
        cart.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task ClearCartAsync(string buyerId)
    {
        var cart = await GetCartAsync(buyerId);
        _context.CartItems.RemoveRange(cart.CartItems);
        await _context.SaveChangesAsync();
    }
}
