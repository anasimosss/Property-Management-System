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
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import BusinessIcon from '@mui/icons-material/Business';
import ApartmentIcon from '@mui/icons-material/Apartment';
import LayersIcon from '@mui/icons-material/Layers';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

import { buildingsApi } from '../api/buildings';
import { useAuth } from '../context/AuthContext';
import type { Building } from '../types';

const BuildingDetailsPage = () => {
  const { propertyId, buildingId } = useParams<{
    propertyId: string;
    buildingId: string;
  }>();

  const navigate = useNavigate();
  const { user } = useAuth();

  const [building, setBuilding] = useState<Building | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    const fetchBuilding = async () => {
      if (!buildingId) {
        setError('Building ID is required.');
        setLoading(false);
        return;
      }

      const parsedBuildingId = parseInt(buildingId, 10);

      if (Number.isNaN(parsedBuildingId)) {
        setError('Invalid Building ID.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const data = await buildingsApi.getById(parsedBuildingId);
        setBuilding(data);
      } catch (err: any) {
        if (err.response?.status === 404) {
          setError(`Building with ID ${buildingId} was not found.`);
        } else if (err.response?.status === 401) {
          setError('Authentication required. Please log in again.');
        } else {
          setError(
            err.response?.data?.message ||
            err.message ||
            'Failed to load building details.'
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBuilding();
  }, [buildingId]);

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
    if (!buildingId) return;

    const parsedBuildingId = parseInt(buildingId, 10);

    if (Number.isNaN(parsedBuildingId)) {
      setDeleteError('Invalid Building ID.');
      return;
    }

    try {
      setDeleting(true);
      setDeleteError('');

      await buildingsApi.delete(parsedBuildingId);

      navigate(`/properties/${propertyId}/buildings`);
    } catch (err: any) {
      if (err.response?.status === 409) {
        setDeleteError(
          'This building cannot be deleted because it has related records. Remove or resolve the related records first.'
        );
      } else if (err.response?.status === 404) {
        setDeleteError('Building not found.');
      } else if (err.response?.status === 403) {
        setDeleteError(
          'You do not have permission to delete this building.'
        );
      } else if (err.response?.status === 401) {
        setDeleteError('Authentication required. Please log in again.');
      } else {
        setDeleteError(
          err.response?.data?.message ||
          err.message ||
          'Failed to delete building. Please try again.'
        );
      }
    } finally {
      setDeleting(false);
    }
  };

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

  if (error) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ mt: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() =>
              navigate(`/properties/${propertyId}/buildings`)
            }
            sx={{ mb: 3 }}
          >
            Back to Buildings
          </Button>

          <Alert severity="error">{error}</Alert>
        </Box>
      </Container>
    );
  }

  if (!building) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ mt: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() =>
              navigate(`/properties/${propertyId}/buildings`)
            }
            sx={{ mb: 3 }}
          >
            Back to Buildings
          </Button>

          <Alert severity="info">Building not found.</Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 5 }}>
        {/* Back button */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() =>
            navigate(`/properties/${building.propertyId}/buildings`)
          }
          sx={{
            mb: 3,
            textTransform: 'none',
            fontWeight: 500,
          }}
        >
          Back to Buildings
        </Button>

        {/* Page Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3,
            mb: 4,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 700,
                mb: 0.75,
              }}
            >
              {building.name}
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
            >
              {building.propertyName}
            </Typography>
          </Box>

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
                  onClick={() =>
                    navigate(
                      `/properties/${building.propertyId}/buildings/${building.id}/edit`
                    )
                  }
                  sx={{
                    textTransform: 'none',
                    borderRadius: 2,
                    px: 2.5,
                  }}
                >
                  Edit Building
                </Button>
              )}

            {user?.role === 'Admin' && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDeleteClick}
                sx={{
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 2.5,
                }}
              >
                Delete Building
              </Button>
            )}
          </Box>
        </Box>

        {/* Summary Cards */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: '1fr 1fr',
              lg: 'repeat(4, 1fr)',
            },
            gap: 2.5,
            mb: 4,
          }}
        >
          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              borderRadius: 2,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                mb: 1.5,
              }}
            >
              <BusinessIcon color="primary" />
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Building ID
              </Typography>
            </Box>

            <Typography
              variant="h6"
              sx={{ fontWeight: 700 }}
            >
              #{building.id}
            </Typography>
          </Paper>

          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              borderRadius: 2,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                mb: 1.5,
              }}
            >
              <ApartmentIcon color="primary" />
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Property
              </Typography>
            </Box>

            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {building.propertyName}
            </Typography>
          </Paper>

          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              borderRadius: 2,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                mb: 1.5,
              }}
            >
              <LayersIcon color="primary" />
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Floors
              </Typography>
            </Box>

            <Typography
              variant="h6"
              sx={{ fontWeight: 700 }}
            >
              {building.floors ?? '—'}
            </Typography>
          </Paper>

          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              borderRadius: 2,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                mb: 1.5,
              }}
            >
              <CalendarTodayIcon color="primary" />
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Created
              </Typography>
            </Box>

            <Typography
              variant="body1"
              sx={{ fontWeight: 700 }}
            >
              {formatDate(building.createdAtUtc)}
            </Typography>
          </Paper>
        </Box>

        {/* Building Information */}
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
              Detailed information about this building.
            </Typography>
          </Box>

          <Divider />

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: '1fr 1fr',
              },
              gap: 0,
            }}
          >
            <Box
              sx={{
                p: { xs: 2.5, md: 3 },
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 0.75 }}
              >
                Building ID
              </Typography>

              <Typography sx={{ fontWeight: 600 }}>
                {building.id}
              </Typography>
            </Box>

            <Box
              sx={{
                p: { xs: 2.5, md: 3 },
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 0.75 }}
              >
                Building Name
              </Typography>

              <Typography sx={{ fontWeight: 600 }}>
                {building.name}
              </Typography>
            </Box>

            <Box
              sx={{
                p: { xs: 2.5, md: 3 },
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 0.75 }}
              >
                Property
              </Typography>

              <Typography sx={{ fontWeight: 600 }}>
                {building.propertyName}
              </Typography>
            </Box>

            <Box
              sx={{
                p: { xs: 2.5, md: 3 },
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 0.75 }}
              >
                Floors
              </Typography>

              <Typography sx={{ fontWeight: 600 }}>
                {building.floors ?? '—'}
              </Typography>
            </Box>

            <Box
              sx={{
                p: { xs: 2.5, md: 3 },
                gridColumn: { sm: '1 / -1' },
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 0.75 }}
              >
                Created
              </Typography>

              <Typography sx={{ fontWeight: 600 }}>
                {formatDate(building.createdAtUtc)}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Delete Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
          aria-labelledby="delete-building-dialog-title"
          aria-describedby="delete-building-dialog-description"
        >
          <DialogTitle id="delete-building-dialog-title">
            Delete Building
          </DialogTitle>

          <DialogContent>
            <DialogContentText id="delete-building-dialog-description">
              Are you sure you want to delete{' '}
              <strong>{building.name}</strong>? This action cannot
              be undone.
            </DialogContentText>

            {deleteError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {deleteError}
              </Alert>
            )}
          </DialogContent>

          <DialogActions>
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
            >
              {deleting ? (
                <CircularProgress
                  size={24}
                  color="inherit"
                />
              ) : (
                'Delete'
              )}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default BuildingDetailsPage;