import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import ApartmentIcon from '@mui/icons-material/Apartment';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import BuildIcon from '@mui/icons-material/Build';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import PaymentsIcon from '@mui/icons-material/Payments';
import PeopleIcon from '@mui/icons-material/People';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

import DashboardStatCard from '../components/DashboardStatCard';
import { useAuth } from '../context/AuthContext';
import { propertiesApi } from '../api/properties';
import { unitsApi } from '../api/units';
import { maintenanceRequestsApi } from '../api/maintenanceRequests';
import { paymentsApi } from '../api/payments';
import { buildingsApi } from '../api/buildings';
import { leasesApi } from '../api/leases';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';



const COLORS = {
  primary: '#2563EB',
  green: '#16A34A',
  orange: '#EA580C',
  purple: '#7C3AED',
  red: '#DC2626',
};

const propertyAccents = [
  '#2563EB',
  '#16A34A',
  '#EA580C',
  '#7C3AED',
];

const activities = [
  {
    title: 'Rent payment received',
    description: 'Unit 3B · Sunset Apartments',
    time: '12 min ago',
    icon: <PaymentsIcon />,
    color: COLORS.green,
  },
  {
    title: 'Maintenance request opened',
    description: 'Leaking faucet reported in Unit 2A',
    time: '1 hour ago',
    icon: <BuildIcon />,
    color: COLORS.orange,
  },
  {
    title: 'New tenant added',
    description: 'Marta Bekele moved into Unit 5C',
    time: '3 hours ago',
    icon: <PeopleIcon />,
    color: COLORS.primary,
  },
  {
    title: 'Lease renewed',
    description: 'Unit 1A · Riverside Heights',
    time: 'Yesterday',
    icon: <RequestQuoteIcon />,
    color: COLORS.purple,
  },
];

