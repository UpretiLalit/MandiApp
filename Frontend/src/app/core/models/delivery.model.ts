export interface Delivery {
  id: number;
  orderId: number;
  transporterId: string;
  buyerId: string;
  status: DeliveryStatus;
  pickupAddress: string;
  deliveryAddress: string;
  assignedAt: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  qrCodeForDelivery?: string;
}

export interface LocationTracking {
  id: number;
  deliveryId: number;
  latitude: number;
  longitude: number;
  timestamp: string;
  speed?: number;
  accuracy?: number;
}

export interface LocationUpdate {
  deliveryId: number;
  latitude: number;
  longitude: number;
  speed?: number;
  accuracy?: number;
}

export enum DeliveryStatus {
  Assigned = 'Assigned',
  PickedUp = 'PickedUp',
  InTransit = 'InTransit',
  Delivered = 'Delivered',
  Failed = 'Failed'
}
