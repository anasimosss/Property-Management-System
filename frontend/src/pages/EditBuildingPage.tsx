import { useEffect, useState } from 'react';
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
import { buildingsApi } from '../api/buildings';
import { useAuth } from '../context/AuthContext';

const EditBuildingPage = () => {
  const { propertyId, buildingId } = useParams<{
    propertyId: string;
    buildingId: string;
  }>();

  const navigate = useNavigate();
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [floors, setFloors] = useState('');
  const [propertyName, setPropertyName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const canEdit =
    user?.role === 'Admin' || user?.role === 'PropertyManager';

  useEffect(() => {
    const fetchBuilding = async () => {
      if (!buildingId) {
        setError('Building ID is required.');
        setLoading(false);
        return;
      }

      const id = parseInt(buildingId, 10);

      if (Number.isNaN(id)) {
        setError('Invalid Building ID.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const data = await buildingsApi.getById(id);

        setName(data.name);
        setFloors(data.floors == null ? '' : String(data.floors));
        setPropertyName(data.propertyName);
      } catch (err: any) {
        if (err.response?.status === 404) {
          setError(`Building with ID ${buildingId} was not found.`);
        } else if (err.response?.status === 401) {
          setError('Authentication required. Please log in again.');
        } else {
          setError(
            err.response?.data?.message ||
            err.message ||
            'Failed to load building.'
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBuilding();
  }, [buildingId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!buildingId) {
      setError('Building ID is required.');
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

      await buildingsApi.update(parseInt(buildingId, 10), {
        name: name.trim(),
        floors: parsedFloors,
      });

      navigate(
        `/properties/${propertyId}/buildings/${buildingId}`
      );
    } catch (err: any) {
      if (err.response?.status === 400) {
        setError(
          err.response?.data?.message ||
          'Please check the building information.'
        );
      } else if (err.response?.status === 401) {
        setError('Authentication required. Please log in again.');
      } else if (err.response?.status === 403) {
        setError(
          'You do not have permission to edit this building.'
        );
      } else if (err.response?.status === 404) {
        setError('Building not found.');
      } else {
        setError(
          err.response?.data?.message ||
          err.message ||
          'Failed to update building.'
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const goBack = () => {
    navigate(
      `/properties/${propertyId}/buildings/${buildingId}`
    );
  };

  if (!canEdit) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ mt: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={goBack}
            sx={{
              mb: 3,
              textTransform: 'none',
            }}
          >
            Back to Building
          </Button>

          <Alert severity="error">
            Access Denied. Only Admins and Property Managers can edit
            buildings.
          </Alert>
        </Box>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box
          sx={{
            minHeight: '60vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress />
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
          Back to Building
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
            Edit Building
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
          >
            Update the information for this building.
          </Typography>
        </Box>

        {/* Main Content */}
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
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 0.5,
                }}
              >
                Building Information
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Update the building name and number of floors.
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
                    minWidth: 130,
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
                    'Save Changes'
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

          {/* Building Summary */}
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
                  Building Summary
                </Typography>
              </Box>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Current building details.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Box sx={{ p: 2.5 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 0.5 }}
                >
                  Building ID
                </Typography>

                <Typography sx={{ fontWeight: 600 }}>
                  #{buildingId}
                </Typography>
              </Box>

              <Divider />

              <Box sx={{ p: 2.5 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 0.5 }}
                >
                  Property
                </Typography>

                <Typography sx={{ fontWeight: 600 }}>
                  {propertyName || '—'}
                </Typography>
              </Box>

              <Divider />

              <Box sx={{ p: 2.5 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 0.5 }}
                >
                  Current Floors
                </Typography>

                <Typography sx={{ fontWeight: 600 }}>
                  {floors || '—'}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default EditBuildingPage;