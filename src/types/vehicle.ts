export interface Vehicle {
  _id: string;
  licensePlate: string;
  brand: string;
    type: string;
  status: 'available' | 'rented' | 'maintenance';
  pricePerDay: number;
  year: number;
  color: string;
  images: string[];
}