export type PropertyType = 'Residential' | 'Commercial' | 'Mixed';
export type PropertyStatus = 'Active' | 'Needs attention' | 'Inactive';

export interface MockProperty {
  id: number;
  name: string;
  location: string;
  address: string;
  type: PropertyType;
  buildings: number;
  totalUnits: number;
  occupiedUnits: number;
  monthlyIncome: number;
  status: PropertyStatus;
}

export const mockProperties: MockProperty[] = [
  {
    id: 1,
    name: 'Sunset Apartments',
    location: 'Bole, Addis Ababa',
    address: 'Bole Road, near Atlas',
    type: 'Residential',
    buildings: 3,
    totalUnits: 42,
    occupiedUnits: 38,
    monthlyIncome: 18420,
    status: 'Active',
  },
  {
    id: 2,
    name: 'Riverside Heights',
    location: 'Kazanchis, Addis Ababa',
    address: 'Riverside Avenue',
    type: 'Residential',
    buildings: 2,
    totalUnits: 28,
    occupiedUnits: 24,
    monthlyIncome: 12760,
    status: 'Active',
  },
  {
    id: 3,
    name: 'Downtown Office Complex',
    location: 'Piazza, Addis Ababa',
    address: 'Churchill Avenue',
    type: 'Commercial',
    buildings: 1,
    totalUnits: 16,
    occupiedUnits: 13,
    monthlyIncome: 24980,
    status: 'Needs attention',
  },
  {
    id: 4,
    name: 'Bole Garden Residences',
    location: 'Bole, Addis Ababa',
    address: 'Cape Verde Street',
    type: 'Mixed',
    buildings: 2,
    totalUnits: 36,
    occupiedUnits: 31,
    monthlyIncome: 21640,
    status: 'Active',
  },
  {
    id: 5,
    name: 'Kazanchis Business Center',
    location: 'Kazanchis, Addis Ababa',
    address: 'Africa Avenue',
    type: 'Commercial',
    buildings: 2,
    totalUnits: 24,
    occupiedUnits: 18,
    monthlyIncome: 19800,
    status: 'Needs attention',
  },
  {
    id: 6,
    name: 'Saris Family Homes',
    location: 'Saris, Addis Ababa',
    address: 'Saris Ring Road',
    type: 'Residential',
    buildings: 2,
    totalUnits: 40,
    occupiedUnits: 29,
    monthlyIncome: 14850,
    status: 'Inactive',
  },
];
