import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
Alert,
Box,
Button,
CircularProgress,
Container,
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
import EditIcon from '@mui/icons-material/Edit';
import BuildIcon from '@mui/icons-material/Build';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import DoorFrontIcon from '@mui/icons-material/DoorFront';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { maintenanceRequestsApi } from '../api/maintenanceRequests';
import { useAuth } from '../context/AuthContext';
import type { MaintenanceRequest } from '../types';

const MaintenanceRequestDetailsPage = () => {
const { requestId } = useParams<{ requestId: string }>();
const navigate = useNavigate();
const { user } = useAuth();

const [request, setRequest] =
useState<MaintenanceRequest | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
const [deleting, setDeleting] = useState(false);
const [deleteError, setDeleteError] = useState('');

useEffect(() => {
const fetchRequest = async () => {
if (!requestId) {
setError('Maintenance request ID is required.');
setLoading(false);
return;
}

  const parsedRequestId = parseInt(requestId, 10);

  if (Number.isNaN(parsedRequestId)) {
    setError('Invalid maintenance request ID.');
    setLoading(false);
    return;
  }

  try {
    setLoading(true);
    setError('');

    const data =
      await maintenanceRequestsApi.getById(parsedRequestId);

    setRequest(data);
  } catch (err: any) {
    if (err.response?.status === 404) {
      setError(
        'Maintenance request with ID ' +
          requestId +
          ' was not found.'
      );
    } else if (err.response?.status === 401) {
      setError('Authentication required. Please log in again.');
    } else {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to load maintenance request details.'
      );
    }
  } finally {
    setLoading(false);
  }
};

fetchRequest();

}, [requestId]);

const formatDateTime = (dateString: string) => {
return new Date(dateString).toLocaleString('en-US', {
year: 'numeric',
month: 'long',
day: 'numeric',
hour: 'numeric',
minute: '2-digit',
});
};

const getPriorityStyles = (priority: string) => {
switch (priority.toLowerCase()) {
case 'emergency':
return {
bgcolor: '#fef2f2',
color: '#dc2626',
border: '#fecaca',
};
case 'high':
return {
bgcolor: '#fff7ed',
color: '#ea580c',
border: '#fed7aa',
};
case 'low':
return {
bgcolor: '#f0fdf4',
color: '#16a34a',
border: '#bbf7d0',
};
default:
return {
bgcolor: '#eff6ff',
color: '#2563eb',
border: '#bfdbfe',
};
}
};

const getStatusStyles = (status: string) => {
switch (status.toLowerCase()) {
case 'resolved':
return {
bgcolor: '#f0fdf4',
color: '#16a34a',
border: '#bbf7d0',
};
case 'cancelled':
return {
bgcolor: '#fef2f2',
color: '#dc2626',
border: '#fecaca',
};
case 'inprogress':
return {
bgcolor: '#eff6ff',
color: '#2563eb',
border: '#bfdbfe',
};
case 'assigned':
return {
bgcolor: '#faf5ff',
color: '#9333ea',
border: '#e9d5ff',
};
case 'onhold':
return {
bgcolor: '#fffbeb',
color: '#d97706',
border: '#fde68a',
};
default:
return {
bgcolor: '#f8fafc',
color: '#475569',
border: '#cbd5e1',
};
}
};

const formatStatus = (status: string) => {
if (status === 'InProgress') return 'In Progress';
if (status === 'OnHold') return 'On Hold';
return status;
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
if (!requestId) return;

const parsedRequestId = parseInt(requestId, 10);

if (Number.isNaN(parsedRequestId)) {
  setDeleteError('Invalid maintenance request ID.');
  return;
}

try {
  setDeleting(true);
  setDeleteError('');

  await maintenanceRequestsApi.delete(parsedRequestId);

  navigate('/maintenance-requests');
} catch (err: any) {
  if (err.response?.status === 404) {
    setDeleteError('Maintenance request not found.');
  } else if (err.response?.status === 403) {
    setDeleteError(
      'You do not have permission to delete this maintenance request.'
    );
  } else if (err.response?.status === 401) {
    setDeleteError(
      'Authentication required. Please log in again.'
    );
  } else {
    setDeleteError(
      err.response?.data?.message ||
        err.message ||
        'Failed to delete maintenance request. Please try again.'
    );
  }
} finally {
  setDeleting(false);
}

};

