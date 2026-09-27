import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography,
} from '@mui/material';

import HomeWorkIcon from '@mui/icons-material/HomeWork';
import ApartmentIcon from '@mui/icons-material/Apartment';
import BedIcon from '@mui/icons-material/Bed';
import BathtubIcon from '@mui/icons-material/Bathtub';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

import { unitsApi, type AvailableUnit } from '../api/units';
import { unitRequestsApi } from '../api/unitRequests';

const AvailableUnitsPage = () => {
  const [units, setUnits] = useState<AvailableUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedUnit, setSelectedUnit] =
    useState<AvailableUnit | null>(null);

  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  const loadUnits = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await unitsApi.getAvailable();

      setUnits(data);
    } catch (err: any) {
      console.error('Failed to load available units:', err);

      setError(
        err?.response?.data?.message ||
          'Failed to load available units. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUnits();
  }, []);

  const openRequestDialog = (unit: AvailableUnit) => {
    setSelectedUnit(unit);
    setMessage('');
    setError('');
    setSuccess('');
  };

  const closeRequestDialog = () => {
    if (submitting) {
      return;
    }

    setSelectedUnit(null);
    setMessage('');
  };

  const handleRequest = async () => {
    if (!selectedUnit) {
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      await unitRequestsApi.create({
        unitId: selectedUnit.id,
        message: message.trim() || null,
      });

      setSuccess(
        `Your request for Unit ${selectedUnit.unitNumber} has been submitted successfully.`
      );

      setUnits((currentUnits) =>
        currentUnits.filter(
          (unit) => unit.id !== selectedUnit.id
        )
      );

      setSelectedUnit(null);
      setMessage('');
    } catch (err: any) {
      console.error('Failed to submit unit request:', err);

      setError(
        err?.response?.data?.message ||
          'Failed to submit your unit request. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container
      maxWidth="xl"
      sx={{
        py: { xs: 2, md: 4 },
      }}
    >
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 700,
            mb: 1,
          }}
        >
          Available Units
        </Typography>

        <Typography color="text.secondary">
          Browse available units and submit a request for the
          home you are interested in.
        </Typography>
      </Box>

      {success && (
        <Alert
          severity="success"
          sx={{ mb: 3 }}
          onClose={() => setSuccess('')}
        >
          {success}
        </Alert>
      )}

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      {loading && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            py: 10,
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {!loading && !error && units.length === 0 && (
        <Card
          sx={{
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <CardContent
            sx={{
              py: 8,
              textAlign: 'center',
            }}
          >
            <HomeWorkIcon
              sx={{
                fontSize: 56,
                color: 'text.secondary',
                mb: 2,
              }}
            />

            <Typography
              variant="h6"
              sx={{ fontWeight: 600, mb: 1 }}
            >
              No units are currently available
            </Typography>

            <Typography color="text.secondary">
              Please check again later for newly available units.
            </Typography>
          </CardContent>
        </Card>
      )}

      {!loading && units.length > 0 && (
        <Grid container spacing={3}>
          {units.map((unit) => (
            <Grid
              key={unit.id}
              size={{
                xs: 12,
                sm: 6,
                lg: 4,
              }}
            >
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: '0.2s',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent sx={{ p: 3, flexGrow: 1 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      mb: 2,
                      gap: 2,
                    }}
                  >
                    <Box>
                      <Typography
                        variant="h5"
                        sx={{ fontWeight: 700 }}
                      >
                        Unit {unit.unitNumber}
                      </Typography>

                      <Typography
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        {unit.propertyName}
                      </Typography>
                    </Box>

                    <Chip
                      label="Available"
                      color="success"
                      size="small"
                    />
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <ApartmentIcon fontSize="small" />

                    <Typography variant="body2">
                      {unit.buildingName}
                    </Typography>
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2.5 }}
                  >
                    {unit.floor !== null
                      ? `Floor ${unit.floor}`
                      : 'Floor not specified'}
                  </Typography>

                  <Box
                    sx={{
                      display: 'flex',
                      gap: 2,
                      flexWrap: 'wrap',
                      mb: 3,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                      }}
                    >
                      <BedIcon fontSize="small" />
                      <Typography variant="body2">
                        {unit.bedrooms} bedrooms
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                      }}
                    >
                      <BathtubIcon fontSize="small" />
                      <Typography variant="body2">
                        {unit.bathrooms} bathrooms
                      </Typography>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      mb: 3,
                    }}
                  >
                    <AttachMoneyIcon fontSize="small" />

                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700 }}
                    >
                      ETB {unit.targetRent.toLocaleString()}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      / month
                    </Typography>
                  </Box>

                  {unit.squareFeet !== null && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 3 }}
                    >
                      {unit.squareFeet.toLocaleString()} sq ft
                    </Typography>
                  )}

                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={() => openRequestDialog(unit)}
                    startIcon={<HomeWorkIcon />}
                  >
                    Request This Unit
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog
        open={selectedUnit !== null}
        onClose={closeRequestDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Request Unit {selectedUnit?.unitNumber}
        </DialogTitle>

        <DialogContent>
          {selectedUnit && (
            <Box sx={{ pt: 1 }}>
              <Typography
                variant="body1"
                sx={{ fontWeight: 600, mb: 1 }}
              >
                {selectedUnit.propertyName}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 3 }}
              >
                {selectedUnit.buildingName} • ETB{' '}
                {selectedUnit.targetRent.toLocaleString()} / month
              </Typography>

              <TextField
  fullWidth
  multiline
  minRows={4}
  label="Message (optional)"
  placeholder="Tell the property manager anything you would like them to know..."
  value={message}
  onChange={(event) =>
    setMessage(event.target.value)
  }
  slotProps={{
    htmlInput: {
      maxLength: 500,
    },
  }}
  helperText={`${message.length}/500`}
/>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={closeRequestDialog}
            disabled={submitting}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleRequest}
            disabled={submitting || !selectedUnit}
          >
            {submitting
              ? 'Submitting...'
              : 'Submit Request'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AvailableUnitsPage;