import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Typography,
  useTheme,
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AddIcon from '@mui/icons-material/Add';
import ApartmentIcon from '@mui/icons-material/Apartment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HomeWorkIcon from '@mui/icons-material/HomeWork';

import PropertySummaryCard from '../components/properties/PropertySummaryCard';
import PropertyFilters, {
  type PropertyStatusFilter,
  type PropertyTypeFilter,
} from '../components/properties/PropertyFilters';
import PropertyCard from '../components/properties/PropertyCard';
import { propertiesApi } from '../api/properties';
import { useAuth } from '../context/AuthContext';
import type { Property } from '../types';
import type { MockProperty } from '../data/mockProperties';

const PropertiesPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const theme = useTheme();
  const { user } = useAuth();

  const [properties, setProperties] = useState<MockProperty[]>([]);
  const [search, setSearch] = useState(
    searchParams.get('search') || ''
  );
  const [type, setType] =
    useState<PropertyTypeFilter>('All types');
  const [status, setStatus] =
    useState<PropertyStatusFilter>('All statuses');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProperties = async () => {
      try {
        setLoading(true);
        setError('');

        const data: Property[] = await propertiesApi.getAll();

        const mappedProperties: MockProperty[] = data.map(
          (property) => ({
            id: property.id,
            name: property.name,
            location: [property.city, property.regionOrSubCity]
              .filter(Boolean)
              .join(', '),
            address: [
              property.addressLine1,
              property.addressLine2,
            ]
              .filter(Boolean)
              .join(', '),
            type: property.propertyType as MockProperty['type'],

            // Real statistics from the backend
            buildings: property.buildingCount,
            totalUnits: property.totalUnits,
            occupiedUnits: property.occupiedUnits,
            monthlyIncome: property.monthlyIncome,

            status: 'Active',
          })
        );

        setProperties(mappedProperties);
      } catch (err) {
        console.error('Failed to load properties:', err);
        setError(
          'Failed to load properties. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, []);

  const filteredProperties = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return properties.filter((property) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        [
          property.name,
          property.location,
          property.address,
          property.type,
        ].some((value) =>
          value.toLowerCase().includes(normalizedSearch)
        );

      const matchesType =
        type === 'All types' || property.type === type;

      const matchesStatus =
        status === 'All statuses' ||
        property.status === status;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [properties, search, status, type]);

  const totals = useMemo(
    () => ({
      properties: properties.length,
      units: properties.reduce(
        (total, property) =>
          total + property.totalUnits,
        0
      ),
      occupied: properties.reduce(
        (total, property) =>
          total + property.occupiedUnits,
        0
      ),
      income: properties.reduce(
        (total, property) =>
          total + property.monthlyIncome,
        0
      ),
    }),
    [properties]
  );

  const canManageProperties =
    user?.role === 'Admin' ||
    user?.role === 'PropertyManager';

  const clearFilters = () => {
    setSearch('');
    setType('All types');
    setStatus('All statuses');
  };

  const handleDelete = async (id: number) => {
    const property = properties.find(
      (item) => item.id === id
    );

    if (!property) {
      return;
    }

    if (!window.confirm(`Delete ${property.name}?`)) {
      return;
    }

    try {
      await propertiesApi.delete(id);

      setProperties((currentProperties) =>
        currentProperties.filter(
          (item) => item.id !== id
        )
      );
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        'Failed to delete property. Please try again.';

      window.alert(message);

      console.error(
        'Failed to delete property:',
        error
      );
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        minWidth: 0,
        px: { xs: 0, sm: 1 },
        py: { xs: 0, md: 1 },
        boxSizing: 'border-box',
      }}
    >
      <Container
        maxWidth="xl"
        sx={{
          px: { xs: 0, sm: 2, md: 3 },
        }}
      >
        {/* Page Header */}
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
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor:
                    'rgba(59, 130, 246, 0.1)',
                  color: theme.palette.primary.main,
                  flexShrink: 0,
                }}
              >
                <ApartmentIcon />
              </Box>

              <Box>
                <Typography
                  variant="h4"
                  component="h1"
                  sx={{
                    fontWeight: 700,
                    color: 'text.primary',
                  }}
                >
                  Properties
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    mt: 0.5,
                  }}
                >
                  Manage your property portfolio,
                  occupancy, and monthly performance.
                </Typography>
              </Box>
            </Box>
          </Box>

          {canManageProperties && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() =>
                navigate('/properties/create')
              }
              sx={{
                px: 2.5,
                py: 1.1,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: 'none',
                whiteSpace: 'nowrap',
                '&:hover': {
                  boxShadow: 'none',
                },
              }}
            >
              Add property
            </Button>
          )}
        </Box>

        {/* Summary Cards */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              lg: 'repeat(4, minmax(0, 1fr))',
            },
            gap: 2,
            mb: 3,
          }}
        >
          <PropertySummaryCard
            label="Total properties"
            value={totals.properties}
            icon={<ApartmentIcon />}
            color="#3b82f6"
          />

          <PropertySummaryCard
            label="Total units"
            value={totals.units}
            icon={<HomeWorkIcon />}
            color="#10b981"
          />

          <PropertySummaryCard
            label="Occupied units"
            value={totals.occupied}
            icon={<CheckCircleIcon />}
            color="#8b5cf6"
          />

          <PropertySummaryCard
            label="Monthly income"
            value={`$${totals.income.toLocaleString()}`}
            icon={<AccountBalanceWalletIcon />}
            color="#f59e0b"
          />
        </Box>

        {/* Filters */}
        <Box
          sx={{
            width: '100%',
            p: { xs: 2, sm: 2.5 },
            mb: 3,
            bgcolor: 'background.paper',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 3,
            boxSizing: 'border-box',
          }}
        >
          <PropertyFilters
            search={search}
            type={type}
            status={status}
            onSearchChange={setSearch}
            onTypeChange={setType}
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
              alignItems: 'center',
              minHeight: 280,
            }}
          >
            <CircularProgress aria-label="Loading properties" />
          </Box>
        )}

        {/* Error */}
        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: 2,
            }}
          >
            {error}
          </Alert>
        )}

        {/* Empty State */}
        {!loading &&
          !error &&
          filteredProperties.length === 0 && (
            <Box
              sx={{
                p: { xs: 4, md: 7 },
                textAlign: 'center',
                bgcolor: 'background.paper',
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 3,
              }}
            >
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  mx: 'auto',
                  mb: 2,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor:
                    'rgba(59, 130, 246, 0.1)',
                  color: theme.palette.primary.main,
                }}
              >
                <ApartmentIcon />
              </Box>

              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                  mb: 1,
                }}
              >
                No properties found
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  mb: 2.5,
                }}
              >
                Try adjusting your search or filters.
              </Typography>

              <Button
                variant="outlined"
                onClick={clearFilters}
                sx={{
                  px: 2.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Clear filters
              </Button>
            </Box>
          )}

        {/* Property Cards */}
        {!loading &&
          !error &&
          filteredProperties.length > 0 && (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  md: 'repeat(2, minmax(0, 1fr))',
                  xl: 'repeat(3, minmax(0, 1fr))',
                },
                gap: 3,
                pb: 2,
              }}
            >
              {filteredProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  canEdit={canManageProperties}
                  onView={(id) =>
                    navigate(`/properties/${id}`)
                  }
                  onEdit={(id) =>
                    navigate(`/properties/${id}/edit`)
                  }
                  onDelete={handleDelete}
                />
              ))}
            </Box>
          )}
      </Container>
    </Box>
  );
};

export default PropertiesPage;