if (loading) {
return ( <Container maxWidth="xl">
<Box
sx={{
minHeight: '60vh',
display: 'flex',
alignItems: 'center',
justifyContent: 'center',
}}
> <CircularProgress /> </Box> </Container>
);
}

if (error) {
return ( <Container maxWidth="xl">
<Box sx={{ py: 3 }}>
<Button
startIcon={<ArrowBackIcon />}
onClick={() => navigate('/maintenance-requests')}
sx={{
mb: 3,
color: '#475569',
textTransform: 'none',
fontWeight: 500,
'&:hover': {
bgcolor: '#f1f5f9',
},
}}
>
Back to Maintenance Requests </Button>

      <Alert severity="error">{error}</Alert>
    </Box>
  </Container>
);

}

if (!request) {
return ( <Container maxWidth="xl">
<Box sx={{ py: 3 }}>
<Button
startIcon={<ArrowBackIcon />}
onClick={() => navigate('/maintenance-requests')}
sx={{
mb: 3,
color: '#475569',
textTransform: 'none',
fontWeight: 500,
}}
>
Back to Maintenance Requests </Button>

      <Alert severity="info">
        Maintenance request not found.
      </Alert>
    </Box>
  </Container>
);

}

const priorityStyles = getPriorityStyles(request.priority);
const statusStyles = getStatusStyles(request.status);

const canEdit =
user?.role === 'Admin' ||
user?.role === 'PropertyManager' ||
user?.role === 'MaintenanceStaff';

const canDelete = user?.role === 'Admin';

