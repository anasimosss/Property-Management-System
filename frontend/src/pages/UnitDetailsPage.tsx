import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined';
import MeetingRoomOutlinedIcon from '@mui/icons-material/MeetingRoomOutlined';
import BedOutlinedIcon from '@mui/icons-material/BedOutlined';
import BathtubOutlinedIcon from '@mui/icons-material/BathtubOutlined';
import StraightenOutlinedIcon from '@mui/icons-material/StraightenOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { unitsApi } from '../api/units';
import type { Unit } from '../types';
import { useAuth } from '../context/AuthContext';

const UnitDetailsPage = () => {
  const { propertyId, buildingId, unitId } = useParams<{
    propertyId: string;
    buildingId: string;
    unitId: string;
  }>();

  const navigate = useNavigate();
  const { user } = useAuth();

  const [unit, setUnit] = useState<Unit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

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
        setLoading(true);
        setError('');

        const data = await unitsApi.getById(parsedUnitId);
        setUnit(data);
      } catch (err: any) {
        if (err.response?.status === 404) {
          setError('Unit with ID ' + unitId + ' was not found.');
        } else if (err.response?.status === 401) {
          setError('Authentication required. Please log in again.');
        } else {
          setError(
            err.response?.data?.message ||
            err.message ||
            'Failed to load unit details.'
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUnit();
  }, [unitId]);

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
    if (!unitId) return;

    try {
      setDeleting(true);
      setDeleteError('');

      await unitsApi.delete(parseInt(unitId, 10));

      navigate(
        `/properties/${propertyId}/buildings/${buildingId}/units`
      );
    } catch (err: any) {
      if (err.response?.status === 409) {
        setDeleteError(
          'This unit cannot be deleted because it has related leases, expenses, or maintenance requests.'
        );
      } else if (err.response?.status === 404) {
        setDeleteError('Unit not found.');
      } else if (err.response?.status === 403) {
        setDeleteError(
          'You do not have permission to delete this unit.'
        );
      } else if (err.response?.status === 401) {
        setDeleteError(
          'Authentication required. Please log in again.'
        );
      } else {
        setDeleteError(
          err.response?.data?.message ||
          err.message ||
          'Failed to delete unit. Please try again.'
        );
      }
    } finally {
      setDeleting(false);
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Occupied':
        return {
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          color: '#059669',
        };

      case 'Maintenance':
        return {
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          color: '#d97706',
        };

      case 'Vacant':
        return {
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          color: '#2563eb',
        };

      default:
        return {
          backgroundColor: 'rgba(100, 116, 139, 0.1)',
          color: '#475569',
        };
    }
  };

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

  const backToUnits = () =>
    navigate(
      `/properties/${propertyId}/buildings/${buildingId}/units`
    );

  if (error) {
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
          onClick={backToUnits}
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
          Back to Units
        </Button>

        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!unit) {
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
          onClick={backToUnits}
          sx={{
            mb: 3,
            color: 'text.secondary',
            px: 0,
          }}
        >
          Back to Units
        </Button>

        <Alert severity="info">Unit not found.</Alert>
      </Box>
    );
  }

  const statusStyles = getStatusStyles(unit.status);

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
        onClick={backToUnits}
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
        Back to Units
      </Button>

      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: 2,
          flexWrap: 'wrap',
          mb: 3,
        }}
      >
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
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                flexWrap: 'wrap',
              }}
            >
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '1.5rem', sm: '1.75rem' },
                  lineHeight: 1.2,
                }}
              >
                Unit {unit.unitNumber}
              </Typography>

              <Box
                component="span"
                sx={{
                  px: 1.25,
                  py: 0.5,
                  borderRadius: 1.5,
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  ...statusStyles,
                }}
              >
                {unit.status}
              </Box>
            </Box>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              View and manage unit information.
            </Typography>
          </Box>
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
                startIcon={<EditOutlinedIcon />}
                onClick={() =>
                  navigate(
                    `/properties/${propertyId}/buildings/${buildingId}/units/${unit.id}/edit`
                  )
                }
              >
                Edit Unit
              </Button>
            )}

          {user?.role === 'Admin' && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteClick}
            >
              Delete Unit
            </Button>
          )}
        </Box>
      </Box>

      {/* Detail Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: 'repeat(2, minmax(0, 1fr))',
          },
          gap: 2.5,
        }}
      >
        {/* Unit Information */}
        <Paper
          elevation={0}
          sx={{
            border: '1px solid #e2e8f0',
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <SectionHeader
            icon={<HomeWorkOutlinedIcon />}
            title="Unit Information"
            subtitle="Basic unit details"
          />

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
            <DetailItem
              label="Unit ID"
              value={String(unit.id)}
            />

            <DetailItem
              label="Unit Number"
              value={unit.unitNumber}
              icon={<MeetingRoomOutlinedIcon />}
            />

            <DetailItem
              label="Building"
              value={unit.buildingName}
              icon={<HomeWorkOutlinedIcon />}
            />

            <DetailItem
              label="Floor"
              value={unit.floor != null ? String(unit.floor) : '—'}
            />

            <DetailItem
              label="Status"
              value={unit.status}
              valueSx={{
                display: 'inline-block',
                px: 1.25,
                py: 0.5,
                borderRadius: 1.5,
                fontSize: '0.85rem',
                fontWeight: 600,
                ...statusStyles,
              }}
            />
          </Box>
        </Paper>

        {/* Property Features */}
        <Paper
          elevation={0}
          sx={{
            border: '1px solid #e2e8f0',
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <SectionHeader
            icon={<DescriptionOutlinedIcon />}
            title="Unit Features"
            subtitle="Size and room information"
          />

          <Box
            sx={{
              p: { xs: 2, sm: 3 },
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
              },
              gap: 2.5,
            }}
          >
            <DetailItem
              label="Bedrooms"
              value={String(unit.bedrooms)}
              icon={<BedOutlinedIcon />}
            />

            <DetailItem
              label="Bathrooms"
              value={String(unit.bathrooms)}
              icon={<BathtubOutlinedIcon />}
            />

            <DetailItem
              label="Square Feet"
              value={
                unit.squareFeet != null
                  ? `${unit.squareFeet.toLocaleString()} sq ft`
                  : '—'
              }
              icon={<StraightenOutlinedIcon />}
            />
          </Box>
        </Paper>

        {/* Financial Information */}
        <Paper
          elevation={0}
          sx={{
            border: '1px solid #e2e8f0',
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <SectionHeader
            icon={<PaymentsOutlinedIcon />}
            title="Financial Information"
            subtitle="Rental pricing information"
          />

          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            <DetailItem
              label="Target Rent"
              value={unit.targetRent.toLocaleString()}
              icon={<PaymentsOutlinedIcon />}
              valueSx={{
                fontWeight: 700,
                fontSize: '1.1rem',
              }}
            />
          </Box>
        </Paper>

        {/* Record Information */}
        <Paper
          elevation={0}
          sx={{
            border: '1px solid #e2e8f0',
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <SectionHeader
            icon={<DescriptionOutlinedIcon />}
            title="Record Information"
            subtitle="System record details"
          />

          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            <DetailItem
              label="Created"
              value={formatDate(unit.createdAtUtc)}
            />
          </Box>
        </Paper>
      </Box>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        fullWidth
        maxWidth="sm"
        aria-labelledby="delete-unit-dialog-title"
        aria-describedby="delete-unit-dialog-description"
      >
        <DialogTitle id="delete-unit-dialog-title">
          Delete Unit
        </DialogTitle>

        <DialogContent>
          <DialogContentText id="delete-unit-dialog-description">
            Are you sure you want to delete{' '}
            <strong>Unit {unit.unitNumber}</strong>? This action
            cannot be undone.
          </DialogContentText>

          {deleteError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {deleteError}
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
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
            startIcon={
              deleting ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <DeleteIcon />
              )
            }
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}

const SectionHeader = ({
  icon,
  title,
  subtitle,
}: SectionHeaderProps) => {
  return (
    <Box
      sx={{
        px: { xs: 2, sm: 3 },
        py: 2,
        bgcolor: '#f8fafc',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}
    >
      <Box
        sx={{
          color: 'primary.main',
          display: 'flex',
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>

      <Box>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 600 }}
        >
          {title}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
        >
          {subtitle}
        </Typography>
      </Box>
    </Box>
  );
};

interface DetailItemProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
  valueSx?: object;
}

const DetailItem = ({
  label,
  value,
  icon,
  valueSx,
}: DetailItemProps) => {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          display: 'block',
          mb: 0.75,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        {label}
      </Typography>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          minWidth: 0,
        }}
      >
        {icon && (
          <Box
            sx={{
              color: 'text.secondary',
              display: 'flex',
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        )}

        <Typography
          variant="body1"
          sx={{
            fontWeight: 500,
            wordBreak: 'break-word',
            ...valueSx,
          }}
        >
          {value}
        </Typography>
      </Box>
    </Box>
  );
};

export default UnitDetailsPage;