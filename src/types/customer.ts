export interface ImageObject {
  url: string;
  public_id?: string;
}

export interface Customer {
  _id: string;
  name: string;
  phone?: string;
  cccd?: string;
  driverLicense?: string;
  notes?: string;
  cccdImage?: ImageObject | string | null;
  driverLicenseImage?: ImageObject | string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedResponse<T> {
  page: number;
  limit: number;
  total: number;
  pages: number;
  data: T[];
}
