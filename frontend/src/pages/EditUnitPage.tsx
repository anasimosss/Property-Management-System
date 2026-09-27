import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined';
import { unitsApi } from '../api/units';
import { useAuth } from '../context/AuthContext';

const EditUnitPage = () => {
  const { propertyId, buildingId, unitId } = useParams<{
    propertyId: string;
    buildingId: string;
    unitId: string;
  }>();

  const navigate = useNavigate();
  const { user } = useAuth();

  const [unitNumber, setUnitNumber] = useState('');
  const [floor, setFloor] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [squareFeet, setSquareFeet] = useState('');
  const [targetRent, setTargetRent] = useState('');
  const [status, setStatus] = useState('Vacant');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const canEdit =
    user?.role === 'Admin' || user?.role === 'PropertyManager';

  useEffect(() => {
    const fetchUnit = async () => {
      if (!unitId) {
        setError('Unit ID is required.');
        setLoading(false);
        return;
      }

      const parsedUnitId = parseInt(unitId, 10);

      if (Number.isNaN(parsedUnitId)) {
        setError('Invalid Unit ID.');
        setLoading(false);
        return;
      }

      try {
        const data = await unitsApi.getById(parsedUnitId);

        setUnitNumber(data.unitNumber);
        setFloor(data.floor == null ? '' : String(data.floor));
        setBedrooms(String(data.bedrooms));
        setBathrooms(String(data.bathrooms));
        setSquareFeet(
          data.squareFeet == null ? '' : String(data.squareFeet)
        );
        setTargetRent(String(data.targetRent));
        setStatus(data.status);
      } catch (err: any) {
        if (err.response?.status === 404) {
          setError(`Unit with ID ${unitId} was not found.`);
        } else if (err.response?.status === 401) {
          setError('Authentication required. Please log in again.');
        } else {
          setError(
            err.response?.data?.message ||
            err.message ||
            'Failed to load unit.'
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUnit();
  }, [unitId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!unitId) {
      setError('Unit ID is required.');
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
      setError(
        'Floor must be a whole number greater than or equal to 0.'
      );
      return;
    }

    if (
      !Number.isInteger(parsedBedrooms) ||
      parsedBedrooms < 0
    ) {
      setError(
        'Bedrooms must be a whole number greater than or equal to 0.'
      );
      return;
    }

    if (Number.isNaN(parsedBathrooms) || parsedBathrooms < 0) {
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

    if (
      Number.isNaN(parsedTargetRent) ||
      parsedTargetRent < 0
    ) {
      setError('Target rent must be 0 or greater.');
      return;
    }

    try {
      setSaving(true);

      await unitsApi.update(parseInt(unitId, 10), {
        unitNumber: unitNumber.trim(),
        floor: parsedFloor,
        bedrooms: parsedBedrooms,
        bathrooms: parsedBathrooms,
        squareFeet: parsedSquareFeet,
        targetRent: parsedTargetRent,
        status,
      });

      navigate(
        `/properties/${propertyId}/buildings/${buildingId}/units/${unitId}`
      );
    } catch (err: any) {
      if (err.response?.status === 400) {
        setError(
          err.response?.data?.message ||
          'Please check the unit information.'
        );
      } else if (err.response?.status === 401) {
        setError('Authentication required. Please log in again.');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to edit this unit.');
      } else if (err.response?.status === 404) {
        setError('Unit not found.');
      } else {
        setError(
          err.response?.data?.message ||
          err.message ||
          'Failed to update unit.'
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const backToUnit = () => {
    navigate(
      `/properties/${propertyId}/buildings/${buildingId}/units/${unitId}`
    );
  };

  if (!canEdit) {
    return (
      <Box
        sx={{
          width: '100%',
          minWidth: 0,
          p: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={backToUnit}
          sx={{
            mb: 3,
            color: 'text.secondary',
            px: 0,
            '&:hover': {
              bgcolor: 'transparent',
              color: 'text.primary',
            },
          }}
        >
          Back to Unit
        </Button>

        <Alert severity="error">
          Access Denied. Only Admins and Property Managers can edit
          units.
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
        onClick={backToUnit}
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
        Back to Unit
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
            <HomeWorkOutlinedIcon />
          </Box>

          <Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.5rem', sm: '1.75rem' },
                lineHeight: 1.2,
              }}
            >
              Edit Unit
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              Update the unit details, features, pricing, and status.
            </Typography>
          </Box>
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

      <Paper
        elevation={0}
        sx={{
          border: '1px solid #e2e8f0',
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        {/* Card Header */}
        <Box
          sx={{
            px: { xs: 2, sm: 3 },
            py: 2,
            bgcolor: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 600 }}
          >
            Unit Information
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.35 }}
          >
            Update the information below and save your changes.
          </Typography>
        </Box>

        {/* Form */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            p: { xs: 2, sm: 3 },
          }}
        >
          {/* Basic Information */}
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              mb: 2,
              color: 'text.primary',
            }}
          >
            Basic Information
          </Typography>

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
            <TextField
              fullWidth
              required
              label="Unit Number"
              value={unitNumber}
              onChange={(event) =>
                setUnitNumber(event.target.value)
              }
              slotProps={{
                htmlInput: {
                  maxLength: 50,
                },
              }}
              disabled={saving}
            />

            <TextField
              fullWidth
              label="Floor"
              type="number"
              value={floor}
              onChange={(event) =>
                setFloor(event.target.value)
              }
              slotProps={{
                htmlInput: {
                  min: 0,
                  step: 1,
                },
              }}
              helperText="Optional"
              disabled={saving}
            />

            <TextField
              fullWidth
              required
              label="Bedrooms"
              type="number"
              value={bedrooms}
              onChange={(event) =>
                setBedrooms(event.target.value)
              }
              slotProps={{
                htmlInput: {
                  min: 0,
                  step: 1,
                },
              }}
              disabled={saving}
            />

            <TextField
              fullWidth
              required
              label="Bathrooms"
              type="number"
              value={bathrooms}
              onChange={(event) =>
                setBathrooms(event.target.value)
              }
              slotProps={{
                htmlInput: {
                  min: 0,
                  step: 0.1,
                },
              }}
              disabled={saving}
            />
          </Box>

          {/* Unit Features */}
          <Box
            sx={{
              mt: 3,
              pt: 3,
              borderTop: '1px solid #e2e8f0',
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                mb: 2,
              }}
            >
              Unit Features
            </Typography>

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
              <TextField
                fullWidth
                label="Square Feet"
                type="number"
                value={squareFeet}
                onChange={(event) =>
                  setSquareFeet(event.target.value)
                }
                slotProps={{
                  htmlInput: {
                    min: 0,
                    step: 0.01,
                  },
                }}
                helperText="Optional"
                disabled={saving}
              />

              <TextField
                fullWidth
                required
                label="Target Rent"
                type="number"
                value={targetRent}
                onChange={(event) =>
                  setTargetRent(event.target.value)
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
                select
                label="Status"
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value)
                }
                disabled={saving}
              >
                <MenuItem value="Vacant">Vacant</MenuItem>
                <MenuItem value="Occupied">Occupied</MenuItem>
                <MenuItem value="UnderMaintenance">
                  Under Maintenance
                </MenuItem>
                <MenuItem value="Reserved">Reserved</MenuItem>
              </TextField>
            </Box>
          </Box>

          {/* Actions */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 1.5,
              flexWrap: 'wrap',
              mt: 3,
              pt: 2.5,
              borderTop: '1px solid #e2e8f0',
            }}
          >
            <Button
              variant="outlined"
              onClick={backToUnit}
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
      </Paper>
    </Box>
  );
};

export default EditUnitPage;