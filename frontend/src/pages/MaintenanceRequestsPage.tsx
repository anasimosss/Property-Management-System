import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BuildIcon from '@mui/icons-material/Build';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { maintenanceRequestsApi } from '../api/maintenanceRequests';
import { useAuth } from '../context/AuthContext';
import type { MaintenanceRequest } from '../types';

const MaintenanceRequestsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        setError('');

        const data = await maintenanceRequestsApi.getAll();
        setRequests(data);
      } catch (err: any) {
        if (err.response?.status === 401) {
          setError('Authentication required. Please log in again.');
        } else {
          setError(
            err.response?.data?.message ||
              err.message ||
              'Failed to load maintenance requests.'
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const canCreate =
    user?.role === 'Admin' ||
    user?.role === 'PropertyManager' ||
    user?.role === 'MaintenanceStaff';

  const filteredRequests = requests.filter((request) => {
    const searchTerm = search.toLowerCase().trim();

    if (!searchTerm) {
      return true;
    }

    return (
      request.title.toLowerCase().includes(searchTerm) ||
      request.propertyName.toLowerCase().includes(searchTerm) ||
      (request.unitNumber ?? '').toLowerCase().includes(searchTerm) ||
      request.priority.toLowerCase().includes(searchTerm) ||
      request.status.toLowerCase().includes(searchTerm) ||
      (
        request.reportedByTenantName ||
        request.reportedByUserName ||
        ''
      )
        .toLowerCase()
        .includes(searchTerm)
    );
  });

  const totalRequests = requests.length;

  const pendingRequests = requests.filter((request) => {
    const status = request.status.toLowerCase();
    return (
      status === 'pending' ||
      status === 'open' ||
      status === 'assigned' ||
      status === 'in progress' ||
      status === 'inprogress'
    );
  }).length;

  const completedRequests = requests.filter((request) => {
    const status = request.status.toLowerCase();
    return (
      status === 'completed' ||
      status === 'resolved' ||
      status === 'closed'
    );
  }).length;

  const getPriorityColor = (
    priority: string
  ): 'error' | 'warning' | 'info' | 'default' => {
    const value = priority.toLowerCase();

    if (value === 'urgent' || value === 'high') {
      return 'error';
    }

    if (value === 'medium') {
      return 'warning';
    }

    if (value === 'low') {
      return 'info';
    }

    return 'default';
  };

  const getStatusColor = (
    status: string
  ): 'success' | 'warning' | 'info' | 'error' | 'default' => {
    const value = status.toLowerCase();

    if (
      value === 'completed' ||
      value === 'resolved' ||
      value === 'closed'
    ) {
      return 'success';
    }

    if (
      value === 'pending' ||
      value === 'open'
    ) {
      return 'warning';
    }

    if (
      value === 'assigned' ||
      value === 'in progress' ||
      value === 'inprogress'
    ) {
      return 'info';
    }

    if (value === 'cancelled' || value === 'canceled') {
      return 'error';
    }

    return 'default';
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
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
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: {
              xs: 'flex-start',
              sm: 'center',
            },
            gap: 2,
            flexWrap: 'wrap',
            mb: 3,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{
                color: '#0f172a',
                fontWeight: 700,
                fontSize: {
                  xs: '1.7rem',
                  md: '2rem',
                },
                mb: 0.5,
              }}
            >
              Maintenance Requests
            </Typography>

            <Typography
              sx={{
                color: '#64748b',
                fontSize: '0.95rem',
              }}
            >
              Track and manage property maintenance issues.
            </Typography>
          </Box>

          {canCreate && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() =>
                navigate('/maintenance-requests/create')
              }
              sx={{
                px: 2.5,
                py: 1.2,
                borderRadius: 2,
                bgcolor: '#2563eb',
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: '#1d4ed8',
                  boxShadow: 'none',
                },
              }}
            >
              Create Request
            </Button>
          )}
        </Box>

        {/* Summary Cards */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(3, 1fr)',
            },
            gap: 2,
            mb: 3,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              border: '1px solid #e2e8f0',
              borderRadius: 3,
              bgcolor: '#fff',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Typography
                  sx={{
                    color: '#64748b',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    mb: 0.5,
                  }}
                >
                  Total Requests
                </Typography>

                <Typography
                  sx={{
                    color: '#0f172a',
                    fontSize: '1.75rem',
                    fontWeight: 700,
                  }}
                >
                  {totalRequests}
                </Typography>
              </Box>

              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: '#eff6ff',
                  color: '#2563eb',
                }}
              >
                <BuildIcon />
              </Box>
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              border: '1px solid #e2e8f0',
              borderRadius: 3,
              bgcolor: '#fff',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Typography
                  sx={{
                    color: '#64748b',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    mb: 0.5,
                  }}
                >
                  Open / Pending
                </Typography>

                <Typography
                  sx={{
                    color: '#0f172a',
                    fontSize: '1.75rem',
                    fontWeight: 700,
                  }}
                >
                  {pendingRequests}
                </Typography>
              </Box>

              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: '#fff7ed',
                  color: '#f97316',
                }}
              >
                <PendingActionsIcon />
              </Box>
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              border: '1px solid #e2e8f0',
              borderRadius: 3,
              bgcolor: '#fff',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Typography
                  sx={{
                    color: '#64748b',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    mb: 0.5,
                  }}
                >
                  Completed
                </Typography>

                <Typography
                  sx={{
                    color: '#0f172a',
                    fontSize: '1.75rem',
                    fontWeight: 700,
                  }}
                >
                  {completedRequests}
                </Typography>
              </Box>

              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: '#f0fdf4',
                  color: '#16a34a',
                }}
              >
                <CheckCircleIcon />
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Search */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            border: '1px solid #e2e8f0',
            borderRadius: 3,
            bgcolor: '#fff',
          }}
        >
          <TextField
            fullWidth
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search requests, properties, units, priority, status..."
            size="small"
            slotProps={{
  input: {
    startAdornment: (
      <InputAdornment position="start">
        <SearchIcon sx={{ color: '#94a3b8' }} />
      </InputAdornment>
    ),
  },
}}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: '#f8fafc',
              },
            }}
          />
        </Paper>

        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Empty State */}
        {!error && requests.length === 0 && (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: 'center',
              border: '1px solid #e2e8f0',
              borderRadius: 3,
              bgcolor: '#fff',
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                mx: 'auto',
                mb: 2,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#eff6ff',
                color: '#2563eb',
              }}
            >
              <BuildIcon sx={{ fontSize: 32 }} />
            </Box>

            <Typography
              sx={{
                color: '#1e293b',
                fontSize: '1.1rem',
                fontWeight: 700,
                mb: 0.5,
              }}
            >
              No Maintenance Requests Found
            </Typography>

            <Typography
              sx={{
                color: '#64748b',
                fontSize: '0.9rem',
              }}
            >
              There are no maintenance requests in the system yet.
            </Typography>
          </Paper>
        )}

        {/* No Search Results */}
        {!error &&
          requests.length > 0 &&
          filteredRequests.length === 0 && (
            <Paper
              elevation={0}
              sx={{
                p: 5,
                textAlign: 'center',
                border: '1px solid #e2e8f0',
                borderRadius: 3,
                bgcolor: '#fff',
              }}
            >
              <Typography
                sx={{
                  color: '#1e293b',
                  fontWeight: 700,
                  mb: 0.5,
                }}
              >
                No matching requests
              </Typography>

              <Typography
                sx={{
                  color: '#64748b',
                  fontSize: '0.9rem',
                }}
              >
                Try a different search term.
              </Typography>
            </Paper>
          )}

        {/* Table */}
        {!error &&
          filteredRequests.length > 0 && (
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
                  px: 2.5,
                  py: 2,
                  borderBottom: '1px solid #e2e8f0',
                }}
              >
                <Typography
                  sx={{
                    color: '#1e293b',
                    fontSize: '1rem',
                    fontWeight: 700,
                  }}
                >
                  Maintenance Requests
                </Typography>

                <Typography
                  sx={{
                    color: '#64748b',
                    fontSize: '0.8rem',
                    mt: 0.3,
                  }}
                >
                  {filteredRequests.length} request
                  {filteredRequests.length !== 1 ? 's' : ''} found
                </Typography>
              </Box>

              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table sx={{ minWidth: 900 }}>
                  <TableHead>
                    <TableRow
                      sx={{
                        bgcolor: '#f8fafc',
                      }}
                    >
                      <TableCell
                        sx={{
                          color: '#64748b',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.03em',
                        }}
                      >
                        Title
                      </TableCell>

                      <TableCell
                        sx={{
                          color: '#64748b',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.03em',
                        }}
                      >
                        Property
                      </TableCell>

                      <TableCell
                        sx={{
                          color: '#64748b',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.03em',
                        }}
                      >
                        Unit
                      </TableCell>

                      <TableCell
                        sx={{
                          color: '#64748b',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.03em',
                        }}
                      >
                        Priority
                      </TableCell>

                      <TableCell
                        sx={{
                          color: '#64748b',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.03em',
                        }}
                      >
                        Status
                      </TableCell>

                      <TableCell
                        sx={{
                          color: '#64748b',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.03em',
                        }}
                      >
                        Reported By
                      </TableCell>

                      <TableCell
                        align="right"
                        sx={{
                          color: '#64748b',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.03em',
                        }}
                      >
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {filteredRequests.map((request) => (
                      <TableRow
                        key={request.id}
                        hover
                        sx={{
                          '&:last-child td': {
                            borderBottom: 0,
                          },
                        }}
                      >
                        <TableCell>
                          <Typography
                            sx={{
                              color: '#1e293b',
                              fontWeight: 600,
                              fontSize: '0.875rem',
                            }}
                          >
                            {request.title}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography
                            sx={{
                              color: '#475569',
                              fontSize: '0.875rem',
                            }}
                          >
                            {request.propertyName}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography
                            sx={{
                              color: '#475569',
                              fontSize: '0.875rem',
                            }}
                          >
                            {request.unitNumber ??
                              'Property-wide'}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={request.priority}
                            color={getPriorityColor(
                              request.priority
                            )}
                            size="small"
                            sx={{
                              fontWeight: 600,
                              fontSize: '0.72rem',
                            }}
                          />
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={request.status}
                            color={getStatusColor(
                              request.status
                            )}
                            size="small"
                            sx={{
                              fontWeight: 600,
                              fontSize: '0.72rem',
                            }}
                          />
                        </TableCell>

                        <TableCell>
                          <Typography
                            sx={{
                              color: '#475569',
                              fontSize: '0.875rem',
                            }}
                          >
                            {request.reportedByTenantName ||
                              request.reportedByUserName ||
                              'Unknown'}
                          </Typography>
                        </TableCell>

                        <TableCell align="right">
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<VisibilityIcon />}
                            onClick={() =>
                              navigate(
                                '/maintenance-requests/' +
                                  request.id
                              )
                            }
                            sx={{
                              borderColor: '#cbd5e1',
                              color: '#475569',
                              borderRadius: 1.5,
                              fontWeight: 600,
                              textTransform: 'none',
                              '&:hover': {
                                borderColor: '#94a3b8',
                                bgcolor: '#f8fafc',
                              },
                            }}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
      </Box>
    </Container>
  );
};

export default MaintenanceRequestsPage;