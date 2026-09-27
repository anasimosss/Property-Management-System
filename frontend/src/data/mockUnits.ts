export type UnitStatus = 'Occupied' | 'Vacant' | 'Maintenance';

export interface MockUnit {
  id: number;
  unitNumber: string;
  propertyId: number;
  propertyName: string;
  buildingId: number;
  buildingName: string;
  location: string;
  floor: number;
  unitType: string;
  bedrooms: number;
  bathrooms: number;
  monthlyRent: number;
  status: UnitStatus;
  tenantName?: string;
}

export const mockUnits: MockUnit[] = [
  { id: 1, unitNumber: 'A-101', propertyId: 1, propertyName: 'Sunset Apartments', buildingId: 1, buildingName: 'Block A', location: 'Bole, Addis Ababa', floor: 1, unitType: 'Apartment', bedrooms: 2, bathrooms: 2, monthlyRent: 1450, status: 'Occupied', tenantName: 'Marta Bekele' },
  { id: 2, unitNumber: 'A-102', propertyId: 1, propertyName: 'Sunset Apartments', buildingId: 1, buildingName: 'Block A', location: 'Bole, Addis Ababa', floor: 1, unitType: 'Apartment', bedrooms: 1, bathrooms: 1, monthlyRent: 980, status: 'Occupied', tenantName: 'Dawit Tesfaye' },
  { id: 3, unitNumber: 'A-201', propertyId: 1, propertyName: 'Sunset Apartments', buildingId: 1, buildingName: 'Block A', location: 'Bole, Addis Ababa', floor: 2, unitType: 'Apartment', bedrooms: 3, bathrooms: 2, monthlyRent: 1820, status: 'Vacant' },
  { id: 4, unitNumber: 'B-101', propertyId: 1, propertyName: 'Sunset Apartments', buildingId: 2, buildingName: 'Block B', location: 'Bole, Addis Ababa', floor: 1, unitType: 'Apartment', bedrooms: 2, bathrooms: 2, monthlyRent: 1480, status: 'Occupied', tenantName: 'Selamawit Yohannes' },
  { id: 5, unitNumber: 'B-202', propertyId: 1, propertyName: 'Sunset Apartments', buildingId: 2, buildingName: 'Block B', location: 'Bole, Addis Ababa', floor: 2, unitType: 'Apartment', bedrooms: 2, bathrooms: 1, monthlyRent: 1280, status: 'Maintenance' },
  { id: 6, unitNumber: 'T-A01', propertyId: 2, propertyName: 'Riverside Heights', buildingId: 4, buildingName: 'Tower A', location: 'Kazanchis, Addis Ababa', floor: 1, unitType: 'Apartment', bedrooms: 2, bathrooms: 2, monthlyRent: 1650, status: 'Occupied', tenantName: 'Yonas Alemu' },
  { id: 7, unitNumber: 'T-A04', propertyId: 2, propertyName: 'Riverside Heights', buildingId: 4, buildingName: 'Tower A', location: 'Kazanchis, Addis Ababa', floor: 4, unitType: 'Penthouse', bedrooms: 3, bathrooms: 3, monthlyRent: 2800, status: 'Vacant' },
  { id: 8, unitNumber: 'T-B02', propertyId: 2, propertyName: 'Riverside Heights', buildingId: 5, buildingName: 'Tower B', location: 'Kazanchis, Addis Ababa', floor: 2, unitType: 'Apartment', bedrooms: 2, bathrooms: 2, monthlyRent: 1720, status: 'Occupied', tenantName: 'Hana Girma' },
  { id: 9, unitNumber: 'OF-301', propertyId: 3, propertyName: 'Downtown Office Complex', buildingId: 6, buildingName: 'Main Office Building', location: 'Piazza, Addis Ababa', floor: 3, unitType: 'Office Suite', bedrooms: 0, bathrooms: 1, monthlyRent: 3200, status: 'Occupied', tenantName: 'Aster Consulting' },
  { id: 10, unitNumber: 'OF-402', propertyId: 3, propertyName: 'Downtown Office Complex', buildingId: 6, buildingName: 'Main Office Building', location: 'Piazza, Addis Ababa', floor: 4, unitType: 'Office Suite', bedrooms: 0, bathrooms: 1, monthlyRent: 2950, status: 'Vacant' },
  { id: 11, unitNumber: 'GE-102', propertyId: 4, propertyName: 'Bole Garden Residences', buildingId: 7, buildingName: 'Garden East', location: 'Bole, Addis Ababa', floor: 1, unitType: 'Apartment', bedrooms: 2, bathrooms: 2, monthlyRent: 1560, status: 'Occupied', tenantName: 'Rahel Worku' },
  { id: 12, unitNumber: 'GW-204', propertyId: 4, propertyName: 'Bole Garden Residences', buildingId: 8, buildingName: 'Garden West', location: 'Bole, Addis Ababa', floor: 2, unitType: 'Apartment', bedrooms: 3, bathrooms: 2, monthlyRent: 1960, status: 'Maintenance' },
  { id: 13, unitNumber: 'BT-501', propertyId: 5, propertyName: 'Kazanchis Business Center', buildingId: 9, buildingName: 'Business Tower', location: 'Kazanchis, Addis Ababa', floor: 5, unitType: 'Office Suite', bedrooms: 0, bathrooms: 2, monthlyRent: 4100, status: 'Occupied', tenantName: 'Nile Creative Studio' },
  { id: 14, unitNumber: 'AN-103', propertyId: 5, propertyName: 'Kazanchis Business Center', buildingId: 10, buildingName: 'Annex Building', location: 'Kazanchis, Addis Ababa', floor: 1, unitType: 'Retail Space', bedrooms: 0, bathrooms: 1, monthlyRent: 2500, status: 'Vacant' },
  { id: 15, unitNumber: 'FA-107', propertyId: 6, propertyName: 'Saris Family Homes', buildingId: 11, buildingName: 'Family Block A', location: 'Saris, Addis Ababa', floor: 1, unitType: 'Townhouse', bedrooms: 3, bathrooms: 2, monthlyRent: 1250, status: 'Occupied', tenantName: 'Tigist Kebede' },
  { id: 16, unitNumber: 'FB-205', propertyId: 6, propertyName: 'Saris Family Homes', buildingId: 12, buildingName: 'Family Block B', location: 'Saris, Addis Ababa', floor: 2, unitType: 'Townhouse', bedrooms: 3, bathrooms: 2, monthlyRent: 1250, status: 'Vacant' },
];
