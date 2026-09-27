import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import BuildIcon from '@mui/icons-material/Build';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import DescriptionIcon from '@mui/icons-material/Description';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import SaveIcon from '@mui/icons-material/Save';
import { maintenanceRequestsApi } from '../api/maintenanceRequests';
import { propertiesApi } from '../api/properties';
import { unitsApi } from '../api/units';
import { useAuth } from '../context/AuthContext';
import type { Property, Unit } from '../types';
import { buildingsApi } from '../api/buildings';

const CreateMaintenanceRequestPage = () => {
const navigate = useNavigate();
const { user } = useAuth();

const [properties, setProperties] = useState<Property[]>([]);
const [units, setUnits] = useState<Unit[]>([]);

const [propertyId, setPropertyId] = useState('');
const [unitId, setUnitId] = useState('');
const [title, setTitle] = useState('');
const [description, setDescription] = useState('');
const [priority, setPriority] = useState('Medium');
const [status, setStatus] = useState('Open');
const [resolutionNotes, setResolutionNotes] = useState('');

const [loadingProperties, setLoadingProperties] = useState(true);
const [loadingUnits, setLoadingUnits] = useState(false);
const [saving, setSaving] = useState(false);
const [error, setError] = useState('');

const canCreate =
user?.role === 'Admin' ||
user?.role === 'PropertyManager' ||
user?.role === 'MaintenanceStaff';

useEffect(() => {
const loadProperties = async () => {
try {
setLoadingProperties(true);
setError('');

    const data = await propertiesApi.getAll();
    setProperties(data);
  } catch (err: any) {
    if (err.response?.status === 401) {
      setError('Authentication required. Please log in again.');
    } else {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to load properties.'
      );
    }
  } finally {
    setLoadingProperties(false);
  }
};

loadProperties();

}, []);

useEffect(() => {
const loadUnits = async () => {
if (!propertyId) {
setUnits([]);
setUnitId('');
return;
}

  try {
    setLoadingUnits(true);
    setError('');
    setUnitId('');

    const buildingsData = await buildingsApi.getByProperty(
      Number(propertyId)
    );

    if (buildingsData.length === 0) {
      setUnits([]);
      return;
    }

    const unitLists = await Promise.all(
      buildingsData.map((building) =>
        unitsApi.getByBuilding(building.id)
      )
    );

    setUnits(unitLists.flat());
  } catch (err: any) {
    setError(
      err.response?.data?.message ||
        err.message ||
        'Failed to load units.'
    );
  } finally {
    setLoadingUnits(false);
  }
};

loadUnits();

}, [propertyId]);

const handleSubmit = async (event: React.FormEvent) => {
event.preventDefault();
setError('');

if (!propertyId) {
  setError('Please select a property.');
  return;
}

if (!title.trim()) {
  setError('Title is required.');
  return;
}

if (!description.trim()) {
  setError('Description is required.');
  return;
}

const parsedPropertyId = Number(propertyId);
const parsedUnitId = unitId ? Number(unitId) : null;

if (
  !Number.isInteger(parsedPropertyId) ||
  parsedPropertyId <= 0
) {
  setError('Invalid property.');
  return;
}

if (
  parsedUnitId !== null &&
  (!Number.isInteger(parsedUnitId) || parsedUnitId <= 0)
) {
  setError('Invalid unit.');
  return;
}

try {
  setSaving(true);

  await maintenanceRequestsApi.create({
    propertyId: parsedPropertyId,
    unitId: parsedUnitId,
    title: title.trim(),
    description: description.trim(),
    priority,
    status,
    resolutionNotes: resolutionNotes.trim() || null,
  });

  navigate('/maintenance-requests');
} catch (err: any) {
  if (err.response?.status === 400) {
    setError(
      err.response?.data?.message ||
        'Please check the maintenance request information.'
    );
  } else if (err.response?.status === 401) {
    setError('Authentication required. Please log in again.');
  } else if (err.response?.status === 403) {
    setError(
      'You do not have permission to create a maintenance request.'
    );
  } else if (err.response?.status === 404) {
    setError(
      err.response?.data?.message ||
        'The selected property or unit was not found.'
    );
  } else {
    setError(
      err.response?.data?.message ||
        err.message ||
        'Failed to create maintenance request.'
    );
  }
} finally {
  setSaving(false);
}

};

if (!canCreate) {
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

      <Alert severity="error">
        Access Denied. Only Admins, Property Managers, and
        Maintenance Staff can create maintenance requests.
      </Alert>
    </Box>
  </Container>
);

}

