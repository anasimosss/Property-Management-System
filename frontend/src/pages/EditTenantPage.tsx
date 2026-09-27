import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import CloseIcon from '@mui/icons-material/Close';

import { tenantsApi } from '../api/tenants';
import { useAuth } from '../context/AuthContext';

const EditTenantPage = () => {
  const { tenantId } = useParams<{ tenantId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [userId, setUserId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const canEdit =
    user?.role === 'Admin' || user?.role === 'PropertyManager';

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
        const data = await tenantsApi.getById(parsedTenantId);

        setUserId(data.userId == null ? '' : String(data.userId));
        setFirstName(data.firstName);
        setLastName(data.lastName);
        setEmail(data.email);
        setPhoneNumber(data.phoneNumber);
        setEmergencyContactName(data.emergencyContactName ?? '');
        setEmergencyContactPhone(data.emergencyContactPhone ?? '');
      } catch (err: any) {
        if (err.response?.status === 404) {
          setError(`Tenant with ID ${tenantId} was not found.`);
        } else if (err.response?.status === 401) {
          setError('Authentication required. Please log in again.');
        } else {
          setError(
            err.response?.data?.message ||
            err.message ||
            'Failed to load tenant.'
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTenant();
  }, [tenantId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!tenantId) {
      setError('Tenant ID is required.');
      return;
    }

    if (!firstName.trim()) {
      setError('First name is required.');
      return;
    }

    if (!lastName.trim()) {
      setError('Last name is required.');
      return;
    }

    if (!email.trim()) {
      setError('Email is required.');
      return;
    }

    if (!phoneNumber.trim()) {
      setError('Phone number is required.');
      return;
    }

    let parsedUserId: number | null = null;

    if (userId.trim() !== '') {
      parsedUserId = Number(userId);

      if (
        !Number.isInteger(parsedUserId) ||
        parsedUserId <= 0
      ) {
        setError('User ID must be a positive whole number.');
        return;
      }
    }

    try {
      setSaving(true);

      await tenantsApi.update(parseInt(tenantId, 10), {
        userId: parsedUserId,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        emergencyContactName:
          emergencyContactName.trim() || null,
        emergencyContactPhone:
          emergencyContactPhone.trim() || null,
      });

      navigate(`/tenants/${tenantId}`);
    } catch (err: any) {
      if (err.response?.status === 400) {
        setError(
          err.response?.data?.message ||
          'Please check the tenant information.'
        );
      } else if (err.response?.status === 401) {
        setError('Authentication required. Please log in again.');
      } else if (err.response?.status === 403) {
        setError(
          'You do not have permission to edit this tenant.'
        );
      } else if (err.response?.status === 404) {
        setError(
          err.response?.data?.message ||
          'Tenant or user not found.'
        );
      } else if (err.response?.status === 409) {
        setError(
          err.response?.data?.message ||
          'This user is already linked to another tenant.'
        );
      } else {
        setError(
          err.response?.data?.message ||
          err.message ||
          'Failed to update tenant.'
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const backToTenant = () => {
    navigate(`/tenants/${tenantId}`);
  };

  if (!canEdit) {
    return (
      <Box
        sx={{
          width: '100%',
          minWidth: 0,
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 2, md: 3 },
        }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={backToTenant}
          sx={{
            mb: 3,
            color: 'text.secondary',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: 'rgba(15, 23, 42, 0.04)',
            },
          }}
        >
          Back to Tenant
        </Button>

        <Alert severity="error">
          Access Denied. Only Admins and Property Managers can edit
          tenants.
        </Alert>
      </Box>
    );
  }

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
        onClick={backToTenant}
        disabled={saving}
        sx={{
          mb: 3,
          color: 'text.secondary',
          fontWeight: 600,
          '&:hover': {
            backgroundColor: 'rgba(15, 23, 42, 0.04)',
          },
        }}
      >
        Back to Tenant
      </Button>

      {/* Page Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          mb: 3,
        }}
      >
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#eff6ff',
            color: '#2563eb',
            flexShrink: 0,
          }}
        >
          <PersonIcon />
        </Box>

        <Box>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              color: '#0f172a',
              fontSize: { xs: '1.6rem', sm: '2rem' },
            }}
          >
            Edit Tenant
          </Typography>

          <Typography
            variant="body2"
            sx={{
              mt: 0.5,
              color: 'text.secondary',
            }}
          >
            Update tenant information and contact details.
          </Typography>
        </Box>
      </Box>

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

      {/* Tenant Form */}
      <Paper
        elevation={0}
        sx={{
          border: '1px solid #e2e8f0',
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        {/* Basic Information Header */}
        <Box
          sx={{
            px: { xs: 2, sm: 3 },
            py: 2,
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: '#0f172a',
            }}
          >
            Basic Information
          </Typography>

          <Typography
            variant="body2"
            sx={{
              mt: 0.5,
              color: 'text.secondary',
            }}
          >
            Update the tenant's identity and account information.
          </Typography>
        </Box>

        {/* Basic Information Fields */}
        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: '1fr 1fr',
            },
            gap: 2.5,
          }}
        >
          <TextField
            fullWidth
            label="User ID"
            type="number"
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            slotProps={{
              htmlInput: {
                min: 1,
                step: 1,
              },
            }}
            helperText="Optional. Link this tenant to an existing user account."
            disabled={saving}
          />

          <Box />

          <TextField
            fullWidth
            required
            label="First Name"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            disabled={saving}
          />

          <TextField
            fullWidth
            required
            label="Last Name"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            disabled={saving}
          />

          <TextField
            fullWidth
            required
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={saving}
          />

          <TextField
            fullWidth
            required
            label="Phone Number"
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
            disabled={saving}
          />
        </Box>

        {/* Emergency Contact Header */}
        <Box
          sx={{
            px: { xs: 2, sm: 3 },
            py: 2,
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: '#0f172a',
            }}
          >
            Emergency Contact
          </Typography>

          <Typography
            variant="body2"
            sx={{
              mt: 0.5,
              color: 'text.secondary',
            }}
          >
            Optional emergency contact information for this tenant.
          </Typography>
        </Box>

        {/* Emergency Contact Fields */}
        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: '1fr 1fr',
            },
            gap: 2.5,
          }}
        >
          <TextField
            fullWidth
            label="Emergency Contact Name"
            value={emergencyContactName}
            onChange={(event) =>
              setEmergencyContactName(event.target.value)
            }
            disabled={saving}
          />

          <TextField
            fullWidth
            label="Emergency Contact Phone"
            value={emergencyContactPhone}
            onChange={(event) =>
              setEmergencyContactPhone(event.target.value)
            }
            disabled={saving}
          />
        </Box>

        {/* Actions */}
        <Box
          sx={{
            px: { xs: 2, sm: 3 },
            py: 2,
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 1.5,
            flexWrap: 'wrap',
          }}
        >
          <Button
            variant="outlined"
            startIcon={<CloseIcon />}
            onClick={backToTenant}
            disabled={saving}
            sx={{
              borderColor: '#cbd5e1',
              color: '#475569',
              fontWeight: 600,
              '&:hover': {
                borderColor: '#94a3b8',
                backgroundColor: '#f8fafc',
              },
            }}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="contained"
            startIcon={
              !saving ? <SaveOutlinedIcon /> : undefined
            }
            disabled={saving}
            onClick={handleSubmit}
            sx={{
              minWidth: 140,
              fontWeight: 600,
            }}
          >
            {saving ? (
              <CircularProgress size={22} color="inherit" />
            ) : (
              'Save Changes'
            )}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default EditTenantPage;