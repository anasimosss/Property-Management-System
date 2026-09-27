import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { tenantsApi } from '../api/tenants';
import { useAuth } from '../context/AuthContext';

const CreateTenantPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [userId, setUserId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const canCreate =
    user?.role === 'Admin' || user?.role === 'PropertyManager';

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

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

      await tenantsApi.create({
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

      navigate('/tenants');
    } catch (err: any) {
      if (err.response?.status === 400) {
        setError(
          err.response?.data?.message ||
            'Please check the tenant information and try again.'
        );
      } else if (err.response?.status === 401) {
        setError('Authentication required. Please log in again.');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to create a tenant.');
      } else if (err.response?.status === 404) {
        setError(
          err.response?.data?.message ||
            'The specified user was not found.'
        );
      } else if (err.response?.status === 409) {
        setError(
          err.response?.data?.message ||
            'This user is already linked to a tenant.'
        );
      } else {
        setError(
          err.response?.data?.message ||
            err.message ||
            'Failed to create tenant.'
        );
      }
    } finally {
      setSaving(false);
    }
  };

  if (!canCreate) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/tenants')}
            sx={{ mb: 3 }}
          >
            Back to Tenants
          </Button>

          <Alert severity="error">
            Access Denied. Only Admins and Property Managers can create
            tenants.
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/tenants')}
          sx={{ mb: 3 }}
        >
          Back to Tenants
        </Button>

        <Paper elevation={2} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Create Tenant
          </Typography>

          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Add a new tenant to the property management system.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
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
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              required
              label="First Name"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              disabled={saving}
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              required
              label="Last Name"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              disabled={saving}
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              required
              label="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={saving}
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              required
              label="Phone Number"
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
              disabled={saving}
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="Emergency Contact Name"
              value={emergencyContactName}
              onChange={(event) =>
                setEmergencyContactName(event.target.value)
              }
              disabled={saving}
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="Emergency Contact Phone"
              value={emergencyContactPhone}
              onChange={(event) =>
                setEmergencyContactPhone(event.target.value)
              }
              disabled={saving}
              sx={{ mb: 3 }}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={saving}
              >
                {saving ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Create Tenant'
                )}
              </Button>

              <Button
                variant="outlined"
                onClick={() => navigate('/tenants')}
                disabled={saving}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default CreateTenantPage;