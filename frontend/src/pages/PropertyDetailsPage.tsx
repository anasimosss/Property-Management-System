import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from '@mui/material';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ApartmentIcon from '@mui/icons-material/Apartment';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

import { propertiesApi } from '../api/properties';
import { useAuth } from '../context/AuthContext';
import type { Property } from '../types';

const PropertyDetailsPage = () => {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string>('');

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) {
        setError('Property ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const data = await propertiesApi.getById(parseInt(id, 10));
        setProperty(data);
      } catch (err) {
        if (err instanceof Error && err.message.includes('404')) {
          setError(`Property with ID ${id} was not found.`);
        } else {
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to load property details'
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getPropertyTypeColor = (type: string) => {
    switch (type) {
      case 'Residential':
        return 'primary';
      case 'Commercial':
        return 'secondary';
      case 'Mixed':
        return 'info';
      default:
        return 'default';
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    setDeleteError('');
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeleteError('');
  };

  const handleDeleteConfirm = async () => {
    if (!id) return;

    setDeleting(true);
    setDeleteError('');

    try {
      await propertiesApi.delete(parseInt(id, 10));

      setDeleteDialogOpen(false);
      navigate('/properties');
    } catch (err: any) {
      setDeleting(false);

      if (err.response?.status === 409) {
        setDeleteError(
          'This property cannot be deleted because it has related records. Remove or resolve the related records first.'
        );
      } else if (err.response?.status === 404) {
        setDeleteError('Property not found.');
      } else if (err.response?.status === 403) {
        setDeleteError(
          'You do not have permission to delete this property.'
        );
      } else if (err.response?.status === 401) {
        setDeleteError(
          'Authentication required. Please log in again.'
        );
      } else {
        setDeleteError(
          err.response?.data?.message ||
          err.message ||
          'Failed to delete property. Please try again.'
        );
      }
    }
  };

  const canEdit =
    user?.role === 'Admin' || user?.role === 'PropertyManager';

  const canDelete = user?.role === 'Admin';

  if (loading) {
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
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 320,
            }}
          >
            <CircularProgress />
          </Box>
        </Container>
      </Box>
    );
  }

  if (error) {
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
            {error}
          </Alert>
        </Container>
      </Box>
    );
  }

  if (!property) {
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
            severity="info"
            sx={{
              borderRadius: 2,
            }}
          >
            Property not found.
          </Alert>
        </Container>
      </Box>
    );
  }

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
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            gap: 2,
            mb: 3,
            flexDirection: { xs: 'column', md: 'row' },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              minWidth: 0,
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

            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 700,
                  color: '#1e293b',
                  wordBreak: 'break-word',
                }}
              >
                {property.name}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: '#64748b',
                  mt: 0.5,
                }}
              >
                View property information and manage property details.
              </Typography>
            </Box>
          </Box>

          {/* Actions */}
          <Box
            sx={{
              display: 'flex',
              gap: 1.5,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Chip
              label={property.propertyType}
              color={getPropertyTypeColor(
                property.propertyType
              ) as any}
              sx={{
                fontWeight: 600,
              }}
            />

            {canEdit && (
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() =>
                  navigate(`/properties/${property.id}/edit`)
                }
                sx={{
                  px: 2,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Edit Property
              </Button>
            )}

            {canDelete && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDeleteClick}
                sx={{
                  px: 2,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Delete Property
              </Button>
            )}
          </Box>
        </Box>

        {/* Main Information Card */}
        <Box
          sx={{
            width: '100%',
            maxWidth: 1100,
            border: '1px solid #e2e8f0',
            borderRadius: 3,
            overflow: 'hidden',
            bgcolor: 'background.paper',
          }}
        >
          {/* Card Header */}
          <Box
            sx={{
              px: { xs: 2, sm: 3, md: 4 },
              py: 2.5,
              bgcolor: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <ApartmentIcon
              sx={{
                color: '#3b82f6',
              }}
            />

            <Box>
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
                Details and location information for this property.
              </Typography>
            </Box>
          </Box>

          {/* Information Content */}
          <Box
            sx={{
              p: { xs: 2, sm: 3, md: 4 },
            }}
          >
            {/* Basic Information */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  color: '#1e293b',
                  mb: 2,
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
                <InfoItem
                  label="Property ID"
                  value={property.id}
                />

                <InfoItem
                  label="Property Type"
                  value={property.propertyType}
                />

                <InfoItem
                  label="Created"
                  value={formatDate(property.createdAtUtc)}
                  icon={<CalendarTodayIcon />}
                />
              </Box>
            </Box>

            {/* Location */}
            <Box
              sx={{
                pt: 3,
                borderTop: '1px solid #e2e8f0',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 2,
                }}
              >
                <LocationOnIcon
                  sx={{
                    color: '#3b82f6',
                  }}
                />

                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 700,
                    color: '#1e293b',
                  }}
                >
                  Location
                </Typography>
              </Box>

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
                <InfoItem
                  label="Country"
                  value={property.country}
                />

                <InfoItem
                  label="City"
                  value={property.city}
                />

                {property.regionOrSubCity && (
                  <InfoItem
                    label="Region / Sub-city"
                    value={property.regionOrSubCity}
                  />
                )}

                {property.postalCode && (
                  <InfoItem
                    label="Postal Code"
                    value={property.postalCode}
                  />
                )}

                <InfoItem
                  label="Address Line 1"
                  value={property.addressLine1}
                  fullWidth
                />

                {property.addressLine2 && (
                  <InfoItem
                    label="Address Line 2"
                    value={property.addressLine2}
                    fullWidth
                  />
                )}
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Delete Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
          maxWidth="sm"
          fullWidth
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description"
        >
          <DialogTitle
            id="delete-dialog-title"
            sx={{
              fontWeight: 700,
              color: '#1e293b',
            }}
          >
            Delete Property
          </DialogTitle>

          <DialogContent>
            <DialogContentText
              id="delete-dialog-description"
              sx={{
                color: '#64748b',
              }}
            >
              Are you sure you want to delete{' '}
              <strong>{property.name}</strong>? This action cannot be
              undone.
            </DialogContentText>

            {deleteError && (
              <Alert
                severity="error"
                sx={{
                  mt: 2,
                  borderRadius: 2,
                }}
              >
                {deleteError}
              </Alert>
            )}
          </DialogContent>

          <DialogActions
            sx={{
              px: 3,
              pb: 3,
              gap: 1,
            }}
          >
            <Button
              onClick={handleDeleteCancel}
              disabled={deleting}
              sx={{
                px: 2.5,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Cancel
            </Button>

            <Button
              onClick={handleDeleteConfirm}
              color="error"
              variant="contained"
              disabled={deleting}
              autoFocus
              sx={{
                px: 2.5,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: 'none',
                },
              }}
            >
              {deleting ? (
                <CircularProgress size={22} color="inherit" />
              ) : (
                'Delete'
              )}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

type InfoItemProps = {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  fullWidth?: boolean;
};

const InfoItem = ({
  label,
  value,
  icon,
  fullWidth = false,
}: InfoItemProps) => {
  return (
    <Box
      sx={{
        gridColumn: fullWidth
          ? {
            xs: 'auto',
            md: '1 / -1',
          }
          : undefined,
        p: 2,
        border: '1px solid #e2e8f0',
        borderRadius: 2,
        bgcolor: '#ffffff',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          mb: 0.75,
        }}
      >
        {icon && (
          <Box
            sx={{
              display: 'flex',
              color: '#64748b',
            }}
          >
            {icon}
          </Box>
        )}

        <Typography
          variant="caption"
          sx={{
            color: '#64748b',
            fontWeight: 600,
          }}
        >
          {label}
        </Typography>
      </Box>

      <Typography
        variant="body1"
        sx={{
          color: '#1e293b',
          fontWeight: 500,
          wordBreak: 'break-word',
        }}
      >
        {value || '—'}
      </Typography>
    </Box>
  );
};

export default PropertyDetailsPage;