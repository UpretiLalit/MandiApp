namespace Marketplace.API.Services;

public interface IPriceService
{
    Task<bool> UpdatePriceAsync(int productId, decimal newPrice, string vendorId);
    Task<IEnumerable<object>> GetPriceHistoryAsync(int productId);
}
