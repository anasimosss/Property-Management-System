export type TenantStatus = 'Active' | 'Inactive';
export type LeaseStatus = 'Active' | 'Month-to-month' | 'Expired';
export type OccupancyStatus = 'Occupied' | 'Vacant';

export interface MockTenant {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  propertyId: number;
  propertyName: string;
  buildingId: number;
  buildingName: string;
  unitId: number;
  unitNumber: string;
  location: string;
  leaseStatus: LeaseStatus;
  occupancyStatus: OccupancyStatus;
  moveInDate: string;
  monthlyRent: number;
  status: TenantStatus;
}

export const mockTenants: MockTenant[] = [
  { id: 1, firstName: 'Marta', lastName: 'Bekele', fullName: 'Marta Bekele', email: 'marta.bekele@example.com', phone: '+251 911 245 671', propertyId: 1, propertyName: 'Sunset Apartments', buildingId: 1, buildingName: 'Block A', unitId: 1, unitNumber: 'A-101', location: 'Bole, Addis Ababa', leaseStatus: 'Active', occupancyStatus: 'Occupied', moveInDate: '2025-03-15', monthlyRent: 1450, status: 'Active' },
  { id: 2, firstName: 'Dawit', lastName: 'Tesfaye', fullName: 'Dawit Tesfaye', email: 'dawit.tesfaye@example.com', phone: '+251 922 518 304', propertyId: 1, propertyName: 'Sunset Apartments', buildingId: 1, buildingName: 'Block A', unitId: 2, unitNumber: 'A-102', location: 'Bole, Addis Ababa', leaseStatus: 'Month-to-month', occupancyStatus: 'Occupied', moveInDate: '2024-11-02', monthlyRent: 980, status: 'Active' },
  { id: 3, firstName: 'Selamawit', lastName: 'Yohannes', fullName: 'Selamawit Yohannes', email: 'selamawit.yohannes@example.com', phone: '+251 913 774 820', propertyId: 1, propertyName: 'Sunset Apartments', buildingId: 2, buildingName: 'Block B', unitId: 4, unitNumber: 'B-101', location: 'Bole, Addis Ababa', leaseStatus: 'Active', occupancyStatus: 'Occupied', moveInDate: '2025-06-20', monthlyRent: 1480, status: 'Active' },
  { id: 4, firstName: 'Yonas', lastName: 'Alemu', fullName: 'Yonas Alemu', email: 'yonas.alemu@example.com', phone: '+251 910 438 192', propertyId: 2, propertyName: 'Riverside Heights', buildingId: 4, buildingName: 'Tower A', unitId: 6, unitNumber: 'T-A01', location: 'Kazanchis, Addis Ababa', leaseStatus: 'Active', occupancyStatus: 'Occupied', moveInDate: '2025-01-10', monthlyRent: 1650, status: 'Active' },
  { id: 5, firstName: 'Hana', lastName: 'Girma', fullName: 'Hana Girma', email: 'hana.girma@example.com', phone: '+251 921 602 447', propertyId: 2, propertyName: 'Riverside Heights', buildingId: 5, buildingName: 'Tower B', unitId: 8, unitNumber: 'T-B02', location: 'Kazanchis, Addis Ababa', leaseStatus: 'Active', occupancyStatus: 'Occupied', moveInDate: '2024-09-18', monthlyRent: 1720, status: 'Active' },
  { id: 6, firstName: 'Aster', lastName: 'Consulting', fullName: 'Aster Consulting', email: 'admin@asterconsulting.example.com', phone: '+251 911 845 229', propertyId: 3, propertyName: 'Downtown Office Complex', buildingId: 6, buildingName: 'Main Office Building', unitId: 9, unitNumber: 'OF-301', location: 'Piazza, Addis Ababa', leaseStatus: 'Active', occupancyStatus: 'Occupied', moveInDate: '2023-08-01', monthlyRent: 3200, status: 'Active' },
  { id: 7, firstName: 'Rahel', lastName: 'Worku', fullName: 'Rahel Worku', email: 'rahel.worku@example.com', phone: '+251 914 376 510', propertyId: 4, propertyName: 'Bole Garden Residences', buildingId: 7, buildingName: 'Garden East', unitId: 11, unitNumber: 'GE-102', location: 'Bole, Addis Ababa', leaseStatus: 'Month-to-month', occupancyStatus: 'Occupied', moveInDate: '2025-04-04', monthlyRent: 1560, status: 'Active' },
  { id: 8, firstName: 'Nile Creative', lastName: 'Studio', fullName: 'Nile Creative Studio', email: 'hello@nilecreative.example.com', phone: '+251 912 550 881', propertyId: 5, propertyName: 'Kazanchis Business Center', buildingId: 9, buildingName: 'Business Tower', unitId: 13, unitNumber: 'BT-501', location: 'Kazanchis, Addis Ababa', leaseStatus: 'Active', occupancyStatus: 'Occupied', moveInDate: '2024-02-12', monthlyRent: 4100, status: 'Active' },
  { id: 9, firstName: 'Tigist', lastName: 'Kebede', fullName: 'Tigist Kebede', email: 'tigist.kebede@example.com', phone: '+251 915 902 134', propertyId: 6, propertyName: 'Saris Family Homes', buildingId: 11, buildingName: 'Family Block A', unitId: 15, unitNumber: 'FA-107', location: 'Saris, Addis Ababa', leaseStatus: 'Expired', occupancyStatus: 'Occupied', moveInDate: '2022-07-29', monthlyRent: 1250, status: 'Inactive' },
];
