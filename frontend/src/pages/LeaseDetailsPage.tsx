import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';

import { leasesApi } from '../api/leases';
import { useAuth } from '../context/AuthContext';
import type { Lease } from '../types';

const LeaseDetailsPage = () => {
  const { leaseId } = useParams<{ leaseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [lease, setLease] = useState<Lease | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    const fetchLease = async () => {
      if (!leaseId) {
        setError('Lease ID is required.');
        setLoading(false);
        return;
      }

      const parsedLeaseId = parseInt(leaseId, 10);

      if (Number.isNaN(parsedLeaseId)) {
        setError('Invalid Lease ID.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const data = await leasesApi.getById(parsedLeaseId);
        setLease(data);
      } catch (err: any) {
        if (err.response?.status === 404) {
          setError('Lease with ID ' + leaseId + ' was not found.');
        } else if (err.response?.status === 401) {
          setError('Authentication required. Please log in again.');
        } else {
          setError(
            err.response?.data?.message ||
            err.message ||
            'Failed to load lease details.'
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLease();
  }, [leaseId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    setDeleteError('');
  };

  const handleDeleteCancel = () => {
    if (deleting) return;

    setDeleteDialogOpen(false);
    setDeleteError('');
  };

  const handleDeleteConfirm = async () => {
    if (!leaseId) return;

    const parsedLeaseId = parseInt(leaseId, 10);

    if (Number.isNaN(parsedLeaseId)) {
      setDeleteError('Invalid Lease ID.');
      return;
    }

    try {
      setDeleting(true);
      setDeleteError('');

      await leasesApi.delete(parsedLeaseId);

      navigate('/leases');
    } catch (err: any) {
      if (err.response?.status === 409) {
        setDeleteError(
          'This lease cannot be deleted because it has related payments.'
        );
      } else if (err.response?.status === 404) {
        setDeleteError('Lease not found.');
      } else if (err.response?.status === 403) {
        setDeleteError(
          'You do not have permission to delete this lease.'
        );
      } else if (err.response?.status === 401) {
        setDeleteError(
          'Authentication required. Please log in again.'
        );
      } else {
        setDeleteError(
          err.response?.data?.message ||
          err.message ||
          'Failed to delete lease. Please try again.'
        );
      }
    } finally {
      setDeleting(false);
    }
  };

  const getStatusStyles = (status: string) => {
    const normalizedStatus = status.toLowerCase();

    if (normalizedStatus === 'active') {
      return {
        backgroundColor: '#dcfce7',
        color: '#166534',
      };
    }

    if (normalizedStatus === 'pending') {
      return {
        backgroundColor: '#fef3c7',
        color: '#92400e',
      };
    }

    if (
      normalizedStatus === 'expiring soon' ||
      normalizedStatus === 'expiringsoon'
    ) {
      return {
        backgroundColor: '#ffedd5',
        color: '#c2410c',
      };
    }

    if (normalizedStatus === 'expired') {
      return {
        backgroundColor: '#fee2e2',
        color: '#991b1b',
      };
    }

    return {
      backgroundColor: '#f1f5f9',
      color: '#475569',
    };
  };

  if (loading) {
    return (
      <Box
        sx={{
          width: '100%',
          minWidth: 0,
          px: { xs: 2, sm: 3, md: 4 },
          py: 4,
        }}
      >
        <Box
          sx={{
            minHeight: 400,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          width: '100%',
          minWidth: 0,
          px: { xs: 2, sm: 3, md: 4 },
          py: 4,
        }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/leases')}
          sx={{
            mb: 3,
            color: 'text.secondary',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: 'rgba(15, 23, 42, 0.04)',
            },
          }}
        >
          Back to Leases
        </Button>

        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!lease) {
    return (
      <Box
        sx={{
          width: '100%',
          minWidth: 0,
          px: { xs: 2, sm: 3, md: 4 },
          py: 4,
        }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/leases')}
          sx={{
            mb: 3,
            color: 'text.secondary',
            fontWeight: 600,
          }}
        >
          Back to Leases
        </Button>

        <Alert severity="info">Lease not found.</Alert>
      </Box>
    );
  }

  const statusStyles = getStatusStyles(lease.status);

  return (
    <Box
      sx={{
        width: '100%',
        minWidth: 0,
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 2, md: 3 },
      }}
    >
      {/* Back Button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/leases')}
        sx={{
          mb: 3,
          color: 'text.secondary',
          fontWeight: 600,
          '&:hover': {
            backgroundColor: 'rgba(15, 23, 42, 0.04)',
          },
        }}
      >
        Back to Leases
      </Button>

      {/* Page Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: 3,
          flexWrap: 'wrap',
          mb: 3,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            minWidth: 0,
          }}
        >
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              flexShrink: 0,
            }}
          >
            <DescriptionOutlinedIcon sx={{ fontSize: 28 }} />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 700,
                color: '#0f172a',
                fontSize: { xs: '1.6rem', sm: '2rem' },
              }}
            >
              Lease #{lease.id}
            </Typography>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mt: 0.75,
                flexWrap: 'wrap',
              }}
            >
              <Box
                component="span"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  px: 1.25,
                  py: 0.5,
                  borderRadius: 999,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  ...statusStyles,
                }}
              >
                {lease.status}
              </Box>

              <Typography
                variant="body2"
                sx={{ color: 'text.secondary' }}
              >
                Lease ID: {lease.id}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Actions */}
        <Box
          sx={{
            display: 'flex',
            gap: 1.5,
            flexWrap: 'wrap',
          }}
        >
          {(user?.role === 'Admin' ||
            user?.role === 'PropertyManager') && (
              <Button
                variant="outlined"
                startIcon={<EditOutlinedIcon />}
                onClick={() =>
                  navigate(`/leases/${lease.id}/edit`)
                }
                sx={{
                  borderColor: '#cbd5e1',
                  color: '#334155',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: '#94a3b8',
                    backgroundColor: '#f8fafc',
                  },
                }}
              >
                Edit Lease
              </Button>
            )}

          {user?.role === 'Admin' && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteClick}
              sx={{
                fontWeight: 600,
              }}
            >
              Delete Lease
            </Button>
          )}
        </Box>
      </Box>

      {/* Lease Information */}
      <DetailSection
        icon={<DescriptionOutlinedIcon />}
        title="Lease Information"
      >
        <DetailItem
          label="Lease ID"
          value={lease.id}
        />

        <DetailItem
          label="Status"
          value={
            <Box
              component="span"
              sx={{
                display: 'inline-flex',
                px: 1.25,
                py: 0.5,
                borderRadius: 999,
                fontSize: '0.8rem',
                fontWeight: 700,
                ...statusStyles,
              }}
            >
              {lease.status}
            </Box>
          }
        />

        <DetailItem
          label="Unit"
          value={`${lease.unitNumber} (ID: ${lease.unitId})`}
          icon={<HomeWorkOutlinedIcon />}
        />

        <DetailItem
          label="Tenant"
          value={`${lease.tenantName} (ID: ${lease.tenantId})`}
          icon={<PersonIcon />}
        />
      </DetailSection>

      {/* Lease Period */}
      <DetailSection
        icon={<CalendarTodayOutlinedIcon />}
        title="Lease Period"
      >
        <DetailItem
          label="Start Date"
          value={formatDate(lease.startDate)}
          icon={<CalendarTodayOutlinedIcon />}
        />

        <DetailItem
          label="End Date"
          value={formatDate(lease.endDate)}
          icon={<EventOutlinedIcon />}
        />

        <DetailItem
          label="Rent Due Day"
          value={`Day ${lease.rentDueDayOfMonth} of each month`}
        />

        <DetailItem
          label="Created"
          value={formatDate(lease.createdAtUtc)}
        />
      </DetailSection>

      {/* Financial Information */}
      <DetailSection
        icon={<PaymentsOutlinedIcon />}
        title="Financial Information"
      >
        <DetailItem
          label="Rent Amount"
          value={lease.rentAmount.toLocaleString()}
          icon={<PaymentsOutlinedIcon />}
        />

        <DetailItem
          label="Security Deposit"
          value={lease.securityDepositAmount.toLocaleString()}
          icon={<AccountBalanceOutlinedIcon />}
        />

        <DetailItem
          label="Security Deposit Paid"
          value={lease.securityDepositPaid ? 'Yes' : 'No'}
        />
      </DetailSection>

      {/* Terms */}
      <DetailSection
        icon={<DescriptionOutlinedIcon />}
        title="Terms & Conditions"
        fullWidth
      >
        <Box
          sx={{
            gridColumn: '1 / -1',
            minWidth: 0,
          }}
        >
          <Typography
            sx={{
              color: lease.terms ? '#334155' : '#64748b',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.7,
            }}
          >
            {lease.terms ?? 'No terms provided.'}
          </Typography>
        </Box>
      </DetailSection>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        fullWidth
        maxWidth="sm"
        aria-labelledby="delete-lease-dialog-title"
        aria-describedby="delete-lease-dialog-description"
      >
        <DialogTitle
          id="delete-lease-dialog-title"
          sx={{ fontWeight: 700 }}
        >
          Delete Lease
        </DialogTitle>

        <DialogContent>
          <DialogContentText id="delete-lease-dialog-description">
            Are you sure you want to delete Lease #{lease.id}?
            This action cannot be undone.
          </DialogContentText>

          {deleteError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {deleteError}
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleDeleteCancel}
            disabled={deleting}
          >
            Cancel
          </Button>

          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleting}
            startIcon={!deleting ? <DeleteIcon /> : undefined}
          >
            {deleting ? (
              <CircularProgress size={22} color="inherit" />
            ) : (
              'Delete'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

interface DetailSectionProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  fullWidth?: boolean;
}

const DetailSection = ({
  icon,
  title,
  children,
  fullWidth = false,
}: DetailSectionProps) => {
  return (
    <Paper
      elevation={0}
      sx={{
        mb: 3,
        border: '1px solid #e2e8f0',
        borderRadius: 3,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: { xs: 2, sm: 3 },
          py: 2,
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#eff6ff',
            color: '#2563eb',
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>

        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: '#0f172a',
          }}
        >
          {title}
        </Typography>
      </Box>

      <Box
        sx={{
          p: { xs: 2, sm: 3 },
          display: 'grid',
          gridTemplateColumns: fullWidth
            ? '1fr'
            : {
              xs: '1fr',
              sm: '1fr 1fr',
            },
          gap: { xs: 2.5, sm: 3 },
        }}
      >
        {children}
      </Box>
    </Paper>
  );
};

interface DetailItemProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}

const DetailItem = ({
  label,
  value,
  icon,
}: DetailItemProps) => {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography
        variant="body2"
        sx={{
          mb: 0.75,
          color: '#64748b',
          fontWeight: 500,
        }}
      >
        {label}
      </Typography>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          minWidth: 0,
        }}
      >
        {icon && (
          <Box
            sx={{
              display: 'flex',
              color: '#64748b',
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        )}

        <Typography
          variant="body1"
          sx={{
            color: '#0f172a',
            fontWeight: 600,
            wordBreak: 'break-word',
          }}
        >
          {value}
        </Typography>
      </Box>
    </Box>
  );
};

export default LeaseDetailsPage;