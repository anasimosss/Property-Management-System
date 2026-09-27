export interface Unit {
  id: number;
  buildingId: number;
  buildingName: string;
  unitNumber: string;
  floor?: number | null;
  bedrooms: number;
  bathrooms: number;
  squareFeet?: number | null;
  targetRent: number;
  status: string;
  createdAtUtc: string;
}

export interface User {
  fullName: any;
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
  role: string;
  isActive: boolean;
  createdAtUtc: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresAtUtc: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface ApiError {
  message: string;
}

export interface Property {
  id: number;
  name: string;
  country: string;
  city: string;
  regionOrSubCity?: string;
  addressLine1: string;
  addressLine2?: string;
  postalCode?: string;
  propertyType: string;
  createdAtUtc: string;

  buildingCount: number;
  totalUnits: number;
  occupiedUnits: number;
  monthlyIncome: number;
}

export interface CreatePropertyRequest {
  name: string;
  country: string;
  city: string;
  regionOrSubCity?: string;
  addressLine1: string;
  addressLine2?: string;
  postalCode?: string;
  propertyType: string;
}

export interface UpdatePropertyRequest {
  name: string;
  country: string;
  city: string;
  regionOrSubCity?: string;
  addressLine1: string;
  addressLine2?: string;
  postalCode?: string;
  propertyType: string;
}

export interface Building {
  id: number;
  propertyId: number;
  propertyName: string;
  name: string;
  floors?: number | null;
  createdAtUtc: string;
}

export interface CreateBuildingRequest {
  propertyId: number;
  name: string;
  floors?: number | null;
}

export interface UpdateBuildingRequest {
  name: string;
  floors?: number | null;
}

export interface CreateUnitRequest {
  buildingId: number;
  unitNumber: string;
  floor?: number | null;
  bedrooms: number;
  bathrooms: number;
  squareFeet?: number | null;
  targetRent: number;
  status: string;
}

export interface UpdateUnitRequest {
  unitNumber: string;
  floor?: number | null;
  bedrooms: number;
  bathrooms: number;
  squareFeet?: number | null;
  targetRent: number;
  status: string;
}

export interface Tenant {
  id: number;
  userId?: number | null;
  userEmail?: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  createdAtUtc: string;
}

export interface CreateTenantRequest {
  userId?: number | null;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
}

export interface UpdateTenantRequest {
  userId?: number | null;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
}

export interface Lease {
  id: number;
  unitId: number;
  unitNumber: string;
  tenantId: number;
  tenantName: string;
  startDate: string;
  endDate: string;
  rentAmount: number;
  securityDepositAmount: number;
  securityDepositPaid: boolean;
  rentDueDayOfMonth: number;
  status: string;
  terms?: string | null;
  createdAtUtc: string;
}

export interface CreateLeaseRequest {
  unitId: number;
  tenantId: number;
  startDate: string;
  endDate: string;
  rentAmount: number;
  securityDepositAmount: number;
  securityDepositPaid: boolean;
  rentDueDayOfMonth: number;
  status: string;
  terms?: string | null;
}

export interface UpdateLeaseRequest {
  unitId: number;
  tenantId: number;
  startDate: string;
  endDate: string;
  rentAmount: number;
  securityDepositAmount: number;
  securityDepositPaid: boolean;
  rentDueDayOfMonth: number;
  status: string;
  terms?: string | null;
}

export interface Payment {
  id: number;
  leaseId: number;
  unitNumber: string;
  tenantId: number;
  tenantName: string;
  amount: number;
  paymentDate: string;
  dueDate: string;
  paymentType: string;
  paymentMethod: string;
  paymentChannel: string;
  status: string;
  referenceNumber?: string | null;
  chapaTransactionReference?: string | null;
  notes?: string | null;
  createdAtUtc: string;
}

export interface CreatePaymentRequest {
  leaseId: number;
  amount: number;
  paymentDate: string;
  dueDate: string;
  paymentType: string;
  paymentMethod: string;
  paymentChannel: string;
  status: string;
  referenceNumber?: string | null;
  notes?: string | null;
}

export interface UpdatePaymentRequest {
  leaseId: number;
  amount: number;
  paymentDate: string;
  dueDate: string;
  paymentType: string;
  paymentMethod: string;
  paymentChannel: string;
  status: string;
  referenceNumber?: string | null;
  notes?: string | null;
}

export interface Expense {
  id: number;
  propertyId: number;
  propertyName: string;
  buildingId?: number | null;
  buildingName?: string | null;
  unitId?: number | null;
  unitNumber?: string | null;
  recordedByUserId: number;
  recordedByUserName: string;
  category: string;
  amount: number;
  expenseDate: string;
  vendorName: string;
  description: string;
  receiptUrl?: string | null;
  createdAtUtc: string;
}

export interface CreateExpenseRequest {
  propertyId: number;
  buildingId?: number | null;
  unitId?: number | null;
  category: string;
  amount: number;
  expenseDate: string;
  vendorName: string;
  description: string;
  receiptUrl?: string | null;
}

export interface UpdateExpenseRequest {
  propertyId: number;
  buildingId?: number | null;
  unitId?: number | null;
  category: string;
  amount: number;
  expenseDate: string;
  vendorName: string;
  description: string;
  receiptUrl?: string | null;
}

export interface MaintenanceRequest {
  id: number;
  propertyId: number;
  propertyName: string;
  unitId?: number | null;
  unitNumber?: string | null;
  reportedByTenantId?: number | null;
  reportedByTenantName?: string | null;
  reportedByUserId?: number | null;
  reportedByUserName?: string | null;
  assignedToUserId?: number | null;
  assignedToUserName?: string | null;
  title: string;
  description: string;
  priority: string;
  status: string;
  resolutionNotes?: string | null;
  createdAtUtc: string;
  resolvedAtUtc?: string | null;
}

export interface CreateMaintenanceRequestRequest {
  propertyId: number;
  unitId?: number | null;
  reportedByTenantId?: number | null;
  reportedByUserId?: number | null;
  assignedToUserId?: number | null;
  title: string;
  description: string;
  priority: string;
  status: string;
  resolutionNotes?: string | null;
}

export interface UpdateMaintenanceRequestRequest {
  propertyId: number;
  unitId?: number | null;
  assignedToUserId?: number | null;
  title: string;
  description: string;
  priority: string;
  status: string;
  resolutionNotes?: string | null;
}