const MaintenanceStaffDashboard = ({
  user,
}: {
  user: any;
}) => {
  const navigate = useNavigate();

  const [requests, setRequests] = useState<
    import('../types').MaintenanceRequest[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadMaintenanceRequests = async () => {
      try {
        setLoading(true);
        setError('');

        const data = await maintenanceRequestsApi.getAll();

        setRequests(data);
      } catch (err) {
        console.error(
          'Failed to load maintenance dashboard:',
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load maintenance requests.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadMaintenanceRequests();
  }, []);

  const assignedToMe = useMemo(() => {
    return requests.filter(
      (request) =>
        request.assignedToUserId === Number(user?.id)
    );
  }, [requests, user?.id]);

  const openRequests = useMemo(() => {
    return requests.filter(
      (request) =>
        request.status !== 'Resolved' &&
        request.status !== 'Cancelled'
    );
  }, [requests]);

  const inProgressRequests = useMemo(() => {
    return requests.filter(
      (request) => request.status === 'InProgress'
    );
  }, [requests]);

  const urgentRequests = useMemo(() => {
    return requests.filter(
      (request) =>
        request.priority === 'Emergency' ||
        request.priority === 'High'
    );
  }, [requests]);

  const myInProgress = useMemo(() => {
    return assignedToMe.filter(
      (request) => request.status === 'InProgress'
    );
  }, [assignedToMe]);

  const myOpen = useMemo(() => {
    return assignedToMe.filter(
      (request) =>
        request.status !== 'Resolved' &&
        request.status !== 'Cancelled'
    );
  }, [assignedToMe]);

  const recentRequests = useMemo(() => {
    return [...assignedToMe]
      .sort(
        (a, b) =>
          new Date(b.createdAtUtc).getTime() -
          new Date(a.createdAtUtc).getTime()
      )
      .slice(0, 6);
  }, [assignedToMe]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Emergency':
        return '#DC2626';
      case 'High':
        return '#EA580C';
      case 'Medium':
        return '#2563EB';
      case 'Low':
        return '#16A34A';
      default:
        return '#64748B';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return '#2563EB';
      case 'Assigned':
        return '#7C3AED';
      case 'InProgress':
        return '#EA580C';
      case 'OnHold':
        return '#64748B';
      case 'Resolved':
        return '#16A34A';
      case 'Cancelled':
        return '#DC2626';
      default:
        return '#64748B';
    }
  };

  const formatStatus = (status: string) => {
    if (status === 'InProgress') {
      return 'In Progress';
    }

    return status;
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date));
  };

  const firstName = user?.firstName || 'there';

  const stats = [
    {
      title: 'Open requests',
      value: loading ? '—' : String(openRequests.length),
      detail: 'Maintenance work requiring attention',
      icon: <BuildIcon />,
      color: COLORS.primary,
    },
    {
      title: 'Assigned to me',
      value: loading ? '—' : String(myOpen.length),
      detail: 'Active requests assigned to you',
      icon: <AssignmentIndIcon />,
      color: COLORS.purple,
    },
    {
      title: 'In progress',
      value: loading ? '—' : String(myInProgress.length),
      detail: 'Requests currently being worked on',
      icon: <TrendingUpIcon />,
      color: COLORS.orange,
    },
    {
      title: 'High priority',
      value: loading ? '—' : String(urgentRequests.length),
      detail: 'High or emergency requests',
      icon: <WarningAmberIcon />,
      color: COLORS.red,
    },
  ];

  return (
    <Box
      sx={(theme) => ({
        width: '100%',
        minWidth: 0,
        minHeight: '100%',
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 2.5, md: 3.5 },
      })}
    >
      {/* HEADER */}

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          mb: 3,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 0.75,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: COLORS.primary,
                fontWeight: 700,
              }}
            >
              MAINTENANCE
            </Typography>

            <Box
              sx={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                backgroundColor: COLORS.primary,
              }}
            />

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Dashboard
            </Typography>
          </Box>

          <Typography
            variant="h4"
            component="h1"
            sx={(theme) => ({
              fontWeight: 800,
              color: theme.palette.text.primary,
              fontSize: {
                xs: '1.65rem',
                sm: '2rem',
                md: '2.15rem',
              },
              letterSpacing: '-0.025em',
              lineHeight: 1.2,
            })}
          >
            Good morning, {firstName}
          </Typography>

          <Typography
            sx={(theme) => ({
              mt: 0.75,
              color: theme.palette.text.secondary,
              fontSize: '0.95rem',
            })}
          >
            Here is the latest maintenance work requiring your attention.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() =>
            navigate('/maintenance-requests/create')
          }
          sx={{
            flexShrink: 0,
            px: 2.25,
            py: 1.1,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 700,
            boxShadow: '0 6px 16px rgba(37, 99, 235, 0.2)',
          }}
        >
          Create request
        </Button>
      </Box>

      {/* ERROR */}

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            borderRadius: 2.5,
          }}
        >
          Failed to load maintenance data: {error}
        </Alert>
      )}

      {/* STATUS BANNER */}

      <Paper
        elevation={0}
        sx={(theme) => ({
          mb: 3,
          px: { xs: 2, sm: 2.5 },
          py: 1.75,
          borderRadius: 2.5,
          border: `1px solid ${
            theme.palette.mode === 'dark'
              ? 'rgba(59, 130, 246, 0.35)'
              : '#BFDBFE'
          }`,
          background:
            theme.palette.mode === 'dark'
              ? 'linear-gradient(90deg, rgba(30, 64, 175, 0.22) 0%, rgba(15, 23, 42, 0.7) 100%)'
              : 'linear-gradient(90deg, #EFF6FF 0%, #FFFFFF 100%)',
        })}
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
              width: 38,
              height: 38,
              flexShrink: 0,
              display: 'grid',
              placeItems: 'center',
              borderRadius: 2,
              backgroundColor: 'rgba(37, 99, 235, 0.12)',
              color: COLORS.primary,
            }}
          >
            <BuildIcon fontSize="small" />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                color: COLORS.primary,
              }}
            >
              Maintenance workspace
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
            >
              Focus on assigned requests and outstanding maintenance work.
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* STATISTICS */}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(4, minmax(0, 1fr))',
          },
          gap: 2,
          mb: 3,
        }}
      >
        {stats.map((stat) => (
          <DashboardStatCard
            key={stat.title}
            {...stat}
          />
        ))}
      </Box>

      {/* MAIN CONTENT */}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: 'minmax(0, 1.7fr) minmax(320px, 0.8fr)',
          },
          gap: 3,
          alignItems: 'start',
        }}
      >
        {/* MY RECENT WORK */}

        <Paper
          elevation={0}
          sx={(theme) => ({
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 3,
            overflow: 'hidden',
            backgroundColor: theme.palette.background.paper,
          })}
        >
          <Box
            sx={(theme) => ({
              px: { xs: 2, sm: 3 },
              py: 2.25,
              borderBottom: `1px solid ${theme.palette.divider}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2,
            })}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 750,
                }}
              >
                My recent work
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.35 }}
              >
                Maintenance requests assigned to you
              </Typography>
            </Box>

            <Button
              size="small"
              endIcon={<ArrowForwardIcon />}
              onClick={() =>
                navigate('/maintenance-requests')
              }
              sx={{
                flexShrink: 0,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              View all
            </Button>
          </Box>

          <Box sx={{ px: { xs: 2, sm: 3 } }}>
            {loading ? (
              <Box
                sx={{
                  py: 8,
                  textAlign: 'center',
                }}
              >
                <Typography color="text.secondary">
                  Loading maintenance requests...
                </Typography>
              </Box>
            ) : recentRequests.length === 0 ? (
              <Box
                sx={{
                  py: 8,
                  textAlign: 'center',
                }}
              >
                <Avatar
                  sx={{
                    width: 54,
                    height: 54,
                    mx: 'auto',
                    mb: 1.5,
                    backgroundColor: 'rgba(37, 99, 235, 0.12)',
                    color: COLORS.primary,
                  }}
                >
                  <BuildIcon />
                </Avatar>

                <Typography
                  sx={{
                    fontWeight: 700,
                  }}
                >
                  No assigned requests
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 0.5,
                    maxWidth: 420,
                    mx: 'auto',
                  }}
                >
                  You currently have no maintenance requests assigned to you.
                </Typography>
              </Box>
            ) : (
              <Stack divider={<Divider flexItem />}>
                {recentRequests.map((request) => (
                  <Box
                    key={request.id}
                    sx={{
                      py: 2,
                      display: 'flex',
                      alignItems: {
                        xs: 'flex-start',
                        sm: 'center',
                      },
                      gap: 1.5,
                      flexDirection: {
                        xs: 'column',
                        sm: 'row',
                      },
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 42,
                        height: 42,
                        backgroundColor: `${getPriorityColor(
                          request.priority
                        )}14`,
                        color: getPriorityColor(
                          request.priority
                        ),
                      }}
                    >
                      <BuildIcon fontSize="small" />
                    </Avatar>

                    <Box
                      sx={{
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                        }}
                      >
                        {request.title}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.3 }}
                      >
                        {request.propertyName}
                        {request.unitNumber
                          ? ` · Unit ${request.unitNumber}`
                          : ' · Property-wide'}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        Created {formatDate(request.createdAtUtc)}
                      </Typography>
                    </Box>

               <Stack
                  direction="row"
                  spacing={2}
                  sx={{ alignItems: 'center' }}
                >
                      <Chip
                        label={request.priority}
                        size="small"
                        sx={{
                          fontWeight: 650,
                          color: getPriorityColor(
                            request.priority
                          ),
                          backgroundColor: `${getPriorityColor(
                            request.priority
                          )}14`,
                        }}
                      />

                      <Chip
                        label={formatStatus(request.status)}
                        size="small"
                        sx={{
                          fontWeight: 650,
                          color: getStatusColor(
                            request.status
                          ),
                          backgroundColor: `${getStatusColor(
                            request.status
                          )}14`,
                        }}
                      />
                    </Stack>

                    <Button
                      size="small"
                      endIcon={<ArrowForwardIcon />}
                      onClick={() =>
                        navigate(
                          `/maintenance-requests/${request.id}`
                        )
                      }
                      sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        flexShrink: 0,
                      }}
                    >
                      View
                    </Button>
                  </Box>
                ))}
              </Stack>
            )}
          </Box>
        </Paper>

        {/* WORK SUMMARY */}

        <Paper
          elevation={0}
          sx={(theme) => ({
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 3,
            overflow: 'hidden',
            backgroundColor: theme.palette.background.paper,
          })}
        >
          <Box
            sx={(theme) => ({
              px: { xs: 2, sm: 3 },
              py: 2.25,
              borderBottom: `1px solid ${theme.palette.divider}`,
            })}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 750,
              }}
            >
              Work summary
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.35 }}
            >
              Current maintenance workload
            </Typography>
          </Box>

          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack spacing={1.5}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  backgroundColor: 'rgba(37, 99, 235, 0.10)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <BuildIcon
                    sx={{
                      color: COLORS.primary,
                      fontSize: 20,
                    }}
                  />

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Total requests
                  </Typography>
                </Box>

                <Typography
                  variant="body2"
                  sx={{ fontWeight: 750 }}
                >
                  {loading ? '—' : requests.length}
                </Typography>
              </Box>

              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  backgroundColor: 'rgba(124, 58, 237, 0.10)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <AssignmentIndIcon
                    sx={{
                      color: COLORS.purple,
                      fontSize: 20,
                    }}
                  />

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Assigned to me
                  </Typography>
                </Box>

                <Typography
                  variant="body2"
                  sx={{ fontWeight: 750 }}
                >
                  {loading ? '—' : assignedToMe.length}
                </Typography>
              </Box>

              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  backgroundColor: 'rgba(234, 88, 12, 0.10)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <TrendingUpIcon
                    sx={{
                      color: COLORS.orange,
                      fontSize: 20,
                    }}
                  />

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    In progress
                  </Typography>
                </Box>

                <Typography
                  variant="body2"
                  sx={{ fontWeight: 750 }}
                >
                  {loading ? '—' : inProgressRequests.length}
                </Typography>
              </Box>

              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  backgroundColor: 'rgba(220, 38, 38, 0.10)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <WarningAmberIcon
                    sx={{
                      color: COLORS.red,
                      fontSize: 20,
                    }}
                  />

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    High priority
                  </Typography>
                </Box>

                <Typography
                  variant="body2"
                  sx={{ fontWeight: 750 }}
                >
                  {loading ? '—' : urgentRequests.length}
                </Typography>
              </Box>
            </Stack>

            <Button
              fullWidth
              variant="outlined"
              endIcon={<ArrowForwardIcon />}
              onClick={() =>
                navigate('/maintenance-requests')
              }
              sx={{
                mt: 2.5,
                py: 1.1,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 650,
              }}
            >
              Open maintenance requests
            </Button>
          </Box>
        </Paper>

        {/* QUICK ACTIONS */}

        <Paper
          elevation={0}
          sx={(theme) => ({
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 3,
            overflow: 'hidden',
            backgroundColor: theme.palette.background.paper,
          })}
        >
          <Box
            sx={(theme) => ({
              px: { xs: 2, sm: 3 },
              py: 2.25,
              borderBottom: `1px solid ${theme.palette.divider}`,
            })}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 750,
              }}
            >
              Quick actions
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.35 }}
            >
              Common maintenance tasks
            </Typography>
          </Box>

          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack spacing={1}>
              <Button
                variant="outlined"
                startIcon={<BuildIcon />}
                onClick={() =>
                  navigate('/maintenance-requests')
                }
                sx={{
                  justifyContent: 'flex-start',
                  py: 1.25,
                  px: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                View maintenance requests
              </Button>

              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() =>
                  navigate('/maintenance-requests/create')
                }
                sx={{
                  justifyContent: 'flex-start',
                  py: 1.25,
                  px: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Create maintenance request
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

const TenantDashboard = ({ user }: { user: any }) => {
  const navigate = useNavigate();

  const [rent, setRent] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadTenantDashboard = async () => {
      try {
        setLoading(true);
        setError('');

        const [rentData, paymentData, maintenanceData] =
          await Promise.all([
            paymentsApi.getMyRent(),
            paymentsApi.getAll(),
            maintenanceRequestsApi.getAll(),
          ]);

        setRent(rentData);
        setPayments(paymentData);
        setMaintenanceRequests(maintenanceData);
      } catch (err: any) {
        console.error('Failed to load tenant dashboard:', err);

        setError(
          err?.response?.data?.message ||
            'Failed to load your dashboard.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadTenantDashboard();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB',
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  const formatDate = (date: string | null | undefined) => {
    if (!date) return '—';

    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'resolved':
        return 'success';

      case 'pending':
        return 'warning';

      case 'inprogress':
      case 'in progress':
        return 'info';

      case 'failed':
      case 'cancelled':
        return 'error';

      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
          Welcome, {user?.fullName || user?.name || 'Tenant'}
        </Typography>

        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
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
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Welcome, {user?.fullName || user?.name || 'Tenant'}
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Here is an overview of your rental and maintenance activity.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<BuildIcon />}
            onClick={() => navigate('/maintenance-requests/create')}
          >
            Report Maintenance
          </Button>

          {rent?.remainingAmount > 0 && (
            <Button
              variant="contained"
              startIcon={<PaymentsIcon />}
              onClick={() => navigate('/payments')}
            >
              Pay Rent
            </Button>
          )}
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Rent Statistics */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            lg: 'repeat(4, 1fr)',
          },
          gap: 2,
          mb: 3,
        }}
      >
        <DashboardStatCard
          title="Current Rent"
          value={formatCurrency(rent?.rentAmount || 0)}
          icon={<PaymentsIcon />}
        />

        <DashboardStatCard
          title="Paid"
          value={formatCurrency(rent?.paidAmount || 0)}
          icon={<CheckCircleIcon />}
        />

        <DashboardStatCard
          title="Remaining"
          value={formatCurrency(rent?.remainingAmount || 0)}
          icon={<WarningAmberIcon />}
        />

        <DashboardStatCard
          title="Next Due Date"
          value={formatDate(rent?.dueDate)}
          icon={<CalendarMonthOutlinedIcon />}
        />
      </Box>

      {/* Unit / Rent Overview */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: '1fr 1fr',
          },
          gap: 3,
          mb: 3,
        }}
      >
        <Card>
          <CardContent>
            <Stack
  direction="row"
  spacing={2}
  sx={{ alignItems: 'center' }}
>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  My Rental
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Current lease information
                </Typography>
              </Box>

              <Avatar>
                <HomeWorkIcon />
              </Avatar>
            </Stack>

            <Divider sx={{ mb: 2 }} />

            <Stack spacing={2}>
              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Unit
                </Typography>

                <Typography sx={{ fontWeight: 600 }}>
                  {rent?.unitNumber || 'No active unit'}
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Monthly Rent
                </Typography>

                <Typography sx={{ fontWeight: 600 }}>
                  {formatCurrency(rent?.rentAmount || 0)}
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Payment Status
                </Typography>

                <Chip
                  label={rent?.status || 'Unknown'}
                  color={getStatusColor(rent?.status || '') as any}
                  size="small"
                />
              </Box>

              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Due Date
                </Typography>

                <Typography sx={{ fontWeight: 600 }}>
                  {formatDate(rent?.dueDate)}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
       <Stack
  direction="row"
  spacing={2}
  sx={{ alignItems: 'center' }}
>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Payment Summary
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Your current rent payment
                </Typography>
              </Box>

              <Avatar>
                <PaymentsIcon />
              </Avatar>
            </Stack>

            <Divider sx={{ mb: 2 }} />

            <Stack spacing={2}>
              <Box>
             <Stack
  direction="row"
  spacing={2}
  sx={{ alignItems: 'center' }}
>
                  <Typography variant="body2">
                    Rent
                  </Typography>

                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {formatCurrency(rent?.rentAmount || 0)}
                  </Typography>
                </Stack>

                <LinearProgress
                  variant="determinate"
                  value={
                    rent?.rentAmount
                      ? Math.min(
                          100,
                          (rent.paidAmount / rent.rentAmount) * 100
                        )
                      : 0
                  }
                />
              </Box>

             <Stack
  direction="row"
  spacing={2}
  sx={{ alignItems: 'center' }}
>
                <Typography color="text.secondary">
                  Paid
                </Typography>

                <Typography sx={{ fontWeight: 600 }}>
                  {formatCurrency(rent?.paidAmount || 0)}
                </Typography>
              </Stack>

              <Stack
  direction="row"
  spacing={2}
  sx={{ alignItems: 'center' }}
>
                <Typography color="text.secondary">
                  Remaining
                </Typography>

                <Typography
                  sx={{ fontWeight: 700 }}
                  color={
                    rent?.remainingAmount > 0
                      ? 'warning.main'
                      : 'success.main'
                  }
                >
                  {formatCurrency(rent?.remainingAmount || 0)}
                </Typography>
              </Stack>

              {rent?.remainingAmount > 0 && (
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<PaymentsIcon />}
                  onClick={() => navigate('/payments')}
                >
                  Pay Rent
                </Button>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Box>

      {/* Maintenance Requests */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack
  direction="row"
  spacing={2}
  sx={{ alignItems: 'center' }}
>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                My Maintenance Requests
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Track maintenance issues reported for your unit.
              </Typography>
            </Box>

            <Button
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/maintenance-requests')}
            >
              View All
            </Button>
          </Stack>

          <Divider sx={{ mb: 2 }} />

          {maintenanceRequests.length === 0 ? (
            <Box
              sx={{
                py: 4,
                textAlign: 'center',
              }}
            >
              <BuildIcon
                sx={{
                  fontSize: 42,
                  color: 'text.secondary',
                  mb: 1,
                }}
              />

              <Typography color="text.secondary">
                You have no maintenance requests.
              </Typography>

              <Button
                sx={{ mt: 2 }}
                variant="outlined"
                startIcon={<BuildIcon />}
                onClick={() =>
                  navigate('/maintenance-requests/create')
                }
              >
                Report a Problem
              </Button>
            </Box>
          ) : (
            <Stack spacing={1.5}>
              {maintenanceRequests
                .slice(0, 5)
                .map((request) => (
                  <Paper
                    key={request.id}
                    variant="outlined"
                    sx={{ p: 2 }}
                  >
                    <Stack
                      direction={{
                        xs: 'column',
                        sm: 'row',
                      }}
                      sx={{
                        gap: 1,
                        justifyContent: 'space-between',
                        alignItems: 'center',
                     }}
                    >
                      <Box>
                        <Typography sx={{ fontWeight: 600 }}>
                          {request.title}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          {request.description}
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          Created {formatDate(request.createdAtUtc)}
                        </Typography>
                      </Box>

                      <Stack direction="row" spacing={1}>
                        <Chip
                          label={request.priority}
                          size="small"
                          variant="outlined"
                        />

                        <Chip
                          label={request.status}
                          size="small"
                          color={
                            getStatusColor(
                              request.status
                            ) as any
                          }
                        />
                      </Stack>
                    </Stack>
                  </Paper>
                ))}
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* Recent Payments */}
      <Card>
        <CardContent>
          <Stack
  direction="row"
  spacing={2}
  sx={{ alignItems: 'center' }}
>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Recent Payments
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Your latest payment activity.
              </Typography>
            </Box>

            <Button
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/payments')}
            >
              View Payments
            </Button>
          </Stack>

          <Divider sx={{ mb: 2 }} />

          {payments.length === 0 ? (
            <Typography color="text.secondary">
              No payment history available.
            </Typography>
          ) : (
            <Stack spacing={1.5}>
              {payments.slice(0, 5).map((payment) => (
                <Paper
                  key={payment.id}
                  variant="outlined"
                  sx={{ p: 2 }}
                >
                     <Stack
                        direction={{
                          xs: 'column',
                          sm: 'row',
                        }}
                        sx={{
                          gap: 1,
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                    <Box>
                      <Typography sx={{ fontWeight: 600 }}>
                        {payment.paymentType || 'Payment'}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        {formatDate(payment.paymentDate)}
                      </Typography>
                    </Box>

                    <Stack
  direction="row"
  spacing={1}
  sx={{ alignItems: 'center' }}
>
                      <Typography sx={{ fontWeight: 700 }}>
                        {formatCurrency(payment.amount)}
                      </Typography>

                      <Chip
                        label={payment.status}
                        size="small"
                        color={
                          getStatusColor(
                            payment.status
                          ) as any
                        }
                      />
                    </Stack>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

const DashboardPage = () => {
  const { user } = useAuth();

  if (user?.role === 'MaintenanceStaff') {
    return <MaintenanceStaffDashboard user={user} />;
  }

  if (user?.role === 'Tenant') {
    return <TenantDashboard user={user} />;
  }
  const navigate = useNavigate();
  const firstName = user?.firstName || 'there';
  const [propertyCount, setPropertyCount] = useState(0);
  const [unitCount, setUnitCount] = useState(0);
  const [maintenanceCount, setMaintenanceCount] = useState(0);

  const [propertyOverview, setPropertyOverview] = useState<
    {
      id: number;
      name: string;
      location: string;
      type: string;
      units: number;
      occupied: number;
      occupancy: number;
      income: string;
      accent: string;
    }[]
  >([]);

  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyPaymentCount, setMonthlyPaymentCount] = useState(0);

  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState('');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setDashboardLoading(true);
        setDashboardError('');

        const [
          propertyData,
          unitData,
          maintenanceData,
          paymentData,
          leaseData,
        ] = await Promise.all([
          propertiesApi.getAll(),
          unitsApi.getAll(),
          maintenanceRequestsApi.getAll(),
          paymentsApi.getAll(),
          leasesApi.getAll(),
        ]);

        setPropertyCount(propertyData.length);
        setUnitCount(unitData.length);
        setMaintenanceCount(maintenanceData.length);

        const buildingsByProperty = await Promise.all(
          propertyData.map(async (property) => {
            const buildings = await buildingsApi.getByProperty(property.id);

            return {
              propertyId: property.id,
              buildingIds: buildings.map((building) => building.id),
            };
          })
        );

        const propertyOverviewData = propertyData.map(
          (property, index) => {
            const propertyBuildings =
              buildingsByProperty.find(
                (item) => item.propertyId === property.id
              );

            const buildingIds = new Set(
              propertyBuildings?.buildingIds ?? []
            );

            const propertyUnits = unitData.filter((unit) =>
              buildingIds.has(unit.buildingId)
            );

            const propertyUnitIds = new Set(
              propertyUnits.map((unit) => unit.id)
            );

            const activeLeases = leaseData.filter(
              (lease) =>
                lease.status === 'Active' &&
                propertyUnitIds.has(lease.unitId)
            );

            const occupiedUnitIds = new Set(
              activeLeases.map((lease) => lease.unitId)
            );

            const monthlyRent = activeLeases.reduce(
              (total, lease) =>
                total + Number(lease.rentAmount || 0),
              0
            );

            const occupancy =
              propertyUnits.length > 0
                ? Math.round(
                  (occupiedUnitIds.size /
                    propertyUnits.length) *
                  100
                )
                : 0;

            const location = [
              property.city,
              property.regionOrSubCity,
            ]
              .filter(Boolean)
              .join(', ');

            return {
              id: property.id,
              name: property.name,
              location: location || property.addressLine1,
              type: property.propertyType,
              units: propertyUnits.length,
              occupied: occupiedUnitIds.size,
              income: `${formatCurrency(monthlyRent)} ETB`,
              accent:
                propertyAccents[
                index % propertyAccents.length
                ],
              occupancy,
            };
          }
        );

        setPropertyOverview(propertyOverviewData);

        const septemberPayments = paymentData.filter((payment) => {
          const paymentDate = new Date(payment.paymentDate);

          return (
            paymentDate.getFullYear() === 2026 &&
            paymentDate.getMonth() === 8
          );
        });

        const septemberIncome = septemberPayments.reduce(
          (total, payment) =>
            total + Number(payment.amount || 0),
          0
        );

        setMonthlyIncome(septemberIncome);
        setMonthlyPaymentCount(septemberPayments.length);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);

        setDashboardError(
          error instanceof Error
            ? error.message
            : 'Failed to load dashboard data.'
        );
      } finally {
        setDashboardLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const overallOccupancy = useMemo(() => {
    if (propertyOverview.length === 0) {
      return 0;
    }

    const totalUnits = propertyOverview.reduce(
      (total, property) => total + property.units,
      0
    );

    const occupiedUnits = propertyOverview.reduce(
      (total, property) => total + property.occupied,
      0
    );

    return totalUnits > 0
      ? Math.round((occupiedUnits / totalUnits) * 100)
      : 0;
  }, [propertyOverview]);

  const stats = [
    {
      title: 'Total properties',
      value: dashboardLoading ? '—' : String(propertyCount),
      detail: 'Properties in your portfolio',
      icon: <ApartmentIcon />,
      color: COLORS.primary,
    },
    {
      title: 'Total units',
      value: dashboardLoading ? '—' : String(unitCount),
      detail: 'Units across all properties',
      icon: <HomeWorkIcon />,
      color: COLORS.green,
    },
    {
      title: 'Maintenance requests',
      value: dashboardLoading ? '—' : String(maintenanceCount),
      detail: 'Total recorded requests',
      icon: <BuildIcon />,
      color: COLORS.orange,
    },
    {
      title: 'September income',
      value: dashboardLoading
        ? '—'
        : `${formatCurrency(monthlyIncome)} ETB`,
      detail: dashboardLoading
        ? 'Loading payment data...'
        : `${monthlyPaymentCount} payment${monthlyPaymentCount === 1 ? '' : 's'
        } recorded`,
      icon: <TrendingUpIcon />,
      color: COLORS.purple,
    },
  ];

  return (
    <Box
      sx={(theme) => ({
        width: '100%',
        minWidth: 0,
        minHeight: '100%',
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 2.5, md: 3.5 },
      })}
    >
      {/* HEADER */}

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          mb: 3,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 0.75,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: COLORS.primary,
                fontWeight: 700,
              }}
            >
              PROPERTY MANAGEMENT
            </Typography>

            <Box
              sx={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                backgroundColor: COLORS.primary,
              }}
            />

            <Typography
              variant="body2"
              sx={(theme) => ({
                color: theme.palette.text.secondary,
              })}
            >
              Dashboard
            </Typography>
          </Box>

          <Typography
            variant="h4"
            component="h1"
            sx={(theme) => ({
              fontWeight: 800,
              color: theme.palette.text.primary,
              fontSize: {
                xs: '1.65rem',
                sm: '2rem',
                md: '2.15rem',
              },
              letterSpacing: '-0.025em',
              lineHeight: 1.2,
            })}
          >
            Good morning, {firstName}
          </Typography>

          <Typography
            sx={(theme) => ({
              mt: 0.75,
              color: theme.palette.text.secondary,
              fontSize: '0.95rem',
            })}
          >
            Here is what is happening across your properties today.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/properties/create')}
          sx={{
            flexShrink: 0,
            px: 2.25,
            py: 1.1,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 700,
            boxShadow: '0 6px 16px rgba(37, 99, 235, 0.2)',
            '&:hover': {
              boxShadow: '0 8px 20px rgba(37, 99, 235, 0.28)',
            },
          }}
        >
          Add property
        </Button>
      </Box>

      {/* ERROR */}

      {dashboardError && (
        <Alert
          severity="error"
          sx={(theme) => ({
            mb: 3,
            borderRadius: 2.5,
            border: `1px solid ${theme.palette.divider}`,
          })}
        >
          Failed to load dashboard data: {dashboardError}
        </Alert>
      )}

      {/* STATUS BANNER */}

      <Paper
        elevation={0}
        sx={(theme) => ({
          mb: 3,
          px: { xs: 2, sm: 2.5 },
          py: 1.75,
          borderRadius: 2.5,
          border: `1px solid ${theme.palette.mode === 'dark'
              ? 'rgba(34, 197, 94, 0.35)'
              : '#BBF7D0'
            }`,
          background:
            theme.palette.mode === 'dark'
              ? 'linear-gradient(90deg, rgba(22, 101, 52, 0.22) 0%, rgba(15, 23, 42, 0.7) 100%)'
              : 'linear-gradient(90deg, #F0FDF4 0%, #FFFFFF 100%)',
        })}
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
              width: 38,
              height: 38,
              flexShrink: 0,
              display: 'grid',
              placeItems: 'center',
              borderRadius: 2,
              backgroundColor: 'rgba(34, 197, 94, 0.14)',
              color: COLORS.green,
            }}
          >
            <CheckCircleIcon fontSize="small" />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={(theme) => ({
                fontWeight: 700,
                color:
                  theme.palette.mode === 'dark'
                    ? '#86EFAC'
                    : '#166534',
              })}
            >
              Portfolio is running smoothly
            </Typography>

            <Typography
              variant="caption"
              sx={(theme) => ({
                color: theme.palette.text.secondary,
              })}
            >
              All scheduled rent collections for September are on track.
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* STATISTICS */}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(4, minmax(0, 1fr))',
          },
          gap: 2,
          mb: 3,
        }}
      >
        {stats.map((stat) => (
          <DashboardStatCard
            key={stat.title}
            {...stat}
          />
        ))}
      </Box>

      {/* MAIN CONTENT */}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: 'minmax(0, 1.7fr) minmax(320px, 0.8fr)',
          },
          gap: 3,
          alignItems: 'start',
        }}
      >
        {/* PROPERTY OVERVIEW */}

        <Paper
          elevation={0}
          sx={(theme) => ({
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 3,
            overflow: 'hidden',
            backgroundColor: theme.palette.background.paper,
          })}
        >
          <Box
            sx={(theme) => ({
              px: { xs: 2, sm: 3 },
              py: 2.25,
              borderBottom: `1px solid ${theme.palette.divider}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2,
            })}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="h6"
                sx={(theme) => ({
                  fontWeight: 750,
                  color: theme.palette.text.primary,
                })}
              >
                Property overview
              </Typography>

              <Typography
                variant="body2"
                sx={(theme) => ({
                  mt: 0.35,
                  color: theme.palette.text.secondary,
                })}
              >
                Performance across your portfolio
              </Typography>
            </Box>

            <Button
              size="small"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/properties')}
              sx={{
                flexShrink: 0,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              View all
            </Button>
          </Box>

          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack spacing={1.5}>
              {dashboardLoading ? (
                <Box
                  sx={{
                    py: 8,
                    textAlign: 'center',
                  }}
                >
                  <Typography color="text.secondary">
                    Loading properties...
                  </Typography>
                </Box>
              ) : propertyOverview.length === 0 ? (
                <Box
                  sx={{
                    py: 8,
                    textAlign: 'center',
                  }}
                >
                  <Box
                    sx={{
                      width: 54,
                      height: 54,
                      mx: 'auto',
                      mb: 1.5,
                      display: 'grid',
                      placeItems: 'center',
                      borderRadius: 2.5,
                      backgroundColor: 'rgba(37, 99, 235, 0.12)',
                      color: COLORS.primary,
                    }}
                  >
                    <ApartmentIcon />
                  </Box>

                  <Typography
                    sx={(theme) => ({
                      fontWeight: 700,
                      color: theme.palette.text.primary,
                    })}
                  >
                    No properties yet
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    Add your first property to start managing your portfolio.
                  </Typography>

                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/properties/create')}
                    sx={{
                      mt: 2,
                      textTransform: 'none',
                      borderRadius: 2,
                    }}
                  >
                    Add property
                  </Button>
                </Box>
              ) : (
                propertyOverview.map((property) => {
                  const occupancy = property.occupancy;

                  return (
                    <Card
                      key={property.id}
                      variant="outlined"
                      sx={(theme) => ({
                        borderRadius: 2.5,
                        borderColor: theme.palette.divider,
                        backgroundColor:
                          theme.palette.background.paper,
                        boxShadow: 'none',
                        transition: 'all 0.2s ease',

                        '&:hover': {
                          borderColor: property.accent,
                          boxShadow:
                            theme.palette.mode === 'dark'
                              ? '0 8px 20px rgba(0, 0, 0, 0.25)'
                              : '0 8px 20px rgba(15, 23, 42, 0.06)',
                          transform: 'translateY(-1px)',
                        },
                      })}
                    >
                      <CardContent
                        sx={{
                          p: { xs: 2, sm: 2.25 },
                          '&:last-child': {
                            pb: { xs: 2, sm: 2.25 },
                          },
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: 2,
                            mb: 1.75,
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              gap: 1.5,
                              minWidth: 0,
                              flex: 1,
                            }}
                          >
                            <Avatar
                              sx={{
                                width: 44,
                                height: 44,
                                flexShrink: 0,
                                backgroundColor: `${property.accent}14`,
                                color: property.accent,
                              }}
                            >
                              <ApartmentIcon fontSize="small" />
                            </Avatar>

                            <Box sx={{ minWidth: 0 }}>
                              <Typography
                                sx={(theme) => ({
                                  fontWeight: 700,
                                  color: theme.palette.text.primary,
                                })}
                                noWrap
                              >
                                {property.name}
                              </Typography>

                              <Typography
                                variant="body2"
                                sx={(theme) => ({
                                  mt: 0.25,
                                  color: theme.palette.text.secondary,
                                })}
                                noWrap
                              >
                                {property.location}
                              </Typography>
                            </Box>
                          </Box>

                          <Chip
                            label={property.type}
                            size="small"
                            sx={{
                              flexShrink: 0,
                              height: 28,
                              fontWeight: 600,
                              backgroundColor:
                                property.type === 'Commercial'
                                  ? 'rgba(234, 88, 12, 0.12)'
                                  : 'rgba(37, 99, 235, 0.12)',
                              color:
                                property.type === 'Commercial'
                                  ? COLORS.orange
                                  : COLORS.primary,
                              border: 'none',
                            }}
                          />
                        </Box>

                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 0.75,
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={(theme) => ({
                              color: theme.palette.text.secondary,
                              fontWeight: 500,
                            })}
                          >
                            Occupancy
                          </Typography>

                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 750,
                              color: property.accent,
                            }}
                          >
                            {occupancy}%
                          </Typography>
                        </Box>

                        <LinearProgress
                          variant="determinate"
                          value={occupancy}
                          sx={(theme) => ({
                            height: 8,
                            borderRadius: 4,
                            backgroundColor:
                              theme.palette.mode === 'dark'
                                ? 'rgba(148, 163, 184, 0.2)'
                                : '#E2E8F0',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 4,
                              backgroundColor: property.accent,
                            },
                          })}
                        />

                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: 1,
                            mt: 1.5,
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={(theme) => ({
                              color: theme.palette.text.secondary,
                            })}
                            noWrap
                          >
                            {property.occupied} of {property.units} units occupied
                          </Typography>

                          <Typography
                            variant="body2"
                            sx={(theme) => ({
                              fontWeight: 700,
                              color: theme.palette.text.primary,
                              whiteSpace: 'nowrap',
                            })}
                          >
                            {property.income}
                            <Box
                              component="span"
                              sx={(theme) => ({
                                color: theme.palette.text.secondary,
                                fontWeight: 400,
                              })}
                            >
                              {' '}
                              / month
                            </Box>
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </Stack>
          </Box>
        </Paper>

        {/* PORTFOLIO SNAPSHOT */}

        <Paper
          elevation={0}
          sx={(theme) => ({
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 3,
            overflow: 'hidden',
            backgroundColor: theme.palette.background.paper,
          })}
        >
          <Box
            sx={(theme) => ({
              px: { xs: 2, sm: 3 },
              py: 2.25,
              borderBottom: `1px solid ${theme.palette.divider}`,
            })}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
              }}
            >
              <Box>
                <Typography
                  variant="h6"
                  sx={(theme) => ({
                    fontWeight: 750,
                    color: theme.palette.text.primary,
                  })}
                >
                  Portfolio snapshot
                </Typography>

                <Typography
                  variant="body2"
                  sx={(theme) => ({
                    mt: 0.35,
                    color: theme.palette.text.secondary,
                  })}
                >
                  Occupancy and financial health
                </Typography>
              </Box>

              <MoreHorizIcon
                sx={(theme) => ({
                  color: theme.palette.text.secondary,
                })}
              />
            </Box>
          </Box>

          <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
            {/* Occupancy Circle */}

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                mb: 3,
              }}
            >
              <Box
                sx={(theme) => ({
                  position: 'relative',
                  width: 178,
                  height: 178,
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: '50%',
                  background: `conic-gradient(
                    ${COLORS.primary} 0 ${overallOccupancy}%,
                    ${theme.palette.mode === 'dark'
                      ? 'rgba(148, 163, 184, 0.2)'
                      : '#E2E8F0'
                    } ${overallOccupancy}% 100%
                  )`,
                  boxShadow:
                    theme.palette.mode === 'dark'
                      ? '0 10px 30px rgba(37, 99, 235, 0.2)'
                      : '0 10px 30px rgba(37, 99, 235, 0.12)',
                })}
              >
                <Box
                  sx={(theme) => ({
                    width: 136,
                    height: 136,
                    display: 'grid',
                    placeItems: 'center',
                    borderRadius: '50%',
                    backgroundColor:
                      theme.palette.background.paper,
                  })}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography
                      variant="h3"
                      sx={(theme) => ({
                        fontWeight: 800,
                        color: theme.palette.text.primary,
                        lineHeight: 1,
                      })}
                    >
                      {dashboardLoading
                        ? '—'
                        : `${overallOccupancy}%`}
                    </Typography>

                    <Typography
                      variant="caption"
                      sx={(theme) => ({
                        color: theme.palette.text.secondary,
                        fontWeight: 500,
                      })}
                    >
                      occupied
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Snapshot Metrics */}

            <Stack spacing={1.5}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  backgroundColor: 'rgba(22, 163, 74, 0.10)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    minWidth: 0,
                  }}
                >
                  <PaymentsIcon
                    sx={{
                      color: COLORS.green,
                      fontSize: 20,
                    }}
                  />

                  <Typography
                    variant="body2"
                    sx={(theme) => ({
                      color: theme.palette.text.secondary,
                    })}
                  >
                    Collected this month
                  </Typography>
                </Box>

                <Typography
                  variant="body2"
                  sx={(theme) => ({
                    fontWeight: 750,
                    color: theme.palette.text.primary,
                    whiteSpace: 'nowrap',
                  })}
                >
                  {dashboardLoading
                    ? '—'
                    : `${formatCurrency(monthlyIncome)} ETB`}
                </Typography>
              </Box>

              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  backgroundColor: 'rgba(37, 99, 235, 0.10)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <CalendarMonthOutlinedIcon
                    sx={{
                      color: COLORS.primary,
                      fontSize: 20,
                    }}
                  />

                  <Typography
                    variant="body2"
                    sx={(theme) => ({
                      color: theme.palette.text.secondary,
                    })}
                  >
                    Payments recorded
                  </Typography>
                </Box>

                <Typography
                  variant="body2"
                  sx={(theme) => ({
                    fontWeight: 750,
                    color: theme.palette.text.primary,
                  })}
                >
                  {dashboardLoading
                    ? '—'
                    : monthlyPaymentCount}
                </Typography>
              </Box>

              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  backgroundColor: 'rgba(124, 58, 237, 0.10)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <HomeWorkIcon
                    sx={{
                      color: COLORS.purple,
                      fontSize: 20,
                    }}
                  />

                  <Typography
                    variant="body2"
                    sx={(theme) => ({
                      color: theme.palette.text.secondary,
                    })}
                  >
                    Total units
                  </Typography>
                </Box>

                <Typography
                  variant="body2"
                  sx={(theme) => ({
                    fontWeight: 750,
                    color: theme.palette.text.primary,
                  })}
                >
                  {dashboardLoading ? '—' : unitCount}
                </Typography>
              </Box>
            </Stack>

            <Button
              fullWidth
              variant="outlined"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/reports/lease-occupancy')}
              sx={{
                mt: 2.5,
                py: 1.1,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 650,
              }}
            >
              View occupancy report
            </Button>
          </Box>
        </Paper>

        {/* RECENT ACTIVITY */}

        <Paper
          elevation={0}
          sx={(theme) => ({
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 3,
            overflow: 'hidden',
            backgroundColor: theme.palette.background.paper,
          })}
        >
          <Box
            sx={(theme) => ({
              px: { xs: 2, sm: 3 },
              py: 2.25,
              borderBottom: `1px solid ${theme.palette.divider}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2,
            })}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="h6"
                sx={(theme) => ({
                  fontWeight: 750,
                  color: theme.palette.text.primary,
                })}
              >
                Recent activity
              </Typography>

              <Typography
                variant="body2"
                sx={(theme) => ({
                  mt: 0.35,
                  color: theme.palette.text.secondary,
                })}
              >
                Latest updates from your team
              </Typography>
            </Box>

            <Button
              size="small"
              onClick={() => navigate('/maintenance-requests')}
              sx={{
                flexShrink: 0,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              View all
            </Button>
          </Box>

          <Box sx={{ px: { xs: 2, sm: 3 } }}>
            <Stack divider={<Divider flexItem />}>
              {activities.map((activity) => (
                <Box
                  key={activity.title}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    py: 1.75,
                  }}
                >
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      backgroundColor: `${activity.color}14`,
                      color: activity.color,
                      flexShrink: 0,
                    }}
                  >
                    {activity.icon}
                  </Avatar>

                  <Box
                    sx={{
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={(theme) => ({
                        fontWeight: 700,
                        color: theme.palette.text.primary,
                      })}
                      noWrap
                    >
                      {activity.title}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={(theme) => ({
                        mt: 0.25,
                        color: theme.palette.text.secondary,
                      })}
                      noWrap
                    >
                      {activity.description}
                    </Typography>
                  </Box>

                  <Typography
                    variant="caption"
                    sx={(theme) => ({
                      color: theme.palette.text.secondary,
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    })}
                  >
                    {activity.time}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        </Paper>

        {/* QUICK ACTIONS */}

        <Paper
          elevation={0}
          sx={(theme) => ({
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 3,
            overflow: 'hidden',
            backgroundColor: theme.palette.background.paper,
          })}
        >
          <Box
            sx={(theme) => ({
              px: { xs: 2, sm: 3 },
              py: 2.25,
              borderBottom: `1px solid ${theme.palette.divider}`,
            })}
          >
            <Typography
              variant="h6"
              sx={(theme) => ({
                fontWeight: 750,
                color: theme.palette.text.primary,
              })}
            >
              Quick actions
            </Typography>

            <Typography
              variant="body2"
              sx={(theme) => ({
                mt: 0.35,
                color: theme.palette.text.secondary,
              })}
            >
              Common tasks, one click away
            </Typography>
          </Box>

          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack spacing={1}>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => navigate('/properties/create')}
                sx={{
                  justifyContent: 'flex-start',
                  py: 1.25,
                  px: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Add a property
              </Button>

              <Button
                variant="outlined"
                startIcon={<PeopleIcon />}
                onClick={() => navigate('/tenants/create')}
                sx={{
                  justifyContent: 'flex-start',
                  py: 1.25,
                  px: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Add a tenant
              </Button>

              <Button
                variant="outlined"
                startIcon={<PaymentsIcon />}
                onClick={() => navigate('/payments/create')}
                sx={{
                  justifyContent: 'flex-start',
                  py: 1.25,
                  px: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Record a payment
              </Button>

              <Button
                variant="outlined"
                startIcon={<BuildIcon />}
                onClick={() =>
                  navigate('/maintenance-requests/create')
                }
                sx={{
                  justifyContent: 'flex-start',
                  py: 1.25,
                  px: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Create maintenance request
              </Button>
            </Stack>

            <Box
              sx={{
                mt: 2.5,
                p: 1.5,
                borderRadius: 2,
                backgroundColor: 'rgba(234, 88, 12, 0.10)',
                display: 'flex',
                gap: 1,
                alignItems: 'flex-start',
              }}
            >
              <WarningAmberIcon
                sx={{
                  color: COLORS.orange,
                  fontSize: 20,
                  flexShrink: 0,
                }}
              />

              <Typography
                variant="body2"
                sx={(theme) => ({
                  color: theme.palette.text.secondary,
                  lineHeight: 1.5,
                })}
              >
                Maintenance request count reflects all recorded requests.
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* MONTHLY COLLECTION */}

      <Paper
        elevation={0}
        sx={(theme) => ({
          mt: 3,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 3,
          overflow: 'hidden',
          backgroundColor: theme.palette.background.paper,
        })}
      >
        <Box
          sx={(theme) => ({
            px: { xs: 2, sm: 3 },
            py: 2.25,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
            borderBottom: `1px solid ${theme.palette.divider}`,
          })}
        >
          <Box>
            <Typography
              variant="h6"
              sx={(theme) => ({
                fontWeight: 750,
                color: theme.palette.text.primary,
              })}
            >
              Monthly collection
            </Typography>

            <Typography
              variant="body2"
              sx={(theme) => ({
                mt: 0.35,
                color: theme.palette.text.secondary,
              })}
            >
              September 2026 rent collection
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              px: 1.25,
              py: 0.75,
              borderRadius: 2,
              backgroundColor: 'rgba(22, 163, 74, 0.10)',
            }}
          >
            <ArrowUpwardRoundedIcon
              sx={{
                color: COLORS.green,
                fontSize: 17,
              }}
            />

            <Typography
              variant="caption"
              sx={{
                color: COLORS.green,
                fontWeight: 700,
              }}
            >
              Live data
            </Typography>
          </Box>
        </Box>

        <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              gap: 2,
              mb: 1.5,
            }}
          >
            <Box>
              <Typography
                variant="h4"
                sx={(theme) => ({
                  fontWeight: 800,
                  color: theme.palette.text.primary,
                })}
              >
                {dashboardLoading
                  ? '—'
                  : `${formatCurrency(monthlyIncome)} ETB`}
              </Typography>

              <Typography
                variant="body2"
                sx={(theme) => ({
                  mt: 0.5,
                  color: theme.palette.text.secondary,
                })}
              >
                collected this month
              </Typography>
            </Box>

            <Typography
              variant="body2"
              sx={(theme) => ({
                color: theme.palette.text.secondary,
                fontWeight: 500,
              })}
            >
              {dashboardLoading
                ? 'Loading...'
                : `${monthlyPaymentCount} payments`}
            </Typography>
          </Box>

          <LinearProgress
            variant="determinate"
            value={100}
            sx={(theme) => ({
              height: 10,
              borderRadius: 5,
              backgroundColor:
                theme.palette.mode === 'dark'
                  ? 'rgba(148, 163, 184, 0.2)'
                  : '#E2E8F0',
              '& .MuiLinearProgress-bar': {
                borderRadius: 5,
                background:
                  'linear-gradient(90deg, #2563EB 0%, #4F46E5 100%)',
              },
            })}
          />

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 2,
              mt: 1,
            }}
          >
            <Typography
              variant="caption"
              sx={(theme) => ({
                color: theme.palette.text.secondary,
              })}
            >
              Actual payments received
            </Typography>

            <Typography
              variant="caption"
              sx={(theme) => ({
                color: theme.palette.text.secondary,
              })}
            >
              Collection target not configured
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default DashboardPage;