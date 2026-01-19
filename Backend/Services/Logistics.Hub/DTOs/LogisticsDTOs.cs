namespace Logistics.Hub.DTOs;

public record CreateDeliveryRequest(
    int OrderId,
    string TransporterId,
    string BuyerId,
    string PickupAddress,
    string DeliveryAddress
);

public record LocationUpdateRequest(
    int DeliveryId,
    double Latitude,
    double Longitude,
    double? Speed = null,
    double? Accuracy = null
);

public record DeliveryStatusUpdateRequest(
    int DeliveryId,
    string Status
);

public record QrConfirmationRequest(
    int DeliveryId,
    string QrCode
);