return ( <Container maxWidth="xl">
<Box sx={{ py: 3 }}>
<Button
startIcon={<ArrowBackIcon />}
onClick={() => navigate('/maintenance-requests')}
sx={{
mb: 2.5,
color: '#475569',
textTransform: 'none',
fontWeight: 500,
'&:hover': {
bgcolor: '#f1f5f9',
},
}}
>
Back to Maintenance Requests </Button>

    <Paper
      elevation={0}
      sx={{
        border: '1px solid #e2e8f0',
        borderRadius: 3,
        overflow: 'hidden',
        bgcolor: '#fff',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: { xs: 2.5, md: 3.5 },
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            gap: 2,
            flexWrap: 'wrap',
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
                width: 52,
                height: 52,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#eff6ff',
                color: '#3b82f6',
                flexShrink: 0,
              }}
            >
              <BuildIcon sx={{ fontSize: 27 }} />
            </Box>

            <Box>
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 700,
                  color: '#1e293b',
                  fontSize: {
                    xs: '1.5rem',
                    sm: '2rem',
                  },
                }}
              >
                Maintenance Request #{request.id}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: '#64748b',
                  mt: 0.5,
                }}
              >
                View maintenance request details and status.
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
            {canEdit && (
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() =>
                  navigate(
                    '/maintenance-requests/' +
                      request.id +
                      '/edit'
                  )
                }
                sx={{
                  borderColor: '#cbd5e1',
                  color: '#475569',
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: '#94a3b8',
                    bgcolor: '#f8fafc',
                  },
                }}
              >
                Edit Request
              </Button>
            )}

            {canDelete && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDeleteClick}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Delete Request
              </Button>
            )}
          </Box>
        </Box>
      </Box>

      {/* Request summary */}
      <Box
        sx={{
          p: { xs: 2.5, md: 3.5 },
          bgcolor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: '1fr 1fr',
              lg: 'repeat(4, 1fr)',
            },
            gap: 2,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 2,
              border: '1px solid #e2e8f0',
              borderRadius: 2.5,
              bgcolor: '#fff',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: '#64748b',
                fontWeight: 600,
              }}
            >
              STATUS
            </Typography>

            <Box sx={{ mt: 1 }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  px: 1.5,
                  py: 0.7,
                  borderRadius: 2,
                  bgcolor: statusStyles.bgcolor,
                  color: statusStyles.color,
                  border: `1px solid ${statusStyles.border}`,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                }}
              >
                {formatStatus(request.status)}
              </Box>
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 2,
              border: '1px solid #e2e8f0',
              borderRadius: 2.5,
              bgcolor: '#fff',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: '#64748b',
                fontWeight: 600,
              }}
            >
              PRIORITY
            </Typography>

            <Box sx={{ mt: 1 }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  px: 1.5,
                  py: 0.7,
                  borderRadius: 2,
                  bgcolor: priorityStyles.bgcolor,
                  color: priorityStyles.color,
                  border: `1px solid ${priorityStyles.border}`,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                }}
              >
                {request.priority}
              </Box>
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 2,
              border: '1px solid #e2e8f0',
              borderRadius: 2.5,
              bgcolor: '#fff',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: '#64748b',
                fontWeight: 600,
              }}
            >
              LOCATION
            </Typography>

            <Typography
              sx={{
                mt: 1,
                fontWeight: 600,
                color: '#1e293b',
              }}
            >
              {request.propertyName}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: '#64748b',
                mt: 0.25,
              }}
            >
              {request.unitNumber ?? 'Property-wide'}
            </Typography>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 2,
              border: '1px solid #e2e8f0',
              borderRadius: 2.5,
              bgcolor: '#fff',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: '#64748b',
                fontWeight: 600,
              }}
            >
              REQUEST ID
            </Typography>

            <Typography
              sx={{
                mt: 1,
                fontWeight: 700,
                color: '#1e293b',
                fontSize: '1.15rem',
              }}
            >
              #{request.id}
            </Typography>
          </Paper>
        </Box>
      </Box>

      {/* Request information */}
      <Box sx={{ p: { xs: 2.5, md: 3.5 } }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 2.5,
          }}
        >
          <DescriptionIcon
            sx={{
              color: '#3b82f6',
              fontSize: 22,
            }}
          />

          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: '#1e293b',
            }}
          >
            Request Information
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: '1fr 1fr',
            },
            gap: 2,
            mb: 3,
          }}
        >
          <InfoCard
            icon={<HomeWorkIcon />}
            label="Property"
            value={request.propertyName}
          />

          <InfoCard
            icon={<DoorFrontIcon />}
            label="Unit"
            value={request.unitNumber ?? 'Property-wide'}
          />

          <InfoCard
            icon={<PersonIcon />}
            label="Reported By"
            value={
              request.reportedByTenantName ||
              request.reportedByUserName ||
              'Not specified'
            }
          />

          <InfoCard
            icon={<AssignmentIndIcon />}
            label="Assigned To"
            value={
              request.assignedToUserName || 'Not assigned'
            }
          />

          <InfoCard
            icon={<PriorityHighIcon />}
            label="Priority"
            value={request.priority}
          />

          <InfoCard
            icon={<CheckCircleIcon />}
            label="Status"
            value={formatStatus(request.status)}
          />
        </Box>

        {/* Title */}
        <Paper
          elevation={0}
          sx={{
            border: '1px solid #e2e8f0',
            borderRadius: 2.5,
            overflow: 'hidden',
            mb: 2.5,
          }}
        >
          <Box
            sx={{
              px: 2.5,
              py: 1.8,
              bgcolor: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: '#1e293b',
              }}
            >
              Issue
            </Typography>
          </Box>

          <Box sx={{ p: 2.5 }}>
            <Typography
              variant="h6"
              sx={{
                color: '#1e293b',
                fontWeight: 600,
              }}
            >
              {request.title}
            </Typography>
          </Box>
        </Paper>

        {/* Description */}
        <Paper
          elevation={0}
          sx={{
            border: '1px solid #e2e8f0',
            borderRadius: 2.5,
            overflow: 'hidden',
            mb: 2.5,
          }}
        >
          <Box
            sx={{
              px: 2.5,
              py: 1.8,
              bgcolor: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <DescriptionIcon
              sx={{
                color: '#3b82f6',
                fontSize: 21,
              }}
            />

            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: '#1e293b',
              }}
            >
              Description
            </Typography>
          </Box>

          <Box sx={{ p: 2.5 }}>
            <Typography
              sx={{
                color: '#475569',
                lineHeight: 1.8,
                whiteSpace: 'pre-wrap',
              }}
            >
              {request.description}
            </Typography>
          </Box>
        </Paper>

        {/* Resolution notes */}
        <Paper
          elevation={0}
          sx={{
            border: '1px solid #e2e8f0',
            borderRadius: 2.5,
            overflow: 'hidden',
            mb: 2.5,
          }}
        >
          <Box
            sx={{
              px: 2.5,
              py: 1.8,
              bgcolor: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: '#1e293b',
              }}
            >
              Resolution Notes
            </Typography>
          </Box>

          <Box sx={{ p: 2.5 }}>
            <Typography
              sx={{
                color: request.resolutionNotes
                  ? '#475569'
                  : '#94a3b8',
                lineHeight: 1.8,
                whiteSpace: 'pre-wrap',
              }}
            >
              {request.resolutionNotes ||
                'No resolution notes provided.'}
            </Typography>
          </Box>
        </Paper>

        {/* Dates */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: '1fr 1fr',
            },
            gap: 2,
          }}
        >
          <InfoCard
            icon={<AccessTimeIcon />}
            label="Created"
            value={formatDateTime(request.createdAtUtc)}
          />

          <InfoCard
            icon={<CheckCircleIcon />}
            label="Resolved"
            value={
              request.resolvedAtUtc
                ? formatDateTime(request.resolvedAtUtc)
                : 'Not resolved'
            }
          />
        </Box>
      </Box>
    </Paper>

    {/* Delete confirmation dialog */}
    <Dialog
  open={deleteDialogOpen}
  onClose={handleDeleteCancel}
  aria-labelledby="delete-maintenance-dialog-title"
  aria-describedby="delete-maintenance-dialog-description"
