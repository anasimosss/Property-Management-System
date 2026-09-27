import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DoorFrontIcon from '@mui/icons-material/DoorFront';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BuildIcon from '@mui/icons-material/Build';

import UnitCard from '../components/units/UnitCard';
import UnitFilters, { type UnitStatusFilter } from '../components/units/UnitFilters';
import DashboardStatCard from '../components/DashboardStatCard';
import { useAuth } from '../context/AuthContext';

import { propertiesApi } from '../api/properties';
import { buildingsApi } from '../api/buildings';
import { unitsApi } from '../api/units';
import { leasesApi } from '../api/leases';

import type {
  Property,
  Building,
  Unit,
  Lease,
} from '../types';

import type { MockUnit } from '../data/mockUnits';

const UnitsPage = () => {
  const { propertyId, buildingId } = useParams<{
    propertyId: string;
    buildingId: string;
  }>();

  const navigate = useNavigate();
  const { user } = useAuth();

  const [units, setUnits] = useState<MockUnit[]>([]);
  const [propertiesData, setPropertiesData] = useState<Property[]>([]);
  const [buildingsData, setBuildingsData] = useState<Building[]>([]);

  const [search, setSearch] = useState('');
  const [property, setProperty] = useState('All properties');
  const [building, setBuilding] = useState('All buildings');
  const [status, setStatus] = useState<UnitStatusFilter>('All statuses');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addProperty, setAddProperty] = useState('');
  const [addBuilding, setAddBuilding] = useState('');

  const [deleteUnit, setDeleteUnit] = useState<MockUnit | null>(null);
  const [deleting, setDeleting] = useState(false);

  const canManageUnits =
    user?.role === 'Admin' || user?.role === 'PropertyManager';

  /*
   * Load all data required to display units.
   *
   * The Unit API gives us the buildingId.
   * The Building API gives us the propertyId/propertyName.
   * The Property API gives us the location.
   * The Lease API lets us identify the current tenant.
   */
  const loadUnits = async () => {
    try {
      setLoading(true);
      setError('');

      // Tenant: load only their own units.
      if (user?.role === 'Tenant') {
        const apiUnits = await unitsApi.getMy();

        const mappedUnits: MockUnit[] = apiUnits.map((unit: Unit) => ({
          id: unit.id,
          unitNumber: unit.unitNumber,
          propertyId: 0,
          propertyName: 'My Property',
          buildingId: unit.buildingId,
          buildingName: unit.buildingName,
          location: 'My Property',
          floor: unit.floor ?? 0,
          unitType: 'Apartment',
          bedrooms: unit.bedrooms,
          bathrooms: unit.bathrooms,
          monthlyRent: unit.targetRent,
          status:
            unit.status === 'Maintenance'
              ? 'Maintenance'
              : unit.status === 'Occupied'
                ? 'Occupied'
                : 'Vacant',
        }));

        setUnits(mappedUnits);
        setPropertiesData([]);
        setBuildingsData([]);

        setProperty('All properties');
        setBuilding('All buildings');

        return;
      }

      // Admin / PropertyManager: keep the existing full portfolio behavior.
      const [properties, apiUnits, leases] = await Promise.all([
        propertiesApi.getAll(),
        unitsApi.getAll(),
        leasesApi.getAll(),
      ]);

      const buildingResults = await Promise.all(
        properties.map((item) => buildingsApi.getByProperty(item.id))
      );

      const allBuildings = buildingResults.flat();

      setPropertiesData(properties);
      setBuildingsData(allBuildings);

      const mappedUnits: MockUnit[] = apiUnits.map((unit: Unit) => {
        const matchedBuilding = allBuildings.find(
          (item) => item.id === unit.buildingId
        );

        const matchedProperty = properties.find(
          (item) => item.id === matchedBuilding?.propertyId
        );

        const activeLease = leases.find(
          (lease: Lease) =>
            lease.unitId === unit.id &&
            lease.status.toLowerCase() === 'active'
        );

        let mappedStatus: MockUnit['status'];

        if (unit.status === 'Maintenance') {
          mappedStatus = 'Maintenance';
        } else if (activeLease) {
          mappedStatus = 'Occupied';
        } else {
          mappedStatus = 'Vacant';
        }

        return {
          id: unit.id,
          unitNumber: unit.unitNumber,
          propertyId: matchedBuilding?.propertyId ?? 0,
          propertyName:
            matchedProperty?.name ??
            matchedBuilding?.propertyName ??
            'Unknown property',
          buildingId: unit.buildingId,
          buildingName:
            matchedBuilding?.name ??
            unit.buildingName ??
            'Unknown building',
          location: matchedProperty
            ? [
              matchedProperty.regionOrSubCity,
              matchedProperty.city,
            ]
              .filter(Boolean)
              .join(', ')
            : 'Unknown location',
          floor: unit.floor ?? 0,
          unitType:
            matchedProperty?.propertyType === 'Commercial'
              ? 'Commercial Unit'
              : matchedProperty?.propertyType === 'Mixed'
                ? 'Mixed Unit'
                : 'Apartment',
          bedrooms: unit.bedrooms,
          bathrooms: unit.bathrooms,
          monthlyRent: activeLease?.rentAmount ?? unit.targetRent,
          status: mappedStatus,
          tenantName: activeLease?.tenantName,
        };
      });

      setUnits(mappedUnits);

      if (propertyId) {
        const selectedProperty = properties.find(
          (item) => item.id === Number(propertyId)
        );

        setProperty(selectedProperty?.name ?? 'All properties');
      } else {
        setProperty('All properties');
      }

      if (buildingId) {
        const selectedBuilding = allBuildings.find(
          (item) => item.id === Number(buildingId)
        );

        setBuilding(selectedBuilding?.name ?? 'All buildings');
      } else {
        setBuilding('All buildings');
      }
    } catch (err) {
      console.error('Failed to load units:', err);
      setError('Failed to load units. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void loadUnits();
  }, [propertyId, buildingId]);

  /*
   * Property filter options.
   */
  const properties = useMemo(
    () => propertiesData.map((item) => item.name),
    [propertiesData]
  );

  /*
   * Building filter options depend on the selected property.
   */
  const buildings = useMemo(() => {
    return buildingsData
      .filter((item) => {
        if (property === 'All properties') {
          return true;
        }

        return item.propertyName === property;
      })
      .map((item) => item.name);
  }, [building, buildingsData, property]);

  /*
   * Filter the real units.
   */
  const filteredUnits = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return units.filter((unit) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        [
          unit.unitNumber,
          unit.propertyName,
          unit.buildingName,
          unit.location,
          unit.tenantName ?? '',
        ].some((value) => value.toLowerCase().includes(normalizedSearch));

      const matchesProperty =
        property === 'All properties' ||
        unit.propertyName === property;

      const matchesBuilding =
        building === 'All buildings' ||
        unit.buildingName === building;

      const matchesStatus =
        status === 'All statuses' ||
        unit.status === status;

      return (
        matchesSearch &&
        matchesProperty &&
        matchesBuilding &&
        matchesStatus
      );
    });
  }, [building, property, search, status, units]);

  /*
   * Dashboard statistics are calculated from real backend units.
   */
  const totals = useMemo(() => {
    const occupiedUnits = units.filter(
      (unit) => unit.status === 'Occupied'
    ).length;

    const vacantUnits = units.filter(
      (unit) => unit.status === 'Vacant'
    ).length;

    const monthlyRent = units
      .filter((unit) => unit.status === 'Occupied')
      .reduce(
        (total, unit) => total + unit.monthlyRent,
        0
      );

    return {
      total: units.length,
      occupied: occupiedUnits,
      vacant: vacantUnits,
      averageOccupancy:
        units.length === 0
          ? 0
          : Math.round((occupiedUnits / units.length) * 100),
      monthlyRent,
    };
  }, [units]);

  /*
   * Properties available in the Add Unit dialog.
   */
  const addBuildings = useMemo(() => {
    if (!addProperty) {
      return [];
    }

    return buildingsData.filter(
      (item) => item.propertyId === Number(addProperty)
    );
  }, [addProperty, buildingsData]);

  const clearFilters = () => {
    setSearch('');
    setProperty(
      propertyId
        ? propertiesData.find((item) => item.id === Number(propertyId))
          ?.name ?? 'All properties'
        : 'All properties'
    );

    setBuilding(
      buildingId
        ? buildingsData.find((item) => item.id === Number(buildingId))
          ?.name ?? 'All buildings'
        : 'All buildings'
    );

    setStatus('All statuses');
  };

  const handlePropertyChange = (value: string) => {
    setProperty(value);
    setBuilding('All buildings');
  };

  const openAddDialog = () => {
    setAddProperty('');
    setAddBuilding('');
    setAddDialogOpen(true);
  };

  const closeAddDialog = () => {
    setAddDialogOpen(false);
    setAddProperty('');
    setAddBuilding('');
  };

  const continueToCreate = () => {
    const selectedBuilding = buildingsData.find(
      (item) => item.id === Number(addBuilding)
    );

    if (!selectedBuilding) {
      return;
    }

    navigate(
      `/properties/${selectedBuilding.propertyId}/buildings/${selectedBuilding.id}/units/create`
    );
  };

  /*
   * Delete the real backend unit.
   */
  const handleDelete = async () => {
    if (!deleteUnit) {
      return;
    }

    try {
      setDeleting(true);
      setError('');

      await unitsApi.delete(deleteUnit.id);

      setUnits((currentUnits) =>
        currentUnits.filter((unit) => unit.id !== deleteUnit.id)
      );

      setDeleteUnit(null);
    } catch (err: any) {
      console.error('Failed to delete unit:', err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        'Failed to delete unit. It may be referenced by another record.';

      setError(message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Container
      maxWidth="xl"
      sx={{
        py: { xs: 2, md: 3 },
        minWidth: 0,
      }}
    >
      {propertyId && buildingId && (
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() =>
            navigate(
              `/properties/${propertyId}/buildings/${buildingId}`
            )
          }
          sx={{
            mb: 2,
            color: 'text.secondary',
          }}
        >
          Back to Building
        </Button>
      )}

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
            Units
          </Typography>

          <Typography color="text.secondary">
            Manage units, occupancy, rent, and tenant assignment across your
            portfolio.
          </Typography>
        </Box>

        {canManageUnits && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openAddDialog}
          >
            Add unit
          </Button>
        )}
      </Box>

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
          title="Total units"
          value={totals.total}
          icon={<DoorFrontIcon />}
          color="#3b82f6"
        />

        <DashboardStatCard
          title="Occupied units"
          value={totals.occupied}
          icon={<CheckCircleIcon />}
          color="#10b981"
        />

        <DashboardStatCard
          title="Vacant units"
          value={totals.vacant}
          icon={<HomeWorkIcon />}
          color="#8b5cf6"
        />

        <DashboardStatCard
          title="Average occupancy"
          value={`${totals.averageOccupancy}%`}
          icon={<BuildIcon />}
          color="#f59e0b"
        />

        <DashboardStatCard
          title="Monthly rent"
          value={`ETB ${totals.monthlyRent.toLocaleString()}`}
          icon={<AccountBalanceWalletIcon />}
          color="#0ea5e9"
        />
      </Box>

      <Box
        sx={{
          p: { xs: 2, md: 2.5 },
          mb: 3,
          bgcolor: 'background.paper',
          border: '1px solid #e2e8f0',
          borderRadius: 3,
        }}
      >
        <UnitFilters
          search={search}
          property={property}
          building={building}
          status={status}
          properties={properties}
          buildings={buildings}
          onSearchChange={setSearch}
          onPropertyChange={handlePropertyChange}
          onBuildingChange={setBuilding}
          onStatusChange={setStatus}
          onClear={clearFilters}
        />
      </Box>

      {loading && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            py: 8,
          }}
        >
          <CircularProgress aria-label="Loading units" />
        </Box>
      )}

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      {!loading && !error && filteredUnits.length === 0 && (
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
            No units found
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

      {!loading && !error && filteredUnits.length > 0 && (
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
          {filteredUnits.map((unit) => (
            <UnitCard
              key={unit.id}
              unit={unit}
              canEdit={canManageUnits}
              onView={(item) =>
                navigate(
                  `/properties/${item.propertyId}/buildings/${item.buildingId}/units/${item.id}`
                )
              }
              onEdit={(item) =>
                navigate(
                  `/properties/${item.propertyId}/buildings/${item.buildingId}/units/${item.id}/edit`
                )
              }
              onDelete={setDeleteUnit}
            />
          ))}
        </Box>
      )}

      {/* Add Unit Dialog */}
      <Dialog
        open={addDialogOpen}
        onClose={closeAddDialog}
        fullWidth
        maxWidth="sm"
        aria-labelledby="add-unit-dialog-title"
      >
        <DialogTitle id="add-unit-dialog-title">
          Choose a property and building
        </DialogTitle>

        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            A unit must belong to a building within a property.
          </DialogContentText>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="add-unit-property-label">
              Property
            </InputLabel>

            <Select
              labelId="add-unit-property-label"
              value={addProperty}
              label="Property"
              onChange={(event) => {
                setAddProperty(event.target.value);
                setAddBuilding('');
              }}
            >
              {propertiesData.map((item) => (
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
            disabled={!addProperty}
          >
            <InputLabel id="add-unit-building-label">
              Building
            </InputLabel>

            <Select
              labelId="add-unit-building-label"
              value={addBuilding}
              label="Building"
              onChange={(event) =>
                setAddBuilding(event.target.value)
              }
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
            disabled={!addBuilding}
          >
            Continue
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Unit Dialog */}
      <Dialog
        open={deleteUnit !== null}
        onClose={() => !deleting && setDeleteUnit(null)}
        aria-labelledby="delete-unit-dialog-title"
      >
        <DialogTitle id="delete-unit-dialog-title">
          Delete unit?
        </DialogTitle>

        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete unit{' '}
            <strong>{deleteUnit?.unitNumber}</strong>?
            This action will remove the unit from the database.
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setDeleteUnit(null)}
            disabled={deleting}
          >
            Cancel
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UnitsPage;