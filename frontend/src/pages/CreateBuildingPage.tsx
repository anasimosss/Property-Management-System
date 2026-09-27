import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BusinessIcon from '@mui/icons-material/Business';
import ApartmentIcon from '@mui/icons-material/Apartment';
import { buildingsApi } from '../api/buildings';
import { useAuth } from '../context/AuthContext';

const CreateBuildingPage = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [floors, setFloors] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const canCreate =
    user?.role === 'Admin' || user?.role === 'PropertyManager';

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!propertyId) {
      setError('Property ID is required.');
      return;
    }

    const parsedPropertyId = parseInt(propertyId, 10);

    if (Number.isNaN(parsedPropertyId)) {
      setError('Invalid Property ID.');
      return;
    }

    if (!name.trim()) {
      setError('Building name is required.');
      return;
    }

    if (name.trim().length > 100) {
      setError('Building name cannot exceed 100 characters.');
      return;
    }

    let parsedFloors: number | null = null;

    if (floors.trim() !== '') {
      parsedFloors = parseInt(floors, 10);

      if (Number.isNaN(parsedFloors) || parsedFloors < 0) {
        setError(
          'Floors must be a valid number greater than or equal to 0.'
        );
        return;
      }
    }

    try {
      setSaving(true);

      await buildingsApi.create({
        propertyId: parsedPropertyId,
        name: name.trim(),
        floors: parsedFloors,
      });

      navigate(`/properties/${parsedPropertyId}/buildings`);
    } catch (err: any) {
      if (err.response?.status === 400) {
        setError(
          err.response?.data?.message ||
          'Please check the building information and try again.'
        );
      } else if (err.response?.status === 401) {
        setError('Authentication required. Please log in again.');
      } else if (err.response?.status === 403) {
        setError(
          'You do not have permission to create a building.'
        );
      } else if (err.response?.status === 404) {
        setError('The selected property was not found.');
      } else {
        setError(
          err.response?.data?.message ||
          err.message ||
          'Failed to create building.'
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const goBack = () => {
    navigate(`/properties/${propertyId}/buildings`);
  };

  if (!canCreate) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ mt: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={goBack}
            sx={{
              mb: 3,
              textTransform: 'none',
              fontWeight: 500,
            }}
          >
            Back to Buildings
          </Button>

          <Alert severity="error">
            Access Denied. Only Admins and Property Managers can
            create buildings.
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 5 }}>
        {/* Back */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={goBack}
          sx={{
            mb: 3,
            textTransform: 'none',
            fontWeight: 500,
          }}
        >
          Back to Buildings
        </Button>

        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              mb: 0.75,
            }}
          >
            Create Building
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
          >
            Add a new building to Property #{propertyId}.
          </Typography>
        </Box>

        {/* Content */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'minmax(0, 2fr) minmax(280px, 1fr)',
            },
            gap: 3,
            alignItems: 'start',
          }}
        >
          {/* Form */}
          <Paper
            variant="outlined"
            sx={{
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <Box sx={{ p: { xs: 2.5, md: 3 } }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  mb: 1,
                }}
              >
                <BusinessIcon color="primary" />

                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700 }}
                >
                  Building Information
                </Typography>
              </Box>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Enter the information for the new building.
              </Typography>
            </Box>

            <Divider />

            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ p: { xs: 2.5, md: 3 } }}
            >
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <TextField
                fullWidth
                required
                label="Building Name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                slotProps={{
                  htmlInput: {
                    maxLength: 100,
                  },
                }}
                helperText={`${name.length}/100 characters`}
                disabled={saving}
                sx={{ mb: 3 }}
              />

              <TextField
                fullWidth
                label="Floors"
                type="number"
                value={floors}
                onChange={(event) => setFloors(event.target.value)}
                slotProps={{
                  htmlInput: {
                    min: 0,
                  },
                }}
                helperText="Optional. Enter 0 or greater."
                disabled={saving}
                sx={{ mb: 3 }}
              />

              <Box
                sx={{
                  display: 'flex',
                  gap: 1.5,
                  flexWrap: 'wrap',
                  pt: 1,
                }}
              >
                <Button
                  type="submit"
                  variant="contained"
                  disabled={saving}
                  sx={{
                    minWidth: 145,
                    textTransform: 'none',
                    borderRadius: 2,
                  }}
                >
                  {saving ? (
                    <CircularProgress
                      size={24}
                      color="inherit"
                    />
                  ) : (
                    'Create Building'
                  )}
                </Button>

                <Button
                  variant="outlined"
                  onClick={goBack}
                  disabled={saving}
                  sx={{
                    minWidth: 100,
                    textTransform: 'none',
                    borderRadius: 2,
                  }}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          </Paper>

          {/* Property Summary */}
          <Paper
            variant="outlined"
            sx={{
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <Box sx={{ p: { xs: 2.5, md: 3 } }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  mb: 1,
                }}
              >
                <ApartmentIcon color="primary" />

                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700 }}
                >
                  Property
                </Typography>
              </Box>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                The building will be created under this property.
              </Typography>
            </Box>

            <Divider />

            <Box sx={{ p: 2.5 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 0.5 }}
              >
                Property ID
              </Typography>

              <Typography
                variant="h6"
                sx={{ fontWeight: 700 }}
              >
                #{propertyId}
              </Typography>
            </Box>

            <Divider />

            <Box sx={{ p: 2.5 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 0.5 }}
              >
                Building Name
              </Typography>

              <Typography
                sx={{
                  fontWeight: 600,
                  wordBreak: 'break-word',
                }}
              >
                {name || 'Not entered yet'}
              </Typography>
            </Box>

            <Divider />

            <Box sx={{ p: 2.5 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 0.5 }}
              >
                Number of Floors
              </Typography>

              <Typography sx={{ fontWeight: 600 }}>
                {floors || 'Not specified'}
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default CreateBuildingPage;