>
      <DialogTitle
        id="delete-maintenance-dialog-title"
        sx={{
          fontWeight: 700,
          color: '#1e293b',
        }}
      >
        Delete Maintenance Request
      </DialogTitle>

      <DialogContent>
        <DialogContentText
          id="delete-maintenance-dialog-description"
          sx={{
            color: '#475569',
            lineHeight: 1.7,
          }}
        >
          Are you sure you want to delete Maintenance Request #
          {request.id}? This action cannot be undone.
        </DialogContentText>

        {deleteError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {deleteError}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2.5, pt: 1 }}>
        <Button
          onClick={handleDeleteCancel}
          disabled={deleting}
          sx={{
            color: '#475569',
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
          startIcon={
            deleting ? (
              <CircularProgress
                size={18}
                color="inherit"
              />
            ) : (
              <DeleteIcon />
            )
          }
          disabled={deleting}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          {deleting ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  </Box>
</Container>

);
};

interface InfoCardProps {
icon: React.ReactNode;
label: string;
value: string;
}

const InfoCard = ({ icon, label, value }: InfoCardProps) => {
return (
<Paper
elevation={0}
sx={{
p: 2.25,
border: '1px solid #e2e8f0',
borderRadius: 2.5,
bgcolor: '#fff',
}}
>
<Box
sx={{
display: 'flex',
alignItems: 'center',
gap: 1,
mb: 1,
}}
>
<Box
sx={{
color: '#3b82f6',
display: 'flex',
alignItems: 'center',
}}
>
{icon} </Box>

    <Typography
      variant="caption"
      sx={{
        color: '#64748b',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.03em',
      }}
    >
      {label}
    </Typography>
  </Box>

  <Typography
    sx={{
      color: '#1e293b',
      fontWeight: 600,
    }}
  >
    {value}
  </Typography>
</Paper>

);
};

export default MaintenanceRequestDetailsPage;
