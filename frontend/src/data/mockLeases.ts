export type LeaseStatus = 'Active' | 'Expiring Soon' | 'Expired' | 'Pending';

export interface MockLease {
  id: number;
  leaseNumber: string;
  propertyId: number;
  propertyName: string;
  buildingId: number;
  buildingName: string;
  unitId: number;
  unitNumber: string;
  tenantId: number;
  tenantName: string;
  location: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  securityDeposit: number;
  dueDay: number;
  status: LeaseStatus;
}

export const leaseReferenceDate = '2026-09-16';

export const mockLeases: MockLease[] = [
  { id: 1, leaseNumber: 'LS-2026-001', propertyId: 1, propertyName: 'Sunset Apartments', buildingId: 1, buildingName: 'Block A', unitId: 1, unitNumber: 'A-101', tenantId: 1, tenantName: 'Marta Bekele', location: 'Bole, Addis Ababa', startDate: '2026-01-01', endDate: '2027-01-01', monthlyRent: 1450, securityDeposit: 2900, dueDay: 5, status: 'Active' },
  { id: 2, leaseNumber: 'LS-2026-002', propertyId: 1, propertyName: 'Sunset Apartments', buildingId: 1, buildingName: 'Block A', unitId: 2, unitNumber: 'A-102', tenantId: 2, tenantName: 'Dawit Tesfaye', location: 'Bole, Addis Ababa', startDate: '2025-11-01', endDate: '2026-11-30', monthlyRent: 980, securityDeposit: 1960, dueDay: 1, status: 'Expiring Soon' },
  { id: 3, leaseNumber: 'LS-2025-014', propertyId: 1, propertyName: 'Sunset Apartments', buildingId: 2, buildingName: 'Block B', unitId: 4, unitNumber: 'B-101', tenantId: 3, tenantName: 'Selamawit Yohannes', location: 'Bole, Addis Ababa', startDate: '2025-07-01', endDate: '2026-07-01', monthlyRent: 1480, securityDeposit: 2960, dueDay: 5, status: 'Expired' },
  { id: 4, leaseNumber: 'LS-2026-003', propertyId: 2, propertyName: 'Riverside Heights', buildingId: 4, buildingName: 'Tower A', unitId: 6, unitNumber: 'T-A01', tenantId: 4, tenantName: 'Yonas Alemu', location: 'Kazanchis, Addis Ababa', startDate: '2026-02-15', endDate: '2027-02-14', monthlyRent: 1650, securityDeposit: 3300, dueDay: 10, status: 'Active' },
  { id: 5, leaseNumber: 'LS-2026-004', propertyId: 2, propertyName: 'Riverside Heights', buildingId: 5, buildingName: 'Tower B', unitId: 8, unitNumber: 'T-B02', tenantId: 5, tenantName: 'Hana Girma', location: 'Kazanchis, Addis Ababa', startDate: '2026-10-01', endDate: '2027-09-30', monthlyRent: 1720, securityDeposit: 3440, dueDay: 1, status: 'Pending' },
  { id: 6, leaseNumber: 'LS-2026-005', propertyId: 3, propertyName: 'Downtown Office Complex', buildingId: 6, buildingName: 'Main Office Building', unitId: 9, unitNumber: 'OF-301', tenantId: 6, tenantName: 'Aster Consulting', location: 'Piazza, Addis Ababa', startDate: '2026-01-01', endDate: '2026-12-15', monthlyRent: 3200, securityDeposit: 6400, dueDay: 5, status: 'Expiring Soon' },
  { id: 7, leaseNumber: 'LS-2026-006', propertyId: 4, propertyName: 'Bole Garden Residences', buildingId: 7, buildingName: 'Garden East', unitId: 11, unitNumber: 'GE-102', tenantId: 7, tenantName: 'Rahel Worku', location: 'Bole, Addis Ababa', startDate: '2025-05-01', endDate: '2027-04-30', monthlyRent: 1560, securityDeposit: 3120, dueDay: 5, status: 'Active' },
  { id: 8, leaseNumber: 'LS-2026-007', propertyId: 5, propertyName: 'Kazanchis Business Center', buildingId: 9, buildingName: 'Business Tower', unitId: 13, unitNumber: 'BT-501', tenantId: 8, tenantName: 'Nile Creative Studio', location: 'Kazanchis, Addis Ababa', startDate: '2026-04-01', endDate: '2027-03-31', monthlyRent: 4100, securityDeposit: 8200, dueDay: 1, status: 'Active' },
  { id: 9, leaseNumber: 'LS-2025-009', propertyId: 6, propertyName: 'Saris Family Homes', buildingId: 11, buildingName: 'Family Block A', unitId: 15, unitNumber: 'FA-107', tenantId: 9, tenantName: 'Tigist Kebede', location: 'Saris, Addis Ababa', startDate: '2024-08-01', endDate: '2025-07-31', monthlyRent: 1250, securityDeposit: 2500, dueDay: 5, status: 'Expired' },
];
