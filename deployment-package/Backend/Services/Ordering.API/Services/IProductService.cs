namespace Ordering.API.Services;

public interface IProductService
{
    Task<IEnumerable<object>> GetAllProductsAsync();
    Task<object?> GetProductByIdAsync(int id);
    Task<IEnumerable<object>> GetProductsByCategoryAsync(string category);
}
