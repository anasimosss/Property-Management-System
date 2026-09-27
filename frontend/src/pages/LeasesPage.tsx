import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ApartmentIcon from '@mui/icons-material/Apartment';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DescriptionIcon from '@mui/icons-material/Description';
import EventIcon from '@mui/icons-material/Event';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

import { useAuth } from '../context/AuthContext';
import LeaseCard from '../components/leases/LeaseCard';
import LeaseFilters from '../components/leases/LeaseFilters';

import { leasesApi } from '../api/leases';
import { tenantsApi } from '../api/tenants';
import { unitsApi } from '../api/units';
import { buildingsApi } from '../api/buildings';
import { propertiesApi } from '../api/properties';

import type { Lease } from '../types';

import type {
  LeaseStatus,
  MockLease,
} from '../data/mockLeases';

const toUtcDate = (date: string) =>
  new Date(`${date.slice(0, 10)}T00:00:00Z`);

const getLeaseStatus = (
  lease: Lease,
  referenceDate = new Date()
): LeaseStatus => {
  const reference = new Date(referenceDate);
  reference.setUTCHours(0, 0, 0, 0);

  const start = toUtcDate(lease.startDate);
  const end = toUtcDate(lease.endDate);

  const ninetyDaysLater = new Date(reference);
  ninetyDaysLater.setUTCDate(
    ninetyDaysLater.getUTCDate() + 90
  );

  if (start > reference) {
    return 'Pending';
  }

  if (end < reference) {
    return 'Expired';
  }

  if (end <= ninetyDaysLater) {
    return 'Expiring Soon';
  }

  return 'Active';
};

