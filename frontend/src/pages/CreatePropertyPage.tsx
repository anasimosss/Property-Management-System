import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ApartmentIcon from '@mui/icons-material/Apartment';
import { propertiesApi } from '../api/properties';
import { useAuth } from '../context/AuthContext';
import type { CreatePropertyRequest } from '../types';

const CreatePropertyPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<CreatePropertyRequest>({
    name: '',
    country: '',
    city: '',
    regionOrSubCity: '',
    addressLine1: '',
    addressLine2: '',
    postalCode: '',
    propertyType: 'Residential',
  });

  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const canCreate =
    user?.role === 'Admin' || user?.role === 'PropertyManager';

  if (!canCreate) {
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
        <Container maxWidth="xl">
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/properties')}
            sx={{
              mb: 2,
              color: '#64748b',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                bgcolor: '#f1f5f9',
              },
            }}
          >
            Back to Properties
          </Button>

          <Alert
            severity="error"
            sx={{
              borderRadius: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 0.5,
              }}
            >
              Access Denied
            </Typography>

            <Typography variant="body2">
              You do not have permission to create properties.
              This feature is only available to Admins and Property
              Managers.
            </Typography>
          </Alert>
        </Container>
      </Box>
    );
  }

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | { name?: string; value: unknown }
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name as string]: value,
    }));

    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      await propertiesApi.create(formData);

      setSuccess(true);

      setTimeout(() => {
        navigate('/properties');
      }, 1500);
    } catch (err: any) {
      console.error('Failed to create property:', err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        err?.message ||
        'Failed to create property. Please try again.';

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const isValid =
    formData.name.trim() &&
    formData.country.trim() &&
    formData.city.trim() &&
    formData.addressLine1.trim() &&
    formData.propertyType &&
    formData.name.length <= 200 &&
    formData.country.length <= 100 &&
    formData.city.length <= 100 &&
    formData.addressLine1.length <= 200 &&
    (!formData.regionOrSubCity ||
      formData.regionOrSubCity.length <= 100) &&
    (!formData.addressLine2 ||
      formData.addressLine2.length <= 200) &&
    (!formData.postalCode ||
      formData.postalCode.length <= 30);

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
        {/* Back Button */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/properties')}
          sx={{
            mb: 2,
            color: '#64748b',
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': {
              bgcolor: '#f1f5f9',
            },
          }}
        >
          Back to Properties
        </Button>

        {/* Page Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            mb: 3,
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
              bgcolor: 'rgba(59, 130, 246, 0.1)',
              color: '#3b82f6',
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
                color: '#1e293b',
              }}
            >
              Create Property
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: '#64748b',
                mt: 0.5,
              }}
            >
              Add a new property to the management system.
            </Typography>
          </Box>
        </Box>

        {/* Alerts */}
        {success && (
          <Alert
            severity="success"
            sx={{
              mb: 3,
              borderRadius: 2,
            }}
          >
            Property created successfully! Redirecting to
            properties list...
          </Alert>
        )}

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

        {/* Form Card */}
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: 1000,
            border: '1px solid #e2e8f0',
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          {/* Card Header */}
          <Box
            sx={{
              px: { xs: 2, sm: 3, md: 4 },
              py: 2.5,
              bgcolor: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: '#1e293b',
              }}
            >
              Property Information
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: '#64748b',
                mt: 0.5,
              }}
            >
              Enter the details below to create the property.
            </Typography>
          </Box>

          {/* Form */}
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              p: { xs: 2, sm: 3, md: 4 },
            }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  md: 'repeat(2, minmax(0, 1fr))',
                },
                gap: 2.5,
              }}
            >
              {/* Property Name */}
              <Box
                sx={{
                  gridColumn: {
                    xs: 'auto',
                    md: '1 / -1',
                  },
                }}
              >
                <TextField
                  fullWidth
                  label="Property Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  slotProps={{
                    htmlInput: {
                      maxLength: 200,
                    },
                  }}
                  helperText={`${formData.name.length}/200 characters`}
                  disabled={loading}
                />
              </Box>

              {/* Country */}
              <TextField
                fullWidth
                label="Country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
                slotProps={{
                  htmlInput: {
                    maxLength: 100,
                  },
                }}
                helperText={`${formData.country.length}/100 characters`}
                disabled={loading}
              />

              {/* City */}
              <TextField
                fullWidth
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                slotProps={{
                  htmlInput: {
                    maxLength: 100,
                  },
                }}
                helperText={`${formData.city.length}/100 characters`}
                disabled={loading}
              />

              {/* Region / Sub City */}
              <TextField
                fullWidth
                label="Region / Sub City"
                name="regionOrSubCity"
                value={formData.regionOrSubCity}
                onChange={handleChange}
                slotProps={{
                  htmlInput: {
                    maxLength: 100,
                  },
                }}
                helperText={`${formData.regionOrSubCity?.length || 0}/100 characters (optional)`}
                disabled={loading}
              />

              {/* Property Type */}
              <FormControl fullWidth required>
                <InputLabel>Property Type</InputLabel>

                <Select
                  name="propertyType"
                  value={formData.propertyType}
                  label="Property Type"
                  onChange={(e) => handleChange(e as any)}
                  disabled={loading}
                >
                  <MenuItem value="Residential">
                    Residential
                  </MenuItem>

                  <MenuItem value="Commercial">
                    Commercial
                  </MenuItem>

                  <MenuItem value="Mixed">
                    Mixed
                  </MenuItem>
                </Select>
              </FormControl>

              {/* Address Line 1 */}
              <Box
                sx={{
                  gridColumn: {
                    xs: 'auto',
                    md: '1 / -1',
                  },
                }}
              >
                <TextField
                  fullWidth
                  label="Address Line 1"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleChange}
                  required
                  slotProps={{
                    htmlInput: {
                      maxLength: 200,
                    },
                  }}
                  helperText={`${formData.addressLine1.length}/200 characters`}
                  disabled={loading}
                />
              </Box>

              {/* Address Line 2 */}
              <Box
                sx={{
                  gridColumn: {
                    xs: 'auto',
                    md: '1 / -1',
                  },
                }}
              >
                <TextField
                  fullWidth
                  label="Address Line 2"
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={handleChange}
                  slotProps={{
                    htmlInput: {
                      maxLength: 200,
                    },
                  }}
                  helperText={`${formData.addressLine2?.length || 0}/200 characters (optional)`}
                  disabled={loading}
                />
              </Box>

              {/* Postal Code */}
              <TextField
                fullWidth
                label="Postal Code"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                slotProps={{
                  htmlInput: {
                    maxLength: 30,
                  },
                }}
                helperText={`${formData.postalCode?.length || 0}/30 characters (optional)`}
                disabled={loading}
              />
            </Box>

            {/* Actions */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 1.5,
                mt: 4,
                pt: 3,
                borderTop: '1px solid #e2e8f0',
                flexWrap: 'wrap',
              }}
            >
              <Button
                variant="outlined"
                onClick={() => navigate('/properties')}
                disabled={loading}
                sx={{
                  px: 3,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="contained"
                disabled={!isValid || loading}
                sx={{
                  px: 3,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: 'none',
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={22} color="inherit" />
                ) : (
                  'Create Property'
                )}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default CreatePropertyPage;