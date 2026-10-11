/** Canteen as returned by the /public endpoints. */
export interface Canteen {
  id: string;
  name: string;
  ownerName: string | null;
  mailid: string | null;
  phoneNumber: string | null;
  address: string | null;
  url: string | null;
  imageUrl: string | null;
  startTime: string | null;
  endTime: string | null;
  rating: number;
  ratingCount: number;
}

/** Editable canteen fields. The backend only updates the fields that are sent. */
export interface CanteenInput {
  name: string;
  mailid?: string;
  phoneNumber?: string;
  address?: string;
  url?: string;
  imageUrl?: string;
}

/** A canteen the signed-in owner owns, from GET /owner/canteens. */
export interface OwnedCanteen {
  id: string;
  name: string;
  address: string | null;
  imageUrl: string | null;
  status: string | null;
  rating: number;
  ratingCount: number;
}
