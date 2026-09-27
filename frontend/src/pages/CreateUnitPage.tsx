import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { unitsApi } from '../api/units';
import { useAuth } from '../context/AuthContext';

const CreateUnitPage = () => {
  const { propertyId, buildingId } = useParams<{
    propertyId: string;
    buildingId: string;
  }>();

  const navigate = useNavigate();
  const { user } = useAuth();

  const [unitNumber, setUnitNumber] = useState('');
  const [floor, setFloor] = useState('');
  const [bedrooms, setBedrooms] = useState('0');
  const [bathrooms, setBathrooms] = useState('0');
  const [squareFeet, setSquareFeet] = useState('');
  const [targetRent, setTargetRent] = useState('');
  const [status, setStatus] = useState('Vacant');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const canCreate =
    user?.role === 'Admin' || user?.role === 'PropertyManager';

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!buildingId) {
      setError('Building ID is required.');
      return;
    }

    const parsedBuildingId = parseInt(buildingId, 10);

    if (Number.isNaN(parsedBuildingId)) {
      setError('Invalid Building ID.');
      return;
    }

    if (!unitNumber.trim()) {
      setError('Unit number is required.');
      return;
    }

    if (unitNumber.trim().length > 50) {
      setError('Unit number cannot exceed 50 characters.');
      return;
    }

    const parsedFloor =
      floor.trim() === '' ? null : Number(floor);

    const parsedBedrooms = Number(bedrooms);
    const parsedBathrooms = Number(bathrooms);
    const parsedSquareFeet =
      squareFeet.trim() === '' ? null : Number(squareFeet);
    const parsedTargetRent = Number(targetRent);

    if (
      parsedFloor !== null &&
      (!Number.isInteger(parsedFloor) || parsedFloor < 0)
    ) {
      setError('Floor must be a whole number greater than or equal to 0.');
      return;
    }

    if (
      !Number.isInteger(parsedBedrooms) ||
      parsedBedrooms < 0
    ) {
      setError('Bedrooms must be a whole number greater than or equal to 0.');
      return;
    }

    if (
      Number.isNaN(parsedBathrooms) ||
      parsedBathrooms < 0
    ) {
      setError('Bathrooms must be 0 or greater.');
      return;
    }

    if (
      parsedSquareFeet !== null &&
      (Number.isNaN(parsedSquareFeet) || parsedSquareFeet < 0)
    ) {
      setError('Square feet must be 0 or greater.');
      return;
    }

    if (Number.isNaN(parsedTargetRent) || parsedTargetRent < 0) {
      setError('Target rent must be 0 or greater.');
      return;
    }

    try {
      setSaving(true);

      await unitsApi.create({
        buildingId: parsedBuildingId,
        unitNumber: unitNumber.trim(),
        floor: parsedFloor,
        bedrooms: parsedBedrooms,
        bathrooms: parsedBathrooms,
        squareFeet: parsedSquareFeet,
        targetRent: parsedTargetRent,
        status,
      });

      navigate(
        `/properties/${propertyId}/buildings/${parsedBuildingId}/units`
      );
    } catch (err: any) {
      if (err.response?.status === 400) {
        setError(
          err.response?.data?.message ||
          'Please check the unit information and try again.'
        );
      } else if (err.response?.status === 401) {
        setError('Authentication required. Please log in again.');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to create a unit.');
      } else if (err.response?.status === 404) {
        setError('The selected building was not found.');
      } else {
        setError(
          err.response?.data?.message ||
          err.message ||
          'Failed to create unit.'
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
            onClick={() =>
              navigate(
                `/properties/${propertyId}/buildings/${buildingId}/units`
              )
            }
            sx={{ mb: 3 }}
          >
            Back to Units
          </Button>

          <Alert severity="error">
            Access Denied. Only Admins and Property Managers can create
            units.
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
          onClick={() =>
            navigate(
              `/properties/${propertyId}/buildings/${buildingId}/units`
            )
          }
          sx={{ mb: 3 }}
        >
          Back to Units
        </Button>

        <Paper elevation={2} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Create Unit
          </Typography>

          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Add a new unit to Building #{buildingId}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              required
              label="Unit Number"
              value={unitNumber}
              onChange={(event) => setUnitNumber(event.target.value)}
              slotProps={{
                htmlInput: {
                  maxLength: 50,
                },
              }}
              helperText={`${unitNumber.length}/50 characters`}
              disabled={saving}
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="Floor"
              type="number"
              value={floor}
              onChange={(event) => setFloor(event.target.value)}
              slotProps={{
                htmlInput: {
                  min: 0,
                  step: 1,
                },
              }}
              helperText="Optional"
              disabled={saving}
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              required
              label="Bedrooms"
              type="number"
              value={bedrooms}
              onChange={(event) => setBedrooms(event.target.value)}
              slotProps={{
                htmlInput: {
                  min: 0,
                  step: 1,
                },
              }}
              disabled={saving}
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              required
              label="Bathrooms"
              type="number"
              value={bathrooms}
              onChange={(event) => setBathrooms(event.target.value)}
              slotProps={{
                htmlInput: {
                  min: 0,
                  step: 0.1,
                },
              }}
              disabled={saving}
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="Square Feet"
              type="number"
              value={squareFeet}
              onChange={(event) => setSquareFeet(event.target.value)}
              slotProps={{
                htmlInput: {
                  min: 0,
                  step: 0.01,
                },
              }}
              helperText="Optional"
              disabled={saving}
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              required
              label="Target Rent"
              type="number"
              value={targetRent}
              onChange={(event) => setTargetRent(event.target.value)}
              slotProps={{
                htmlInput: {
                  min: 0,
                  step: 0.01,
                },
              }}
              disabled={saving}
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              select
              label="Status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              disabled={saving}
              sx={{ mb: 3 }}
            >
              <MenuItem value="Vacant">Vacant</MenuItem>
              <MenuItem value="Occupied">Occupied</MenuItem>
              <MenuItem value="UnderMaintenance">
                Under Maintenance
              </MenuItem>
              <MenuItem value="Reserved">Reserved</MenuItem>
            </TextField>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={saving}
              >
                {saving ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Create Unit'
                )}
              </Button>

              <Button
                variant="outlined"
                onClick={() =>
                  navigate(
                    `/properties/${propertyId}/buildings/${buildingId}/units`
                  )
                }
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

export default CreateUnitPage;