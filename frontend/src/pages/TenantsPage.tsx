import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AddIcon from '@mui/icons-material/Add';
import ApartmentIcon from '@mui/icons-material/Apartment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import PeopleIcon from '@mui/icons-material/People';

import TenantCard from '../components/tenants/TenantCard';
import TenantFilters, {
  type OccupancyFilter,
  type TenantStatusFilter,
} from '../components/tenants/TenantFilters';
import DashboardStatCard from '../components/DashboardStatCard';

import { propertiesApi } from '../api/properties';
import { buildingsApi } from '../api/buildings';
import { unitsApi } from '../api/units';
import { leasesApi } from '../api/leases';
import { tenantsApi } from '../api/tenants';

import type {
  Property,
  Building,
  Unit,
} from '../types';

import type {
  MockTenant,
  TenantStatus,
  LeaseStatus,
  OccupancyStatus,
} from '../data/mockTenants';

import { useAuth } from '../context/AuthContext';

const TenantsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tenants, setTenants] = useState<MockTenant[]>([]);

  const [properties, setProperties] = useState<Property[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);


  const [search, setSearch] = useState('');
  const [property, setProperty] = useState('All properties');
  const [building, setBuilding] = useState('All buildings');
  const [occupancy, setOccupancy] =
    useState<OccupancyFilter>('All occupancy');
  const [status, setStatus] =
    useState<TenantStatusFilter>('All statuses');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addProperty, setAddProperty] = useState('');
  const [addBuilding, setAddBuilding] = useState('');
  const [addUnit, setAddUnit] = useState('');
  const [selectionError, setSelectionError] = useState('');

  const [deleteTenant, setDeleteTenant] =
    useState<MockTenant | null>(null);

  const canManageTenants =
    user?.role === 'Admin' || user?.role === 'PropertyManager';

  /*
   * Load all required backend data.
   */
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError('');

        const [
          tenantData,
          propertyData,
          unitData,
          leaseData,
        ] = await Promise.all([
          tenantsApi.getAll(),
          propertiesApi.getAll(),
          unitsApi.getAll(),
          leasesApi.getAll(),
        ]);

        const buildingResults = await Promise.all(
          propertyData.map((item) =>
            buildingsApi.getByProperty(item.id)
          )
        );

        const buildingData = buildingResults.flat();

        setProperties(propertyData);
        setBuildings(buildingData);
        setUnits(unitData);


        const mappedTenants: MockTenant[] = tenantData.map(
          (tenant) => {
            /*
             * Find the tenant's active/relevant lease.
             */
            const tenantLeases = leaseData.filter(
              (lease) => lease.tenantId === tenant.id
            );

            const activeLease =
              tenantLeases.find(
                (lease) => lease.status === 'Active'
              ) ??
              tenantLeases.find(
                (lease) => lease.status === 'Month-to-month'
              ) ??
              tenantLeases[0];

            const unit = activeLease
              ? unitData.find(
                (item) => item.id === activeLease.unitId
              )
              : undefined;

            const building = unit
              ? buildingData.find(
                (item) => item.id === unit.buildingId
              )
              : undefined;

            const propertyItem = building
              ? propertyData.find(
                (item) => item.id === building.propertyId
              )
              : undefined;

            const leaseStatus: LeaseStatus =
              activeLease?.status === 'Active'
                ? 'Active'
                : activeLease?.status === 'Month-to-month'
                  ? 'Month-to-month'
                  : 'Expired';

            const occupancyStatus: OccupancyStatus =
              activeLease &&
                (activeLease.status === 'Active' ||
                  activeLease.status === 'Month-to-month')
                ? 'Occupied'
                : 'Vacant';

            const tenantStatus: TenantStatus =
              occupancyStatus === 'Occupied'
                ? 'Active'
                : 'Inactive';

            return {
              id: tenant.id,
              firstName: tenant.firstName,
              lastName: tenant.lastName,
              fullName: `${tenant.firstName} ${tenant.lastName}`.trim(),
              email: tenant.email,
              phone: tenant.phoneNumber,

              propertyId: propertyItem?.id ?? 0,
              propertyName:
                propertyItem?.name ?? 'Unassigned property',

              buildingId: building?.id ?? 0,
              buildingName:
                building?.name ?? 'Unassigned building',

              unitId: unit?.id ?? 0,
              unitNumber:
                unit?.unitNumber ?? 'Unassigned',

              location: propertyItem
                ? [
                  propertyItem.regionOrSubCity,
                  propertyItem.city,
                ]
                  .filter(Boolean)
                  .join(', ')
                : 'Location unavailable',

              leaseStatus,

              occupancyStatus,

              moveInDate:
                activeLease?.startDate ??
                tenant.createdAtUtc,

              monthlyRent:
                activeLease?.rentAmount ??
                unit?.targetRent ??
                0,

              status: tenantStatus,
            };
          }
        );

        setTenants(mappedTenants);
      } catch (err: unknown) {
        console.error('Failed to load tenants:', err);

        const responseData = (
          err as {
            response?: {
              data?: {
                message?: string;
                title?: string;
              };
            };
          }
        )?.response?.data;

        setError(
          responseData?.message ||
          responseData?.title ||
          'Failed to load tenants.'
        );
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, []);

  const propertyNames = useMemo(
    () =>
      Array.from(
        new Set(
          properties.map((item) => item.name)
        )
      ),
    [properties]
  );

  const buildingNames = useMemo(
    () =>
      Array.from(
        new Set(
          buildings
            .filter((item) => {
              if (property === 'All properties') {
                return true;
              }

              return (
                item.propertyName === property
              );
            })
            .map((item) => item.name)
        )
      ),
    [buildings, property]
  );

  const filteredTenants = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return tenants.filter((tenant) => {
      const searchableValues = [
        tenant.fullName,
        tenant.email,
        tenant.phone,
        tenant.unitNumber,
        tenant.buildingName,
        tenant.propertyName,
      ];

      const matchesSearch =
        normalizedSearch.length === 0 ||
        searchableValues.some((value) =>
          value.toLowerCase().includes(normalizedSearch)
        );

      const matchesProperty =
        property === 'All properties' ||
        tenant.propertyName === property;

      const matchesBuilding =
        building === 'All buildings' ||
        tenant.buildingName === building;

      const matchesOccupancy =
        occupancy === 'All occupancy' ||
        tenant.occupancyStatus === occupancy;

      const matchesStatus =
        status === 'All statuses' ||
        tenant.status === status;

      return (
        matchesSearch &&
        matchesProperty &&
        matchesBuilding &&
        matchesOccupancy &&
        matchesStatus
      );
    });
  }, [
    building,
    occupancy,
    property,
    search,
    status,
    tenants,
  ]);

  const totals = useMemo(() => {
    const occupiedUnitIds = new Set(
      tenants
        .filter(
          (tenant) =>
            tenant.occupancyStatus === 'Occupied' &&
            tenant.unitId > 0
        )
        .map((tenant) => tenant.unitId)
    );

    return {
      total: tenants.length,

      active: tenants.filter(
        (tenant) => tenant.status === 'Active'
      ).length,

      occupiedUnits: occupiedUnitIds.size,

      vacantUnits: Math.max(
        units.length - occupiedUnitIds.size,
        0
      ),

      monthlyRent: tenants
        .filter(
          (tenant) =>
            tenant.occupancyStatus === 'Occupied'
        )
        .reduce(
          (total, tenant) =>
            total + tenant.monthlyRent,
          0
        ),
    };
  }, [tenants, units]);

  const clearFilters = () => {
    setSearch('');
    setProperty('All properties');
    setBuilding('All buildings');
    setOccupancy('All occupancy');
    setStatus('All statuses');
  };

  const handlePropertyChange = (value: string) => {
    setProperty(value);
    setBuilding('All buildings');
  };

  /*
   * Add Tenant dialog.
   * The selected unit is only used to carry the
   * property/building/unit IDs into the create page.
   */
  const addBuildings = useMemo(
    () =>
      buildings.filter(
        (item) =>
          !addProperty ||
          item.propertyId === Number(addProperty)
      ),
    [addProperty, buildings]
  );

  const addUnits = useMemo(
    () =>
      units.filter(
        (item) =>
          !addBuilding ||
          item.buildingId === Number(addBuilding)
      ),
    [addBuilding, units]
  );

  const openAddDialog = () => {
    setAddProperty('');
    setAddBuilding('');
    setAddUnit('');
    setSelectionError('');
    setAddDialogOpen(true);
  };

  const closeAddDialog = () => {
    setAddDialogOpen(false);
    setSelectionError('');
  };

  const continueToCreate = () => {
    const selectedUnit = units.find(
      (unit) => unit.id === Number(addUnit)
    );

    if (!selectedUnit) {
      setSelectionError(
        'Select a property, building, and unit before continuing.'
      );
      return;
    }

    navigate(
      `/tenants/create?propertyId=${selectedUnit.buildingId ? buildings.find((item) => item.id === selectedUnit.buildingId)?.propertyId ?? '' : ''}&buildingId=${selectedUnit.buildingId}&unitId=${selectedUnit.id}`
    );
  };

  const handleDelete = async () => {
    if (!deleteTenant) {
      return;
    }

    try {
      await tenantsApi.delete(deleteTenant.id);

      setTenants((currentTenants) =>
        currentTenants.filter(
          (tenant) => tenant.id !== deleteTenant.id
        )
      );

      setDeleteTenant(null);
    } catch (err: unknown) {
      console.error('Failed to delete tenant:', err);

      const responseData = (
        err as {
          response?: {
            data?: {
              message?: string;
              title?: string;
            };
          };
        }
      )?.response?.data;

      setError(
        responseData?.message ||
        responseData?.title ||
        'Failed to delete tenant.'
      );

      setDeleteTenant(null);
    }
  };

  return (
    <Container
      maxWidth="xl"
      sx={{
        py: { xs: 2, md: 3 },
      }}
    >
      {/* Page header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: {
            xs: 'flex-start',
            sm: 'center',
          },
          gap: 2,
          mb: 3,
          flexDirection: {
            xs: 'column',
            sm: 'row',
          },
        }}
      >
        <Box>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 600,
              mb: 0.5,
              color: 'black',
            }}
          >
            Tenants
          </Typography>

          <Typography color="text.secondary">
            Manage tenants, occupancy, leases, and tenant
            information.
          </Typography>
        </Box>

        {canManageTenants && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openAddDialog}
          >
            Add Tenant
          </Button>
        )}
      </Box>

      {/* Statistics */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            lg: 'repeat(5, 1fr)',
          },
          gap: 2,
          mb: 3,
        }}
      >
        <DashboardStatCard
          title="Total tenants"
          value={totals.total}
          icon={<PeopleIcon />}
          color="#3b82f6"
        />

        <DashboardStatCard
          title="Active tenants"
          value={totals.active}
          icon={<CheckCircleIcon />}
          color="#10b981"
        />

        <DashboardStatCard
          title="Occupied units"
          value={totals.occupiedUnits}
          icon={<ApartmentIcon />}
          color="#8b5cf6"
        />

        <DashboardStatCard
          title="Vacant units"
          value={totals.vacantUnits}
          icon={<HomeWorkIcon />}
          color="#f59e0b"
        />

        <DashboardStatCard
          title="Monthly rent"
          value={`$${totals.monthlyRent.toLocaleString()}`}
          icon={<AccountBalanceWalletIcon />}
          color="#0ea5e9"
        />
      </Box>

      {/* Filters */}
      <Box
        sx={{
          p: { xs: 2, md: 2.5 },
          mb: 3,
          bgcolor: 'background.paper',
          border: '1px solid #e2e8f0',
          borderRadius: 3,
        }}
      >
        <TenantFilters
          search={search}
          property={property}
          building={building}
          occupancy={occupancy}
          status={status}
          properties={propertyNames}
          buildings={buildingNames}
          onSearchChange={setSearch}
          onPropertyChange={handlePropertyChange}
          onBuildingChange={setBuilding}
          onOccupancyChange={setOccupancy}
          onStatusChange={setStatus}
          onClear={clearFilters}
        />
      </Box>

      {/* Loading */}
      {loading && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            py: 8,
          }}
        >
          <CircularProgress aria-label="Loading tenants" />
        </Box>
      )}

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Empty state */}
      {!loading &&
        !error &&
        filteredTenants.length === 0 && (
          <Box
            sx={{
              p: { xs: 4, md: 7 },
              textAlign: 'center',
              bgcolor: 'background.paper',
              border: '1px solid #e2e8f0',
              borderRadius: 3,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                mb: 1,
              }}
            >
              No tenants found
            </Typography>

            <Typography
              color="text.secondary"
              sx={{ mb: 2.5 }}
            >
              Try adjusting your search or filters.
            </Typography>

            <Button
              variant="outlined"
              onClick={clearFilters}
            >
              Clear filters
            </Button>
          </Box>
        )}

      {/* Tenant cards */}
      {!loading &&
        !error &&
        filteredTenants.length > 0 && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(2, 1fr)',
                xl: 'repeat(3, 1fr)',
              },
              gap: 3,
            }}
          >
            {filteredTenants.map((tenant) => (
              <TenantCard
                key={tenant.id}
                tenant={tenant}
                canEdit={canManageTenants}
                onView={(item) =>
                  navigate(`/tenants/${item.id}`)
                }
                onEdit={(item) =>
                  navigate(`/tenants/${item.id}/edit`)
                }
                onDelete={setDeleteTenant}
              />
            ))}
          </Box>
        )}

      {/* Add Tenant dialog */}
      <Dialog
        open={addDialogOpen}
        onClose={closeAddDialog}
        fullWidth
        maxWidth="sm"
        aria-labelledby="add-tenant-dialog-title"
      >
        <DialogTitle id="add-tenant-dialog-title">
          Choose a unit for the tenant
        </DialogTitle>

        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Select the property, building, and unit this
            tenant will be assigned to.
          </DialogContentText>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="add-tenant-property-label">
              Property
            </InputLabel>

            <Select
              labelId="add-tenant-property-label"
              value={addProperty}
              label="Property"
              onChange={(event) => {
                setAddProperty(event.target.value);
                setAddBuilding('');
                setAddUnit('');
                setSelectionError('');
              }}
            >
              {properties.map((item) => (
                <MenuItem
                  key={item.id}
                  value={item.id}
                >
                  {item.name} · {item.city}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl
            fullWidth
            sx={{ mb: 2 }}
            disabled={!addProperty}
          >
            <InputLabel id="add-tenant-building-label">
              Building
            </InputLabel>

            <Select
              labelId="add-tenant-building-label"
              value={addBuilding}
              label="Building"
              onChange={(event) => {
                setAddBuilding(event.target.value);
                setAddUnit('');
                setSelectionError('');
              }}
            >
              {addBuildings.map((item) => (
                <MenuItem
                  key={item.id}
                  value={item.id}
                >
                  {item.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl
            fullWidth
            disabled={!addBuilding}
            error={Boolean(selectionError)}
          >
            <InputLabel id="add-tenant-unit-label">
              Unit
            </InputLabel>

            <Select
              labelId="add-tenant-unit-label"
              value={addUnit}
              label="Unit"
              onChange={(event) => {
                setAddUnit(event.target.value);
                setSelectionError('');
              }}
            >
              {addUnits.map((item) => (
                <MenuItem
                  key={item.id}
                  value={item.id}
                >
                  {item.unitNumber} · {item.bedrooms} bed
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectionError && (
            <Typography
              variant="caption"
              color="error"
              sx={{
                display: 'block',
                mt: 0.75,
              }}
            >
              {selectionError}
            </Typography>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2,
          }}
        >
          <Button onClick={closeAddDialog}>
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={continueToCreate}
            disabled={!addUnit}
          >
            Continue
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog
        open={deleteTenant !== null}
        onClose={() => setDeleteTenant(null)}
        aria-labelledby="delete-tenant-dialog-title"
      >
        <DialogTitle id="delete-tenant-dialog-title">
          Delete tenant?
        </DialogTitle>

        <DialogContent>
          <DialogContentText>
            Remove {deleteTenant?.fullName} from the system?
            This action will delete the tenant from the
            backend.
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setDeleteTenant(null)}
          >
            Cancel
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={() => void handleDelete()}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TenantsPage;