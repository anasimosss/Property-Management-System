import UsersPage from '../pages/UsersPage';
import { createBrowserRouter } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import DashboardLayout from '../components/layout/DashboardLayout';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import PropertiesPage from '../pages/PropertiesPage';
import CreatePropertyPage from '../pages/CreatePropertyPage';
import PropertyDetailsPage from '../pages/PropertyDetailsPage';
import EditPropertyPage from '../pages/EditPropertyPage';
import BuildingsPage from '../pages/BuildingsPage';
import ProtectedRoute from '../components/ProtectedRoute';
import CreateBuildingPage from '../pages/CreateBuildingPage';
import BuildingDetailsPage from '../pages/BuildingDetailsPage';
import EditBuildingPage from '../pages/EditBuildingPage';
import UnitsPage from '../pages/UnitsPage';
import CreateUnitPage from '../pages/CreateUnitPage';
import UnitDetailsPage from '../pages/UnitDetailsPage';
import EditUnitPage from '../pages/EditUnitPage';
import TenantsPage from '../pages/TenantsPage';
import CreateTenantPage from '../pages/CreateTenantPage';
import TenantDetailsPage from '../pages/TenantDetailsPage';
import EditTenantPage from '../pages/EditTenantPage';
import LeasesPage from '../pages/LeasesPage';
import CreateLeasePage from '../pages/CreateLeasePage';
import LeaseDetailsPage from '../pages/LeaseDetailsPage';
import EditLeasePage from '../pages/EditLeasePage';
import PaymentsPage from '../pages/PaymentsPage';
import CreatePaymentPage from '../pages/CreatePaymentPage';
import PaymentDetailsPage from '../pages/PaymentDetailsPage';
import EditPaymentPage from '../pages/EditPaymentPage';
import ExpensesPage from '../pages/ExpensesPage';
import CreateExpensePage from '../pages/CreateExpensePage';
import ExpenseDetailsPage from '../pages/ExpenseDetailsPage';
import EditExpensePage from '../pages/EditExpensePage';
import MaintenanceRequestsPage from '../pages/MaintenanceRequestsPage';
import CreateMaintenanceRequestPage from '../pages/CreateMaintenanceRequestPage';
import MaintenanceRequestDetailsPage from '../pages/MaintenanceRequestDetailsPage';
import EditMaintenanceRequestPage from '../pages/EditMaintenanceRequestPage';
import FinancialReportPage from '../pages/FinancialReportPage';
import LeaseOccupancyReportPage from '../pages/LeaseOccupancyReportPage';
import MaintenanceReportPage from '../pages/MaintenanceReportPage';
import SettingsPage from '../pages/SettingsPage';
import PaymentSuccessPage from '../pages/PaymentSuccessPage';
import AvailableUnitsPage from '../pages/AvailableUnitsPage';
import UnitRequestsPage from '../pages/UnitRequestsPage';
import MyUnitRequestsPage from '../pages/MyUnitRequestsPage';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <LoginPage />,
      },
    ],
  },
  {
    path: '/register',
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <RegisterPage />,
      },
    ],
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'reports/financial',
        element: <FinancialReportPage />,
      },
      {
        path: 'reports/lease-occupancy',
        element: <LeaseOccupancyReportPage />,
      },
      {
        path: 'reports/maintenance',
        element: <MaintenanceReportPage />,
      },
      {
        path: 'properties',
        element: <PropertiesPage />,
      },
      {
        path: 'properties/create',
        element: <CreatePropertyPage />,
      },
      {
        path: 'properties/:id',
        element: <PropertyDetailsPage />,
      },
      {
        path: 'properties/:id/edit',
        element: <EditPropertyPage />,
      },
      {
        path: 'properties/:propertyId/buildings',
        element: <BuildingsPage />,
      },
      {
        path: 'properties/:propertyId/buildings/create',
        element: <CreateBuildingPage />,
      },
      {
        path: 'properties/:propertyId/buildings/:buildingId',
        element: <BuildingDetailsPage />,
      },
      {
        path: 'properties/:propertyId/buildings/:buildingId/edit',
        element: <EditBuildingPage />,
      },
      {
        path: 'buildings',
        element: <BuildingsPage />,
      },
      {
        path: 'buildings/create',
        element: <CreateBuildingPage />,
      },
      {
        path: 'buildings/:buildingId',
        element: <BuildingDetailsPage />,
      },
      {
        path: 'buildings/:buildingId/edit',
        element: <EditBuildingPage />,
      },
      {
        path: 'units',
        element: <UnitsPage />,
      },
      {
        path: 'units/create',
        element: <CreateUnitPage />,
      },
      {
        path: 'unit-requests',
        element: <UnitRequestsPage />,
      },
      {
        path: 'my-unit-requests',
        element: <MyUnitRequestsPage />,
      },
      {
        path: 'units/:unitId',
        element: <UnitDetailsPage />,
      },
      {
        path: 'units/:unitId/edit',
        element: <EditUnitPage />,
      },
      {
        path: 'properties/:propertyId/buildings/:buildingId/units/create',
        element: <CreateUnitPage />,
      },
      {
        path: 'properties/:propertyId/buildings/:buildingId/units',
        element: <UnitsPage />,
      },
      {
        path: 'available-units',
        element: <AvailableUnitsPage />,
      },
      {
        path: 'properties/:propertyId/buildings/:buildingId/units/:unitId',
        element: <UnitDetailsPage />,
      },
      {
        path: 'properties/:propertyId/buildings/:buildingId/units/:unitId/edit',
        element: <EditUnitPage />,
      },
      {
        path: 'tenants',
        element: <TenantsPage />,
      },
      {
        path: 'users',
        element: <UsersPage />,
      },
      {
        path: 'tenants/create',
        element: <CreateTenantPage />,
      },
      {
        path: 'tenants/:tenantId',
        element: <TenantDetailsPage />,
      },
      {
        path: 'tenants/:tenantId/edit',
        element: <EditTenantPage />,
      },


      {
        path: 'leases',
        element: <LeasesPage />,
      },
      {
        path: 'leases/:leaseId',
        element: <LeaseDetailsPage />,
      },
      {
        path: 'leases/create',
        element: <CreateLeasePage />,
      },
      {
        path: 'leases/:leaseId/edit',
        element: <EditLeasePage />,
      },

      {
        path: 'payments/create',
        element: <CreatePaymentPage />,
      },
      {
        path: 'payments',
        element: <PaymentsPage />,
      },
      {
        path: 'payments/:paymentId',
        element: <PaymentDetailsPage />,
      },
      {
        path: 'payments/:paymentId/edit',
        element: <EditPaymentPage />,
      },

      {
        path: '/payment/success',
        element: <PaymentSuccessPage />,
      },

      {
        path: 'expenses/create',
        element: <CreateExpensePage />,
      },
      {
        path: 'expenses',
        element: <ExpensesPage />,
      },
      {
        path: 'expenses/:expenseId',
        element: <ExpenseDetailsPage />,
      },
      {
        path: 'expenses/:expenseId/edit',
        element: <EditExpensePage />,
      },

      {
        path: 'maintenance-requests/create',
        element: <CreateMaintenanceRequestPage />,
      },
      {
        path: 'maintenance-requests',
        element: <MaintenanceRequestsPage />,
      },
      {
        path: 'maintenance-requests/:requestId',
        element: <MaintenanceRequestDetailsPage />,
      },
      {
        path: 'maintenance-requests/:requestId/edit',
        element: <EditMaintenanceRequestPage />,
      },
      { 
        path: 'settings', element: <SettingsPage />, 
      },
      
      
    ],
  },
]);

export default router;
