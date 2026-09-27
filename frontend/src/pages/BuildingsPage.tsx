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
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AddIcon from '@mui/icons-material/Add';
import ApartmentIcon from '@mui/icons-material/Apartment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HomeWorkIcon from '@mui/icons-material/HomeWork';

import BuildingCard from '../components/buildings/BuildingCard';
import BuildingFilters, {
  type BuildingStatusFilter,
} from '../components/buildings/BuildingFilters';
import DashboardStatCard from '../components/DashboardStatCard';

import { buildingsApi } from '../api/buildings';
import { propertiesApi } from '../api/properties';
import type { MockBuilding } from '../data/mockBuildings';
import type { Building, Property } from '../types';
import { useAuth } from '../context/AuthContext';

const BuildingsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [buildings, setBuildings] = useState<Building[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [search, setSearch] = useState('');
  const [property, setProperty] = useState('All properties');
  const [status, setStatus] =
    useState<BuildingStatusFilter>('All statuses');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [propertyDialogOpen, setPropertyDialogOpen] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] =
    useState<number | null>(null);
  const [propertySelectionError, setPropertySelectionError] =
    useState('');

  const canManageBuildings =
    user?.role === 'Admin' || user?.role === 'PropertyManager';

  /*
   * Load buildings from the backend.
   *
   * The current API provides buildings by property,
   * so we request the buildings belonging to each property
   * and combine them into one list.
   */
  const loadBuildings = async () => {
    try {
      setLoading(true);
      setError('');

      const propertyData = await propertiesApi.getAll();
      setProperties(propertyData);

      const results = await Promise.all(
        propertyData.map((propertyOption) =>
          buildingsApi.getByProperty(propertyOption.id)
        )
      );

      const allBuildings = results.flat();

      setBuildings(allBuildings);
    } catch (err) {
      console.error('Failed to load buildings:', err);

      setError(
        'Failed to load buildings. Please check that the backend is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBuildings();
  }, []);

  /*
   * Convert the real backend Building objects into the
   * existing MockBuilding shape required by BuildingCard.
   *
   * The backend currently does not return unit counts,
   * status, or location for a building, so these values
   * are supplied from the existing frontend structure.
   */
  const displayBuildings = useMemo<MockBuilding[]>(() => {
    return buildings.map((building) => {
      const propertyInfo = properties.find(
        (item) => item.id === building.propertyId
      );

      return {
        id: building.id,
        propertyId: building.propertyId,
        propertyName:
          building.propertyName ||
          propertyInfo?.name ||
          'Unknown property',
        name: building.name,

        /*
         * The current Building API does not return location.
         * Use the property's location for display.
         */
        location:
          [
            propertyInfo?.city,
            propertyInfo?.regionOrSubCity,
          ]
            .filter(Boolean)
            .join(', ') || 'Location unavailable',

        /*
         * Unit information is not part of the current
         * Building response.
         */
        totalUnits: 0,
        occupiedUnits: 0,

        /*
         * Status is not part of the current Building response.
         * "Active" keeps the existing UI filter functional.
         */
        status: 'Active',

        /*
         * BuildingCard requires floors.
         */
        floors: building.floors ?? 0,

        createdAtUtc: building.createdAtUtc,
      };
    });
  }, [buildings, properties]);

  const propertyNames = useMemo(
    () =>
      Array.from(
        new Set(
          displayBuildings
            .map((building) => building.propertyName)
            .filter(Boolean)
        )
      ),
    [displayBuildings]
  );

  const filteredBuildings = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return displayBuildings.filter((building) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        [
          building.name,
          building.propertyName,
          building.location,
        ].some((value) =>
          value.toLowerCase().includes(normalizedSearch)
        );

      const matchesProperty =
        property === 'All properties' ||
        building.propertyName === property;

      const matchesStatus =
        status === 'All statuses' ||
        building.status === status;

      return matchesSearch && matchesProperty && matchesStatus;
    });
  }, [
    displayBuildings,
    property,
    search,
    status,
  ]);

  const totals = useMemo(() => {
    const totalUnits = displayBuildings.reduce(
      (total, building) =>
        total + building.totalUnits,
      0
    );

    const occupiedUnits = displayBuildings.reduce(
      (total, building) =>
        total + building.occupiedUnits,
      0
    );

    return {
      buildings: displayBuildings.length,
      totalUnits,
      occupiedUnits,
      averageOccupancy:
        totalUnits === 0
          ? 0
          : Math.round(
            (occupiedUnits / totalUnits) * 100
          ),
    };
  }, [displayBuildings]);

  const clearFilters = () => {
    setSearch('');
    setProperty('All properties');
    setStatus('All statuses');
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const handleDelete = async (building: MockBuilding) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${building.name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError('');

      await buildingsApi.delete(building.id);

      setBuildings((currentBuildings) =>
        currentBuildings.filter(
          (item) => item.id !== building.id
        )
      );
    } catch (err: any) {
      console.error(
        'Failed to delete building:',
        err
      );

      if (err?.response?.status === 409) {
        setError(
          'This building cannot be deleted because it is still being used by other records, such as units.'
        );
      } else if (err?.response?.status === 404) {
        setError(
          'The building was not found.'
        );
      } else {
        setError(
          'Failed to delete the building. Please try again.'
        );
      }
    }
  };

  const handleOpenPropertyDialog = () => {
    setSelectedPropertyId(null);
    setPropertySelectionError('');
    setPropertyDialogOpen(true);
  };

  const handleClosePropertyDialog = () => {
    setPropertyDialogOpen(false);
    setSelectedPropertyId(null);
    setPropertySelectionError('');
  };

  const handleContinueToCreate = () => {
    if (selectedPropertyId === null) {
      setPropertySelectionError(
        'Select a property before continuing.'
      );
      return;
    }

    navigate(
      `/properties/${selectedPropertyId}/buildings/create`
    );
  };

  return (
    <Container
      maxWidth="xl"
      sx={{
        py: { xs: 2, md: 3 },
      }}
    >
      {/* Header */}
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
            Buildings
          </Typography>

          <Typography color="text.secondary">
            Manage buildings across your property portfolio.
          </Typography>
        </Box>

        {canManageBuildings && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenPropertyDialog}
          >
            Add building
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
            lg: 'repeat(4, 1fr)',
          },
          gap: 2,
          mb: 3,
        }}
      >
        <DashboardStatCard
          title="Total buildings"
          value={totals.buildings}
          icon={<ApartmentIcon />}
          color="#3b82f6"
        />

        <DashboardStatCard
          title="Total units"
          value={totals.totalUnits}
          icon={<HomeWorkIcon />}
          color="#10b981"
        />

        <DashboardStatCard
          title="Occupied units"
          value={totals.occupiedUnits}
          icon={<CheckCircleIcon />}
          color="#8b5cf6"
        />

        <DashboardStatCard
          title="Average occupancy"
          value={`${totals.averageOccupancy}%`}
          icon={<AccountBalanceWalletIcon />}
          color="#f59e0b"
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
        <BuildingFilters
          search={search}
          property={property}
          status={status}
          properties={propertyNames}
          onSearchChange={handleSearchChange}
          onPropertyChange={setProperty}
          onStatusChange={setStatus}
          onClear={clearFilters}
        />
      </Box>

      {/* Error */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      {/* Loading */}
      {loading && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            py: 8,
          }}
        >
          <CircularProgress aria-label="Loading buildings" />
        </Box>
      )}

      {/* Empty state */}
      {!loading &&
        !error &&
        filteredBuildings.length === 0 && (
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
              No buildings found
            </Typography>

            <Typography
              color="text.secondary"
              sx={{ mb: 2.5 }}
            >
              {displayBuildings.length === 0
                ? 'There are no buildings available yet.'
                : 'Try adjusting your search or filters.'}
            </Typography>

            {displayBuildings.length > 0 && (
              <Button
                variant="outlined"
                onClick={clearFilters}
              >
                Clear filters
              </Button>
            )}
          </Box>
        )}

      {/* Buildings */}
      {!loading &&
        !error &&
        filteredBuildings.length > 0 && (
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
            {filteredBuildings.map((building) => (
              <BuildingCard
                key={building.id}
                building={building}
                canEdit={canManageBuildings}
                onView={(item) =>
                  navigate(
                    `/properties/${item.propertyId}/buildings/${item.id}`
                  )
                }
                onEdit={(item) =>
                  navigate(
                    `/properties/${item.propertyId}/buildings/${item.id}/edit`
                  )
                }
                onDelete={handleDelete}
              />
            ))}
          </Box>
        )}

      {/* Select Property Dialog */}
      <Dialog
        open={propertyDialogOpen}
        onClose={handleClosePropertyDialog}
        fullWidth
        maxWidth="sm"
        aria-labelledby="select-building-property-title"
      >
        <DialogTitle id="select-building-property-title">
          Choose a property
        </DialogTitle>

        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Select the property that the new building will
            belong to.
          </DialogContentText>

          <FormControl
            fullWidth
            error={Boolean(propertySelectionError)}
          >
            <RadioGroup
              aria-label="Property for new building"
              value={
                selectedPropertyId?.toString() ?? ''
              }
              onChange={(event) => {
                setSelectedPropertyId(
                  Number(event.target.value)
                );
                setPropertySelectionError('');
              }}
            >
              {properties.map((propertyOption) => (
                <Box
                  key={propertyOption.id}
                  sx={{
                    border: '1px solid',
                    borderColor:
                      selectedPropertyId ===
                        propertyOption.id
                        ? 'primary.main'
                        : '#e2e8f0',
                    borderRadius: 2,
                    mb: 1,
                    px: 1,
                  }}
                >
                  <FormControlLabel
                    value={propertyOption.id.toString()}
                    control={<Radio />}
                    label={
                      <Box sx={{ py: 0.75 }}>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 600,
                          }}
                        >
                          {propertyOption.name}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          {[
                            propertyOption.city,
                            propertyOption.regionOrSubCity,
                          ]
                            .filter(Boolean)
                            .join(', ')}
                        </Typography>
                      </Box>
                    }
                    sx={{
                      width: '100%',
                      m: 0,
                    }}
                  />
                </Box>
              ))}
            </RadioGroup>

            {propertySelectionError && (
              <Typography
                variant="caption"
                color="error"
                sx={{ mt: 0.5 }}
              >
                {propertySelectionError}
              </Typography>
            )}
          </FormControl>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2,
          }}
        >
          <Button onClick={handleClosePropertyDialog}>
            Cancel
          </Button>

          <Button
            onClick={handleContinueToCreate}
            variant="contained"
          >
            Continue
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BuildingsPage;