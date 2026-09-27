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
import PersonIcon from '@mui/icons-material/Person';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import ContactEmergencyOutlinedIcon from '@mui/icons-material/ContactEmergencyOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';

import { tenantsApi } from '../api/tenants';
import { useAuth } from '../context/AuthContext';
import type { Tenant } from '../types';

const TenantDetailsPage = () => {
  const { tenantId } = useParams<{ tenantId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    const fetchTenant = async () => {
      if (!tenantId) {
        setError('Tenant ID is required.');
        setLoading(false);
        return;
      }

      const parsedTenantId = parseInt(tenantId, 10);

      if (Number.isNaN(parsedTenantId)) {
        setError('Invalid Tenant ID.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const data = await tenantsApi.getById(parsedTenantId);
        setTenant(data);
      } catch (err: any) {
        if (err.response?.status === 404) {
          setError(`Tenant with ID ${tenantId} was not found.`);
        } else if (err.response?.status === 401) {
          setError('Authentication required. Please log in again.');
        } else {
          setError(
            err.response?.data?.message ||
            err.message ||
            'Failed to load tenant details.'
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTenant();
  }, [tenantId]);

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
    if (!tenantId) return;

    const parsedTenantId = parseInt(tenantId, 10);

    if (Number.isNaN(parsedTenantId)) {
      setDeleteError('Invalid Tenant ID.');
      return;
    }

    try {
      setDeleting(true);
      setDeleteError('');

      await tenantsApi.delete(parsedTenantId);

      navigate('/tenants');
    } catch (err: any) {
      if (err.response?.status === 409) {
        setDeleteError(
          'This tenant cannot be deleted because they have related leases or maintenance requests.'
        );
      } else if (err.response?.status === 404) {
        setDeleteError('Tenant not found.');
      } else if (err.response?.status === 403) {
        setDeleteError(
          'You do not have permission to delete this tenant.'
        );
      } else if (err.response?.status === 401) {
        setDeleteError(
          'Authentication required. Please log in again.'
        );
      } else {
        setDeleteError(
          err.response?.data?.message ||
          err.message ||
          'Failed to delete tenant. Please try again.'
        );
      }
    } finally {
      setDeleting(false);
    }
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
          onClick={() => navigate('/tenants')}
          sx={{
            mb: 3,
            color: 'text.secondary',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: 'rgba(15, 23, 42, 0.04)',
            },
          }}
        >
          Back to Tenants
        </Button>

        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!tenant) {
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
          onClick={() => navigate('/tenants')}
          sx={{
            mb: 3,
            color: 'text.secondary',
            fontWeight: 600,
          }}
        >
          Back to Tenants
        </Button>

        <Alert severity="info">Tenant not found.</Alert>
      </Box>
    );
  }

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
        onClick={() => navigate('/tenants')}
        sx={{
          mb: 3,
          color: 'text.secondary',
          fontWeight: 600,
          '&:hover': {
            backgroundColor: 'rgba(15, 23, 42, 0.04)',
          },
        }}
      >
        Back to Tenants
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
            <PersonIcon sx={{ fontSize: 28 }} />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 700,
                color: '#0f172a',
                fontSize: { xs: '1.6rem', sm: '2rem' },
                wordBreak: 'break-word',
              }}
            >
              {tenant.firstName} {tenant.lastName}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                mt: 0.5,
                color: 'text.secondary',
              }}
            >
              Tenant ID: {tenant.id}
            </Typography>
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
                  navigate(`/tenants/${tenant.id}/edit`)
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
                Edit Tenant
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
              Delete Tenant
            </Button>
          )}
        </Box>
      </Box>

      {/* Personal Information */}
      <DetailSection
        icon={<PersonIcon />}
        title="Personal Information"
      >
        <DetailItem
          label="First Name"
          value={tenant.firstName}
        />

        <DetailItem
          label="Last Name"
          value={tenant.lastName}
        />

        <DetailItem
          label="Tenant ID"
          value={tenant.id}
        />

        <DetailItem
          label="Created"
          value={formatDate(tenant.createdAtUtc)}
          icon={<CalendarTodayOutlinedIcon />}
        />
      </DetailSection>

      {/* Contact Information */}
      <DetailSection
        icon={<EmailOutlinedIcon />}
        title="Contact Information"
      >
        <DetailItem
          label="Email"
          value={tenant.email}
          icon={<EmailOutlinedIcon />}
        />

        <DetailItem
          label="Phone Number"
          value={tenant.phoneNumber}
          icon={<PhoneOutlinedIcon />}
        />

        <DetailItem
          label="Emergency Contact"
          value={tenant.emergencyContactName ?? '—'}
          icon={<ContactEmergencyOutlinedIcon />}
        />

        <DetailItem
          label="Emergency Contact Phone"
          value={tenant.emergencyContactPhone ?? '—'}
          icon={<PhoneOutlinedIcon />}
        />
      </DetailSection>

      {/* Account Information */}
      <DetailSection
        icon={<LinkOutlinedIcon />}
        title="Account Information"
      >
        <DetailItem
          label="Linked User"
          value={tenant.userEmail ?? 'Not linked'}
          icon={<LinkOutlinedIcon />}
        />

        <DetailItem
          label="Tenant ID"
          value={tenant.id}
        />
      </DetailSection>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        fullWidth
        maxWidth="sm"
        aria-labelledby="delete-tenant-dialog-title"
        aria-describedby="delete-tenant-dialog-description"
      >
        <DialogTitle
          id="delete-tenant-dialog-title"
          sx={{ fontWeight: 700 }}
        >
          Delete Tenant
        </DialogTitle>

        <DialogContent>
          <DialogContentText
            id="delete-tenant-dialog-description"
          >
            Are you sure you want to delete{' '}
            <strong>
              {tenant.firstName} {tenant.lastName}
            </strong>
            ? This action cannot be undone.
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
            startIcon={
              !deleting ? <DeleteIcon /> : undefined
            }
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
}

const DetailSection = ({
  icon,
  title,
  children,
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
          gridTemplateColumns: {
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

export default TenantDetailsPage;