using Ordering.API.Models;
using Ordering.API.DTOs;

namespace Ordering.API.Services;

public interface ICartService
{
    Task<Cart> GetCartAsync(string buyerId);
    Task<CartItem> AddToCartAsync(string buyerId, AddToCartRequest request);
    Task<bool> UpdateCartItemAsync(string buyerId, int cartItemId, int quantity);
    Task<bool> RemoveFromCartAsync(string buyerId, int cartItemId);
    Task ClearCartAsync(string buyerId);
}
