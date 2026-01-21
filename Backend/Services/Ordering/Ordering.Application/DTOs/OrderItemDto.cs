namespace Ordering.Application.DTOs;

public class OrderItemDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public string Currency { get; set; } = "INR";
    public int Quantity { get; set; }
    public decimal TotalPrice { get; set; }
}
