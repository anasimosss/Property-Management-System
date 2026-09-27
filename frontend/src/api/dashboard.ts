import apiClient from './client';

export interface DashboardSummary {
  totalProperties: number;
  totalBuildings: number;
  totalUnits: number;
  totalTenants: number;
  activeLeases: number;
  occupiedUnits: number;
  vacantUnits: number;
  totalPaymentIncome: number;
  totalExpenses: number;
  netIncome: number;
  openMaintenanceRequests: number;
  highPriorityMaintenanceRequests: number;
  emergencyMaintenanceRequests: number;
}

export interface MaintenanceReport {
  totalRequests: number;
  openRequests: number;
  assignedRequests: number;
  inProgressRequests: number;
  onHoldRequests: number;
  resolvedRequests: number;
  cancelledRequests: number;
  lowPriorityRequests: number;
  mediumPriorityRequests: number;
  highPriorityRequests: number;
  emergencyRequests: number;
}

export interface FinancialReport {
  propertyId: number;
  propertyName: string;
  totalPaymentIncome: number;
  totalExpenses: number;
  netIncome: number;
}

export interface LeaseOccupancyReport {
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  activeLeases: number;
  occupancyRate: number;
}

export const dashboardApi = {
  getSummary: async (): Promise<DashboardSummary> => {
    const response = await apiClient.get<DashboardSummary>(
      '/api/Dashboard/summary'
    );

    return response.data;
  },
  getFinancialReport: async (
  propertyId: number
): Promise<FinancialReport> => {
  const response = await apiClient.get<FinancialReport>(
    `/api/Dashboard/financial/${propertyId}`
  );

  return response.data;
},

getLeaseOccupancyReport: async (): Promise<LeaseOccupancyReport> => {
  const response = await apiClient.get<LeaseOccupancyReport>(
    '/api/Dashboard/lease-occupancy'
  );

  return response.data;
},

getMaintenanceReport: async (): Promise<MaintenanceReport> => {
  const response = await apiClient.get<MaintenanceReport>(
    '/api/Dashboard/maintenance-report'
  );

  return response.data;
},
};