if (loadingProperties) {
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
      <Box
        sx={{
          p: { xs: 2.5, md: 3.5 },
          borderBottom: '1px solid #e2e8f0',
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
              width: 48,
              height: 48,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: '#eff6ff',
              color: '#3b82f6',
            }}
          >
            <BuildIcon />
          </Box>

          <Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 700,
                color: '#1e293b',
                fontSize: {
                  xs: '1.6rem',
                  sm: '2rem',
                },
              }}
            >
              Create Maintenance Request
            </Typography>

            <Typography
              variant="body2"
              sx={{ color: '#64748b', mt: 0.5 }}
            >
              Report a property or unit maintenance issue.
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ p: { xs: 2.5, md: 3.5 } }}
      >
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: '1fr 1fr',
            },
            gap: 2.5,
            mb: 3,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              border: '1px solid #e2e8f0',
              borderRadius: 2.5,
              bgcolor: '#f8fafc',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 1.5,
              }}
            >
              <HomeWorkIcon
                sx={{ color: '#3b82f6', fontSize: 20 }}
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

            <TextField
              fullWidth
              required
              select
              label="Property"
              value={propertyId}
              onChange={(event) =>
                setPropertyId(event.target.value)
              }
              disabled={saving}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#fff',
                  borderRadius: 2,
                },
              }}
            >
              {properties.map((property) => (
                <MenuItem key={property.id} value={property.id}>
                  {property.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              select
              label="Unit"
              value={unitId}
              onChange={(event) =>
                setUnitId(event.target.value)
              }
              disabled={
                saving || !propertyId || loadingUnits
              }
              helperText={
                loadingUnits
                  ? 'Loading units...'
                  : propertyId
                  ? 'Optional. Leave empty for a property-wide request.'
                  : 'Select a property first.'
              }
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#fff',
                  borderRadius: 2,
                },
              }}
            >
              <MenuItem value="">Property-wide</MenuItem>

              {units.map((unit) => (
                <MenuItem key={unit.id} value={unit.id}>
                  {unit.unitNumber}
                </MenuItem>
              ))}
            </TextField>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              border: '1px solid #e2e8f0',
              borderRadius: 2.5,
              bgcolor: '#f8fafc',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 1.5,
              }}
            >
              <PriorityHighIcon
                sx={{ color: '#f97316', fontSize: 20 }}
              />

              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  color: '#1e293b',
                }}
              >
                Request Status
              </Typography>
            </Box>

            <TextField
              fullWidth
              select
              label="Priority"
              value={priority}
              onChange={(event) =>
                setPriority(event.target.value)
              }
              disabled={saving}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#fff',
                  borderRadius: 2,
                },
              }}
            >
              <MenuItem value="Low">Low</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="High">High</MenuItem>
              <MenuItem value="Emergency">Emergency</MenuItem>
            </TextField>

            <TextField
              fullWidth
              select
              label="Status"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value)
              }
              disabled={saving}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#fff',
                  borderRadius: 2,
                },
              }}
            >
              <MenuItem value="Open">Open</MenuItem>
              <MenuItem value="Assigned">Assigned</MenuItem>
              <MenuItem value="InProgress">
                In Progress
              </MenuItem>
              <MenuItem value="OnHold">On Hold</MenuItem>
              <MenuItem value="Resolved">Resolved</MenuItem>
              <MenuItem value="Cancelled">Cancelled</MenuItem>
            </TextField>
          </Paper>
        </Box>

        <Paper
          elevation={0}
          sx={{
            border: '1px solid #e2e8f0',
            borderRadius: 2.5,
            overflow: 'hidden',
            mb: 3,
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
              sx={{ color: '#3b82f6', fontSize: 21 }}
            />

            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: '#1e293b',
              }}
            >
              Issue Details
            </Typography>
          </Box>

          <Box sx={{ p: 2.5 }}>
            <TextField
              fullWidth
              required
              label="Title"
              placeholder="e.g. Water leakage in bathroom"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              disabled={saving}
              sx={{
                mb: 2.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />

            <TextField
              fullWidth
              required
              label="Description"
              placeholder="Describe the maintenance issue in detail..."
              multiline
              minRows={5}
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              disabled={saving}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
          </Box>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            border: '1px solid #e2e8f0',
            borderRadius: 2.5,
            overflow: 'hidden',
            mb: 3,
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
            <TextField
              fullWidth
              label="Resolution Notes"
              placeholder="Add notes about how the issue was resolved..."
              multiline
              minRows={3}
              value={resolutionNotes}
              onChange={(event) =>
                setResolutionNotes(event.target.value)
              }
              helperText="Optional. Usually filled when the issue is resolved."
              disabled={saving}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
          </Box>
        </Paper>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 1.5,
            flexWrap: 'wrap',
          }}
        >
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() =>
              navigate('/maintenance-requests')
            }
            disabled={saving}
            sx={{
              borderColor: '#cbd5e1',
              color: '#475569',
              borderRadius: 2,
              px: 2.5,
              py: 1.1,
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                borderColor: '#94a3b8',
                bgcolor: '#f8fafc',
              },
            }}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="contained"
            startIcon={
              saving ? (
                <CircularProgress
                  size={20}
                  color="inherit"
                />
              ) : (
                <SaveIcon />
              )
            }
            disabled={saving}
            sx={{
              bgcolor: '#3b82f6',
              borderRadius: 2,
              px: 2.5,
              py: 1.1,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: 'none',
              '&:hover': {
                bgcolor: '#2563eb',
                boxShadow: 'none',
              },
            }}
          >
            {saving ? 'Creating...' : 'Create Request'}
          </Button>
        </Box>
      </Box>
    </Paper>
  </Box>
</Container>

);
};

export default CreateMaintenanceRequestPage;