const formatCurrency = (amount: number) =>
  `$${amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
}

const SummaryCard = ({
  title,
  value,
  subtitle,
  icon,
}: SummaryCardProps) => (
  <Card
    elevation={0}
    sx={{
      height: '100%',
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 3,
      boxShadow: 'none',
    }}
  >
    <CardContent sx={{ p: 2.5 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 0.75 }}
          >
            {title}
          </Typography>

          <Typography
            variant="h5"
            sx={{
              lineHeight: 1.2,
              fontWeight: 700,
            }}
          >
            {value}
          </Typography>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: 'block',
              mt: 0.75,
            }}
          >
            {subtitle}
          </Typography>
        </Box>

        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'action.hover',
            color: 'primary.main',
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const LeasesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

const isTenant = user?.role === 'Tenant';

  const [leases, setLeases] = useState<MockLease[]>([]);

  const [search, setSearch] = useState('');
  const [property, setProperty] =
    useState('All properties');
  const [building, setBuilding] =
    useState('All buildings');
  const [status, setStatus] =
    useState<LeaseStatus | 'All statuses'>(
      'All statuses'
    );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [leaseToDelete, setLeaseToDelete] =
    useState<MockLease | null>(null);

  const canEdit =
    user?.role === 'Admin' ||
    user?.role === 'PropertyManager';

  const canCreate = canEdit;

  /*
   * Load lease data.
   *
   * Tenant:
   *   GET /api/leases already returns only the
   *   leases belonging to the logged-in tenant.
   *
   * Admin / PropertyManager:
   *   Load the related entities so the existing
   *   property/building/unit information continues
   *   to work exactly as before.
   */
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError('');

        const referenceDate = new Date();

        /*
         * TENANT
         *
         * Do not load all tenants, units, properties,
         * or buildings. The backend already isolates
         * the tenant's leases.
         */
        if (user?.role === 'Tenant') {
          const leaseData = await leasesApi.getAll();

          const mappedLeases: MockLease[] =
            leaseData.map((lease) => ({
              id: lease.id,

              leaseNumber: `LS-${String(
                lease.id
              ).padStart(4, '0')}`,

              propertyId: 0,

              propertyName: 'My Property',

              buildingId: 0,

              buildingName: 'My Building',

              unitId: lease.unitId,

              unitNumber:
                lease.unitNumber ?? 'My Unit',

              tenantId: lease.tenantId,

              tenantName:
                lease.tenantName ?? 'My Lease',

              location: 'My Property',

              startDate: lease.startDate,
              endDate: lease.endDate,

              monthlyRent: lease.rentAmount,

              securityDeposit:
                lease.securityDepositAmount,

              dueDay:
                lease.rentDueDayOfMonth,

              status: getLeaseStatus(
                lease,
                referenceDate
              ),
            }));

          setLeases(mappedLeases);
          return;
        }

        /*
         * ADMIN / PROPERTY MANAGER
         *
         * Keep the existing data-loading behavior.
         */
        const [
          leaseData,
          tenantData,
          unitData,
          propertyData,
        ] = await Promise.all([
          leasesApi.getAll(),
          tenantsApi.getAll(),
          unitsApi.getAll(),
          propertiesApi.getAll(),
        ]);

        const buildingResults = await Promise.all(
          propertyData.map((propertyItem) =>
            buildingsApi.getByProperty(propertyItem.id)
          )
        );

        const buildingData =
          buildingResults.flat();

        const mappedLeases: MockLease[] =
          leaseData.map((lease) => {
            const tenant = tenantData.find(
              (item) => item.id === lease.tenantId
            );

            const unit = unitData.find(
              (item) => item.id === lease.unitId
            );

            const building = unit
              ? buildingData.find(
                (item) =>
                  item.id === unit.buildingId
              )
              : undefined;

            const propertyItem = building
              ? propertyData.find(
                (item) =>
                  item.id === building.propertyId
              )
              : undefined;

            const statusValue = getLeaseStatus(
              lease,
              referenceDate
            );

            return {
              id: lease.id,

              leaseNumber: `LS-${String(
                lease.id
              ).padStart(4, '0')}`,

              propertyId:
                propertyItem?.id ?? 0,

              propertyName:
                propertyItem?.name ??
                'Unassigned property',

              buildingId:
                building?.id ?? 0,

              buildingName:
                building?.name ??
                'Unassigned building',

              unitId:
                unit?.id ?? lease.unitId,

              unitNumber:
                unit?.unitNumber ??
                'Unassigned',

              tenantId: lease.tenantId,

              tenantName: tenant
                ? `${tenant.firstName} ${tenant.lastName}`.trim()
                : 'Unknown tenant',

              location: propertyItem
                ? [
                  propertyItem.regionOrSubCity,
                  propertyItem.city,
                ]
                  .filter(Boolean)
                  .join(', ')
                : 'Location unavailable',

              startDate: lease.startDate,
              endDate: lease.endDate,

              monthlyRent: lease.rentAmount,

              securityDeposit:
                lease.securityDepositAmount,

              dueDay:
                lease.rentDueDayOfMonth,

              status: statusValue,
            };
          });

        setLeases(mappedLeases);
      } catch (err: unknown) {
        console.error(
          'Failed to load leases:',
          err
        );

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
          'Failed to load leases.'
        );
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [user?.role]);

  const properties = useMemo(
    () =>
      Array.from(
        new Set(
          leases.map(
            (lease) => lease.propertyName
          )
        )
      ),
    [leases]
  );

  const buildings = useMemo(() => {
    const source =
      property === 'All properties'
        ? leases
        : leases.filter(
          (lease) =>
            lease.propertyName === property
        );

    return Array.from(
      new Set(
        source.map(
          (lease) => lease.buildingName
        )
      )
    );
  }, [leases, property]);

  const filteredLeases = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    return leases.filter((lease) => {
      const matchesSearch =
        !searchValue ||
        lease.leaseNumber
          .toLowerCase()
          .includes(searchValue) ||
        lease.tenantName
          .toLowerCase()
          .includes(searchValue) ||
        lease.unitNumber
          .toLowerCase()
          .includes(searchValue) ||
        lease.buildingName
          .toLowerCase()
          .includes(searchValue) ||
        lease.propertyName
          .toLowerCase()
          .includes(searchValue) ||
        lease.location
          .toLowerCase()
          .includes(searchValue);

      const matchesProperty =
        property === 'All properties' ||
        lease.propertyName === property;

      const matchesBuilding =
        building === 'All buildings' ||
        lease.buildingName === building;

      const matchesStatus =
        status === 'All statuses' ||
        lease.status === status;

      return (
        matchesSearch &&
        matchesProperty &&
        matchesBuilding &&
        matchesStatus
      );
    });
  }, [
    leases,
    search,
    property,
    building,
    status,
  ]);

  const totalLeases = leases.length;

  const activeLeases = leases.filter(
    (lease) => lease.status === 'Active'
  ).length;

  const expiringSoon = leases.filter(
    (lease) => lease.status === 'Expiring Soon'
  ).length;

  const monthlyRent = leases
    .filter(
      (lease) =>
        lease.status !== 'Expired'
    )
    .reduce(
      (total, lease) =>
        total + lease.monthlyRent,
      0
    );

  const totalDeposits = leases.reduce(
    (total, lease) =>
      total + lease.securityDeposit,
    0
  );

  const handlePropertyChange = (
    value: string
  ) => {
    setProperty(value);

    if (value === 'All properties') {
      setBuilding('All buildings');
      return;
    }

    const validBuildings =
      Array.from(
        new Set(
          leases
            .filter(
              (lease) =>
                lease.propertyName === value
            )
            .map(
              (lease) =>
                lease.buildingName
            )
        )
      );

    if (!validBuildings.includes(building)) {
      setBuilding('All buildings');
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setProperty('All properties');
    setBuilding('All buildings');
    setStatus('All statuses');
  };

  const handlePayRent = (lease: MockLease) => {
  navigate(`/payments/pay?leaseId=${lease.id}`);
};

  const hasFilters =
    search.trim() !== '' ||
    property !== 'All properties' ||
    building !== 'All buildings' ||
    status !== 'All statuses';

  const handleDeleteConfirm = async () => {
    if (!leaseToDelete) {
      return;
    }

    try {
      await leasesApi.delete(
        leaseToDelete.id
      );

      setLeases((current) =>
        current.filter(
          (lease) =>
            lease.id !== leaseToDelete.id
        )
      );

      setLeaseToDelete(null);
    } catch (err: unknown) {
      console.error(
        'Failed to delete lease:',
        err
      );

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
        'Failed to delete lease.'
      );

      setLeaseToDelete(null);
    }
  };

  return (
    <Container
      maxWidth="xl"
      sx={{
        py: { xs: 2, md: 4 },
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
          flexDirection: {
            xs: 'column',
            sm: 'row',
          },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              mb: 0.75,
              fontWeight: 700,
            }}
          >
            Leases
          </Typography>

          <Typography color="text.secondary">
            Manage rental agreements, lease terms,
            rent, and deposits.
          </Typography>
        </Box>

        {canCreate && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() =>
              navigate('/leases/create')
            }
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 2.5,
              whiteSpace: 'nowrap',
            }}
          >
            Add Lease
          </Button>
        )}
      </Box>

      {/* Summary cards */}
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
        <SummaryCard
          title="Total Leases"
          value={totalLeases}
          subtitle="All lease agreements"
          icon={<DescriptionIcon />}
        />

        <SummaryCard
          title="Active"
          value={activeLeases}
          subtitle="Currently active"
          icon={<ApartmentIcon />}
        />

        <SummaryCard
          title="Expiring Soon"
          value={expiringSoon}
          subtitle="Within 90 days"
          icon={<EventIcon />}
        />

        <SummaryCard
          title="Monthly Rent"
          value={formatCurrency(monthlyRent)}
          subtitle="Across current leases"
          icon={<AttachMoneyIcon />}
        />

        <SummaryCard
          title="Total Deposits"
          value={formatCurrency(totalDeposits)}
          subtitle="Security deposits"
          icon={<AccountBalanceWalletIcon />}
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
          <CircularProgress
            aria-label="Loading leases"
          />
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

      {/* Expiring alert */}
      {!loading &&
        !error &&
        expiringSoon > 0 && (
          <Alert
            severity="warning"
            sx={{
              mb: 3,
              borderRadius: 2,
            }}
          >
            <strong>
              {expiringSoon} lease
              {expiringSoon > 1 ? 's' : ''}
            </strong>{' '}
            {expiringSoon > 1 ? 'are' : 'is'} expiring
            within the next 90 days.
          </Alert>
        )}

      {/* Filters */}
      {!loading && (
        <Box sx={{ mb: 3 }}>
          <LeaseFilters
            search={search}
            property={property}
            building={building}
            status={status}
            properties={properties}
            buildings={buildings}
            onSearchChange={setSearch}
            onPropertyChange={
              handlePropertyChange
            }
            onBuildingChange={setBuilding}
            onStatusChange={setStatus}
            onClear={handleClearFilters}
          />
        </Box>
      )}

      {/* Empty state */}
      {!loading &&
        !error &&
        filteredLeases.length === 0 && (
          <Card
            elevation={0}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
              textAlign: 'center',
              py: 8,
              px: 3,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                mb: 1,
                fontWeight: 600,
              }}
            >
              No Leases Found
            </Typography>

            <Typography
              color="text.secondary"
              sx={{ mb: 3 }}
            >
              {hasFilters
                ? 'No leases match your current search and filters.'
                : 'There are no lease records to display.'}
            </Typography>

            {hasFilters && (
              <Button
                variant="outlined"
                onClick={handleClearFilters}
                sx={{
                  textTransform: 'none',
                  borderRadius: 2,
                }}
              >
                Clear Filters
              </Button>
            )}
          </Card>
        )}

      {/* Lease cards */}
      {!loading &&
        !error &&
        filteredLeases.length > 0 && (
          <>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Showing {filteredLeases.length} of{' '}
                {totalLeases} leases
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  md: 'repeat(2, minmax(0, 1fr))',
                  xl: 'repeat(3, minmax(0, 1fr))',
                },
                gap: 2.5,
              }}
            >
              {filteredLeases.map((lease) => (
               <LeaseCard
  key={lease.id}
  lease={lease}
  canEdit={canEdit}
  onView={() =>
    navigate(`/leases/${lease.id}`)
  }
  onEdit={() =>
    navigate(`/leases/${lease.id}/edit`)
  }
  onDelete={() =>
    setLeaseToDelete(lease)
  }
  onPayRent={
    isTenant
      ? handlePayRent
      : undefined
  }
/>
              ))}
            </Box>
          </>
        )}

      {/* Delete confirmation */}
      <Dialog
        open={Boolean(leaseToDelete)}
        onClose={() =>
          setLeaseToDelete(null)
        }
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          Delete Lease?
        </DialogTitle>

        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete{' '}
            <strong>
              {leaseToDelete?.leaseNumber}
            </strong>{' '}
            for{' '}
            <strong>
              {leaseToDelete?.tenantName}
            </strong>
            ?
          </DialogContentText>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2,
          }}
        >
          <Button
            onClick={() =>
              setLeaseToDelete(null)
            }
            sx={{
              textTransform: 'none',
            }}
          >
            Cancel
          </Button>

          <Button
            onClick={() =>
              void handleDeleteConfirm()
            }
            color="error"
            variant="contained"
            sx={{
              textTransform: 'none',
              borderRadius: 2,
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default LeasesPage;