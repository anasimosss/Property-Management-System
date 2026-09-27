export type BuildingStatus = 'Active' | 'Needs attention' | 'Inactive';

export interface MockBuilding {
  id: number;
  propertyId: number;
  propertyName: string;
  location: string;
  name: string;
  floors: number;
  totalUnits: number;
  occupiedUnits: number;
  status: BuildingStatus;
}

export const mockBuildings: MockBuilding[] = [
  { id: 1, propertyId: 1, propertyName: 'Sunset Apartments', location: 'Bole, Addis Ababa', name: 'Block A', floors: 5, totalUnits: 16, occupiedUnits: 15, status: 'Active' },
  { id: 2, propertyId: 1, propertyName: 'Sunset Apartments', location: 'Bole, Addis Ababa', name: 'Block B', floors: 5, totalUnits: 14, occupiedUnits: 12, status: 'Active' },
  { id: 3, propertyId: 1, propertyName: 'Sunset Apartments', location: 'Bole, Addis Ababa', name: 'Block C', floors: 4, totalUnits: 12, occupiedUnits: 11, status: 'Active' },
  { id: 4, propertyId: 2, propertyName: 'Riverside Heights', location: 'Kazanchis, Addis Ababa', name: 'Tower A', floors: 8, totalUnits: 16, occupiedUnits: 14, status: 'Active' },
  { id: 5, propertyId: 2, propertyName: 'Riverside Heights', location: 'Kazanchis, Addis Ababa', name: 'Tower B', floors: 8, totalUnits: 12, occupiedUnits: 10, status: 'Needs attention' },
  { id: 6, propertyId: 3, propertyName: 'Downtown Office Complex', location: 'Piazza, Addis Ababa', name: 'Main Office Building', floors: 10, totalUnits: 16, occupiedUnits: 13, status: 'Active' },
  { id: 7, propertyId: 4, propertyName: 'Bole Garden Residences', location: 'Bole, Addis Ababa', name: 'Garden East', floors: 6, totalUnits: 18, occupiedUnits: 16, status: 'Active' },
  { id: 8, propertyId: 4, propertyName: 'Bole Garden Residences', location: 'Bole, Addis Ababa', name: 'Garden West', floors: 6, totalUnits: 18, occupiedUnits: 15, status: 'Needs attention' },
  { id: 9, propertyId: 5, propertyName: 'Kazanchis Business Center', location: 'Kazanchis, Addis Ababa', name: 'Business Tower', floors: 9, totalUnits: 12, occupiedUnits: 9, status: 'Needs attention' },
  { id: 10, propertyId: 5, propertyName: 'Kazanchis Business Center', location: 'Kazanchis, Addis Ababa', name: 'Annex Building', floors: 4, totalUnits: 12, occupiedUnits: 9, status: 'Active' },
  { id: 11, propertyId: 6, propertyName: 'Saris Family Homes', location: 'Saris, Addis Ababa', name: 'Family Block A', floors: 4, totalUnits: 20, occupiedUnits: 15, status: 'Active' },
  { id: 12, propertyId: 6, propertyName: 'Saris Family Homes', location: 'Saris, Addis Ababa', name: 'Family Block B', floors: 4, totalUnits: 20, occupiedUnits: 14, status: 'Inactive' },
];
