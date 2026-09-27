import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import { leasesApi } from '../api/leases';
import { unitsApi } from '../api/units';
import { tenantsApi } from '../api/tenants';
import { useAuth } from '../context/AuthContext';
import type { Tenant, Unit } from '../types';

const EditLeasePage = () => {
  const { leaseId } = useParams<{ leaseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [units, setUnits] = useState<Unit[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);

  const [unitId, setUnitId] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [rentAmount, setRentAmount] = useState('');
  const [securityDepositAmount, setSecurityDepositAmount] = useState('');
  const [securityDepositPaid, setSecurityDepositPaid] = useState(false);
  const [rentDueDayOfMonth, setRentDueDayOfMonth] = useState('');
  const [status, setStatus] = useState('Draft');
  const [terms, setTerms] = useState('');

  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const canEdit =
    user?.role === 'Admin' || user?.role === 'PropertyManager';

  useEffect(() => {
    const loadData = async () => {
      if (!leaseId) {
        setError('Lease ID is required.');
        setLoadingData(false);
        return;
      }

      const parsedLeaseId = parseInt(leaseId, 10);

      if (Number.isNaN(parsedLeaseId)) {
        setError('Invalid Lease ID.');
        setLoadingData(false);
        return;
      }

      try {
        setLoadingData(true);
        setError('');

        const [lease, unitsData, tenantsData] = await Promise.all([
          leasesApi.getById(parsedLeaseId),
          unitsApi.getAll(),
          tenantsApi.getAll(),
        ]);

        setUnits(unitsData);
        setTenants(tenantsData);

        setUnitId(String(lease.unitId));
        setTenantId(String(lease.tenantId));
        setStartDate(lease.startDate);
        setEndDate(lease.endDate);
        setRentAmount(String(lease.rentAmount));
        setSecurityDepositAmount(
          String(lease.securityDepositAmount)
        );
        setSecurityDepositPaid(lease.securityDepositPaid);
        setRentDueDayOfMonth(String(lease.rentDueDayOfMonth));
        setStatus(lease.status);
        setTerms(lease.terms ?? '');
      } catch (err: any) {
        if (err.response?.status === 404) {
          setError(`Lease with ID ${leaseId} was not found.`);
        } else if (err.response?.status === 401) {
          setError('Authentication required. Please log in again.');
        } else {
          setError(
            err.response?.data?.message ||
            err.message ||
            'Failed to load lease.'
          );
        }
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [leaseId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!leaseId) {
      setError('Lease ID is required.');
      return;
    }

    if (!unitId) {
      setError('Please select a unit.');
      return;
    }

    if (!tenantId) {
      setError('Please select a tenant.');
      return;
    }

    if (!startDate || !endDate) {
      setError('Start date and end date are required.');
      return;
    }

    if (endDate < startDate) {
      setError('End date cannot be earlier than start date.');
      return;
    }

    const parsedUnitId = Number(unitId);
    const parsedTenantId = Number(tenantId);
    const parsedRentAmount = Number(rentAmount);
    const parsedSecurityDeposit = Number(securityDepositAmount);
    const parsedDueDay = Number(rentDueDayOfMonth);

    if (!Number.isInteger(parsedUnitId) || parsedUnitId <= 0) {
      setError('Invalid unit.');
      return;
    }

    if (!Number.isInteger(parsedTenantId) || parsedTenantId <= 0) {
      setError('Invalid tenant.');
      return;
    }

    if (Number.isNaN(parsedRentAmount) || parsedRentAmount < 0) {
      setError('Rent amount must be 0 or greater.');
      return;
    }

    if (
      Number.isNaN(parsedSecurityDeposit) ||
      parsedSecurityDeposit < 0
    ) {
      setError('Security deposit must be 0 or greater.');
      return;
    }

    if (
      !Number.isInteger(parsedDueDay) ||
      parsedDueDay < 1 ||
      parsedDueDay > 31
    ) {
      setError('Rent due day must be between 1 and 31.');
      return;
    }

    try {
      setSaving(true);

      await leasesApi.update(parseInt(leaseId, 10), {
        unitId: parsedUnitId,
        tenantId: parsedTenantId,
        startDate,
        endDate,
        rentAmount: parsedRentAmount,
        securityDepositAmount: parsedSecurityDeposit,
        securityDepositPaid,
        rentDueDayOfMonth: parsedDueDay,
        status,
        terms: terms.trim() || null,
      });

      navigate(`/leases/${leaseId}`);
    } catch (err: any) {
      if (err.response?.status === 400) {
        setError(
          err.response?.data?.message ||
          'Please check the lease information.'
        );
      } else if (err.response?.status === 401) {
        setError('Authentication required. Please log in again.');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to edit this lease.');
      } else if (err.response?.status === 404) {
        setError(
          err.response?.data?.message ||
          'The lease, unit, or tenant was not found.'
        );
      } else if (err.response?.status === 409) {
        setError(
          err.response?.data?.message ||
          'The unit already has an overlapping active lease.'
        );
      } else {
        setError(
          err.response?.data?.message ||
          err.message ||
          'Failed to update lease.'
        );
      }
    } finally {
      setSaving(false);
    }
  };

  if (!canEdit) {
    return (
      <Box
        sx={{
          width: '100%',
          minWidth: 0,
          p: { xs: 2, sm: 3 },
        }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/leases/${leaseId}`)}
          sx={{
            mb: 3,
            color: 'text.secondary',
            '&:hover': {
              bgcolor: 'transparent',
              color: 'text.primary',
            },
          }}
        >
          Back to Lease
        </Button>

        <Alert severity="error">
          Access Denied. Only Admins and Property Managers can edit
          leases.
        </Alert>
      </Box>
    );
  }

  if (loadingData) {
    return (
      <Box
        sx={{
          width: '100%',
          minWidth: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          py: 12,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        minWidth: 0,
        p: { xs: 2, sm: 3, md: 4 },
      }}
    >
      {/* Back Button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(`/leases/${leaseId}`)}
        sx={{
          mb: 2.5,
          color: 'text.secondary',
          px: 0,
          '&:hover': {
            bgcolor: 'transparent',
            color: 'text.primary',
          },
        }}
      >
        Back to Lease
      </Button>

      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
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
              display: 'grid',
              placeItems: 'center',
              bgcolor: 'rgba(59, 130, 246, 0.1)',
              color: 'primary.main',
              flexShrink: 0,
            }}
          >
            <DescriptionOutlinedIcon />
          </Box>

          <Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 700,
                fontSize: {
                  xs: '1.5rem',
                  sm: '1.75rem',
                },
                lineHeight: 1.2,
              }}
            >
              Edit Lease
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              Update the lease details, financial information, and
              terms.
            </Typography>
          </Box>
        </Box>
      </Box>

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

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5,
        }}
      >
        {/* Lease Information */}
        <Paper
          elevation={0}
          sx={{
            border: '1px solid #e2e8f0',
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              px: { xs: 2, sm: 3 },
              py: 2,
              bgcolor: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
            }}
          >
            <DescriptionOutlinedIcon
              sx={{
                color: 'primary.main',
                fontSize: 21,
              }}
            />

            <Box>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600 }}
              >
                Lease Information
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.35 }}
              >
                Select the unit, tenant, and current lease status.
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              p: { xs: 2, sm: 3 },
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(2, minmax(0, 1fr))',
              },
              gap: 2.5,
            }}
          >
            <TextField
              fullWidth
              required
              select
              label="Unit"
              value={unitId}
              onChange={(event) => setUnitId(event.target.value)}
              disabled={saving}
            >
              {units.length === 0 ? (
                <MenuItem disabled value="">
                  No units available
                </MenuItem>
              ) : (
                units.map((unit) => (
                  <MenuItem key={unit.id} value={unit.id}>
                    {unit.unitNumber} — {unit.buildingName}
                  </MenuItem>
                ))
              )}
            </TextField>

            <TextField
              fullWidth
              required
              select
              label="Tenant"
              value={tenantId}
              onChange={(event) => setTenantId(event.target.value)}
              disabled={saving}
            >
              {tenants.length === 0 ? (
                <MenuItem disabled value="">
                  No tenants available
                </MenuItem>
              ) : (
                tenants.map((tenant) => (
                  <MenuItem key={tenant.id} value={tenant.id}>
                    {tenant.firstName} {tenant.lastName}
                  </MenuItem>
                ))
              )}
            </TextField>

            <TextField
              fullWidth
              select
              label="Status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              disabled={saving}
            >
              <MenuItem value="Draft">Draft</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Expired">Expired</MenuItem>
              <MenuItem value="TerminatedEarly">
                Terminated Early
              </MenuItem>
            </TextField>
          </Box>
        </Paper>

        {/* Lease Period & Financial Information */}
        <Paper
          elevation={0}
          sx={{
            border: '1px solid #e2e8f0',
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              px: { xs: 2, sm: 3 },
              py: 2,
              bgcolor: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
            }}
          >
            <CalendarTodayOutlinedIcon
              sx={{
                color: 'primary.main',
                fontSize: 21,
              }}
            />

            <Box>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600 }}
              >
                Lease Period & Financial Information
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.35 }}
              >
                Manage the lease dates, rent, deposit, and payment
                schedule.
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              p: { xs: 2, sm: 3 },
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(2, minmax(0, 1fr))',
              },
              gap: 2.5,
            }}
          >
            <TextField
              fullWidth
              required
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
              disabled={saving}
            />

            <TextField
              fullWidth
              required
              label="End Date"
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
              disabled={saving}
            />

            <TextField
              fullWidth
              required
              label="Rent Amount"
              type="number"
              value={rentAmount}
              onChange={(event) => setRentAmount(event.target.value)}
              slotProps={{
                htmlInput: {
                  min: 0,
                  step: 0.01,
                },
              }}
              disabled={saving}
            />

            <TextField
              fullWidth
              required
              label="Security Deposit Amount"
              type="number"
              value={securityDepositAmount}
              onChange={(event) =>
                setSecurityDepositAmount(event.target.value)
              }
              slotProps={{
                htmlInput: {
                  min: 0,
                  step: 0.01,
                },
              }}
              disabled={saving}
            />

            <TextField
              fullWidth
              required
              label="Rent Due Day of Month"
              type="number"
              value={rentDueDayOfMonth}
              onChange={(event) =>
                setRentDueDayOfMonth(event.target.value)
              }
              slotProps={{
                htmlInput: {
                  min: 1,
                  max: 31,
                  step: 1,
                },
              }}
              helperText="Enter a day from 1 to 31."
              disabled={saving}
            />

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                minHeight: 56,
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={securityDepositPaid}
                    onChange={(event) =>
                      setSecurityDepositPaid(event.target.checked)
                    }
                    disabled={saving}
                  />
                }
                label="Security deposit paid"
              />
            </Box>
          </Box>
        </Paper>

        {/* Terms & Conditions */}
        <Paper
          elevation={0}
          sx={{
            border: '1px solid #e2e8f0',
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              px: { xs: 2, sm: 3 },
              py: 2,
              bgcolor: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
            }}
          >
            <PaymentsOutlinedIcon
              sx={{
                color: 'primary.main',
                fontSize: 21,
              }}
            />

            <Box>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600 }}
              >
                Terms & Conditions
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.35 }}
              >
                Add or update any additional lease terms and
                conditions.
              </Typography>
            </Box>
          </Box>

          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            <TextField
              fullWidth
              label="Terms"
              multiline
              minRows={5}
              value={terms}
              onChange={(event) => setTerms(event.target.value)}
              disabled={saving}
              placeholder="Enter any additional lease terms or conditions..."
            />
          </Box>
        </Paper>

        {/* Actions */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 1.5,
            flexWrap: 'wrap',
            pt: 1,
          }}
        >
          <Button
            variant="outlined"
            onClick={() => navigate(`/leases/${leaseId}`)}
            disabled={saving}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={saving}
            startIcon={
              saving ? (
                <CircularProgress size={18} color="inherit" />
              ) : undefined
            }
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default EditLeasePage;