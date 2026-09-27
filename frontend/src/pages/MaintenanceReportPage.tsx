import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  Paper,
  Typography,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

import {
  dashboardApi,
  type MaintenanceReport,
} from '../api/dashboard';

import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import EngineeringOutlinedIcon from '@mui/icons-material/EngineeringOutlined';
import PauseCircleOutlineOutlinedIcon from '@mui/icons-material/PauseCircleOutlineOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import LowPriorityOutlinedIcon from '@mui/icons-material/LowPriorityOutlined';
import PriorityHighOutlinedIcon from '@mui/icons-material/PriorityHighOutlined';

const COLORS = {
  primary: '#2563EB',
  primaryLight: '#EFF6FF',

  open: '#2563EB',
  openLight: '#EFF6FF',

  assigned: '#7C3AED',
  assignedLight: '#F5F3FF',

  inProgress: '#EA580C',
  inProgressLight: '#FFF7ED',

  onHold: '#CA8A04',
  onHoldLight: '#FEFCE8',

  resolved: '#16A34A',
  resolvedLight: '#F0FDF4',

  cancelled: '#DC2626',
  cancelledLight: '#FEF2F2',

  low: '#16A34A',
  lowLight: '#F0FDF4',

  medium: '#2563EB',
  mediumLight: '#EFF6FF',

  high: '#EA580C',
  highLight: '#FFF7ED',

  emergency: '#DC2626',
  emergencyLight: '#FEF2F2',

  text: '#0F172A',
  secondary: '#64748B',
  border: '#E2E8F0',
  background: '#F8FAFC',
};

const MaintenanceReportPage = () => {
  const [report, setReport] = useState<MaintenanceReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadReport = async () => {
      try {
        setLoading(true);
        setError('');

        const data = await dashboardApi.getMaintenanceReport();
        setReport(data);
      } catch (err) {
        console.error('Failed to load maintenance report:', err);
        setError('Failed to load maintenance report.');
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, []);

  const SummaryCard = ({
    icon,
    label,
    value,
    color,
    lightColor,
  }: {
    icon: React.ReactNode;
    label: string;
    value: number;
    color: string;
    lightColor: string;
  }) => (
    <Paper
      elevation={0}
      sx={{
        position: 'relative',
        height: '100%',
        border: `1px solid ${COLORS.border}`,
        borderRadius: 3,
        overflow: 'hidden',
        backgroundColor: '#fff',
        transition: 'all 0.2s ease',

        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 10px 25px rgba(15, 23, 42, 0.08)',
          borderColor: color,
        },

        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          backgroundColor: color,
        },
      }}
    >
      <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Box
          sx={{
            width: 46,
            height: 46,
            borderRadius: 2.5,
            display: 'grid',
            placeItems: 'center',
            backgroundColor: lightColor,
            color,
            mb: 2.25,
          }}
        >
          {icon}
        </Box>

        <Typography
          variant="body2"
          sx={{
            color: COLORS.secondary,
            fontWeight: 500,
          }}
        >
          {label}
        </Typography>

        <Typography
          variant="h4"
          sx={{
            mt: 0.75,
            fontWeight: 750,
            color: COLORS.text,
            fontSize: {
              xs: '1.75rem',
              sm: '2rem',
            },
            lineHeight: 1.2,
          }}
        >
          {value}
        </Typography>
      </Box>
    </Paper>
  );

  const ChartTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{
      name: string;
      value: number;
      color?: string;
    }>;
  }) => {
    if (!active || !payload || payload.length === 0) {
      return null;
    }

    return (
      <Paper
        elevation={0}
        sx={{
          minWidth: 160,
          px: 1.75,
          py: 1.5,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 2,
          backgroundColor: '#fff',
          boxShadow: '0 10px 30px rgba(15, 23, 42, 0.12)',
        }}
      >
        {payload.map((item) => (
          <Box
            key={item.name}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              '& + &': {
                mt: 0.75,
              },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: item.color,
                  flexShrink: 0,
                }}
              />

              <Typography
                variant="body2"
                sx={{
                  color: COLORS.secondary,
                  fontWeight: 500,
                }}
              >
                {item.name}
              </Typography>
            </Box>

            <Typography
              variant="body2"
              sx={{
                color: COLORS.text,
                fontWeight: 700,
              }}
            >
              {item.value}
            </Typography>
          </Box>
        ))}
      </Paper>
    );
  };

  const SectionHeader = ({
    icon,
    title,
    description,
    color,
    lightColor,
  }: {
    icon: React.ReactNode;
    title: string;
    description: string;
    color: string;
    lightColor: string;
  }) => (
    <Box
      sx={{
        px: { xs: 2, sm: 3 },
        py: 2,
        backgroundColor: '#fff',
        borderBottom: `1px solid ${COLORS.border}`,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
        }}
      >
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: 2,
            display: 'grid',
            placeItems: 'center',
            backgroundColor: lightColor,
            color,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              color: COLORS.text,
            }}
          >
            {title}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              mt: 0.25,
              color: COLORS.secondary,
            }}
          >
            {description}
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        width: '100%',
        minWidth: 0,
        minHeight: '100%',
        backgroundColor: COLORS.background,
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 2.5, md: 4 },
      }}
    >
      {/* Header */}
      <Box sx={{ mb: { xs: 3, md: 4 } }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.75,
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              flexShrink: 0,
              borderRadius: 2.5,
              display: 'grid',
              placeItems: 'center',
              color: '#fff',
              background:
                'linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)',
              boxShadow: '0 8px 18px rgba(37, 99, 235, 0.2)',
            }}
          >
            <BuildOutlinedIcon />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 750,
                color: COLORS.text,
                fontSize: {
                  xs: '1.5rem',
                  sm: '1.8rem',
                  md: '2rem',
                },
                lineHeight: 1.2,
              }}
            >
              Maintenance Report
            </Typography>

            <Typography
              variant="body2"
              sx={{
                mt: 0.5,
                color: COLORS.secondary,
              }}
            >
              Overview of maintenance requests by status and priority.
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Loading */}
      {loading && (
        <Box
          sx={{
            minHeight: 320,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {/* Error */}
      {error && !loading && (
        <Alert
          severity="error"
          sx={{
            borderRadius: 2.5,
            border: `1px solid ${COLORS.border}`,
          }}
        >
          {error}
        </Alert>
      )}

      {report && !loading && !error && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
          }}
        >
          {/* Request Status */}
          <Paper
            elevation={0}
            sx={{
              border: `1px solid ${COLORS.border}`,
              borderRadius: 3,
              overflow: 'hidden',
              backgroundColor: '#fff',
            }}
          >
            <SectionHeader
              icon={<AssignmentOutlinedIcon fontSize="small" />}
              title="Request Status"
              description="Current maintenance workload across all properties."
              color={COLORS.primary}
              lightColor={COLORS.primaryLight}
            />

            <Box
              sx={{
                p: { xs: 2, sm: 3 },
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, minmax(0, 1fr))',
                  lg: 'repeat(4, minmax(0, 1fr))',
                },
                gap: 2.5,
              }}
            >
              <SummaryCard
                icon={<AssignmentOutlinedIcon />}
                label="Total Requests"
                value={report.totalRequests}
                color={COLORS.primary}
                lightColor={COLORS.primaryLight}
              />

              <SummaryCard
                icon={<OpenInNewOutlinedIcon />}
                label="Open"
                value={report.openRequests}
                color={COLORS.open}
                lightColor={COLORS.openLight}
              />

              <SummaryCard
                icon={<EngineeringOutlinedIcon />}
                label="Assigned"
                value={report.assignedRequests}
                color={COLORS.assigned}
                lightColor={COLORS.assignedLight}
              />

              <SummaryCard
                icon={<BuildOutlinedIcon />}
                label="In Progress"
                value={report.inProgressRequests}
                color={COLORS.inProgress}
                lightColor={COLORS.inProgressLight}
              />

              <SummaryCard
                icon={<PauseCircleOutlineOutlinedIcon />}
                label="On Hold"
                value={report.onHoldRequests}
                color={COLORS.onHold}
                lightColor={COLORS.onHoldLight}
              />

              <SummaryCard
                icon={<CheckCircleOutlineOutlinedIcon />}
                label="Resolved"
                value={report.resolvedRequests}
                color={COLORS.resolved}
                lightColor={COLORS.resolvedLight}
              />

              <SummaryCard
                icon={<CancelOutlinedIcon />}
                label="Cancelled"
                value={report.cancelledRequests}
                color={COLORS.cancelled}
                lightColor={COLORS.cancelledLight}
              />
            </Box>
          </Paper>

          {/* Status Chart */}
          <Paper
            elevation={0}
            sx={{
              border: `1px solid ${COLORS.border}`,
              borderRadius: 3,
              overflow: 'hidden',
              backgroundColor: '#fff',
            }}
          >
            <SectionHeader
              icon={<BuildOutlinedIcon fontSize="small" />}
              title="Requests by Status"
              description="Distribution of maintenance requests across their current statuses."
              color={COLORS.inProgress}
              lightColor={COLORS.inProgressLight}
            />

            <Box
              sx={{
                width: '100%',
                height: { xs: 380, sm: 430 },
                p: { xs: 1, sm: 2.5 },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    {
                      name: 'Maintenance',
                      open: report.openRequests,
                      assigned: report.assignedRequests,
                      inProgress: report.inProgressRequests,
                      onHold: report.onHoldRequests,
                      resolved: report.resolvedRequests,
                      cancelled: report.cancelledRequests,
                    },
                  ]}
                  margin={{
                    top: 20,
                    right: 20,
                    left: 0,
                    bottom: 20,
                  }}
                  barGap={8}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="name"
                    tick={{
                      fill: COLORS.secondary,
                      fontSize: 12,
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    allowDecimals={false}
                    tick={{
                      fill: COLORS.secondary,
                      fontSize: 12,
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    content={<ChartTooltip />}
                  />

                  <Legend
                    iconType="circle"
                    iconSize={9}
                    wrapperStyle={{
                      paddingTop: '12px',
                    }}
                  />

                  <Bar
                    dataKey="open"
                    name="Open"
                    fill={COLORS.open}
                    radius={[6, 6, 0, 0]}
                  />

                  <Bar
                    dataKey="assigned"
                    name="Assigned"
                    fill={COLORS.assigned}
                    radius={[6, 6, 0, 0]}
                  />

                  <Bar
                    dataKey="inProgress"
                    name="In Progress"
                    fill={COLORS.inProgress}
                    radius={[6, 6, 0, 0]}
                  />

                  <Bar
                    dataKey="onHold"
                    name="On Hold"
                    fill={COLORS.onHold}
                    radius={[6, 6, 0, 0]}
                  />

                  <Bar
                    dataKey="resolved"
                    name="Resolved"
                    fill={COLORS.resolved}
                    radius={[6, 6, 0, 0]}
                  />

                  <Bar
                    dataKey="cancelled"
                    name="Cancelled"
                    fill={COLORS.cancelled}
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>

          {/* Priority */}
          <Paper
            elevation={0}
            sx={{
              border: `1px solid ${COLORS.border}`,
              borderRadius: 3,
              overflow: 'hidden',
              backgroundColor: '#fff',
            }}
          >
            <SectionHeader
              icon={<PriorityHighOutlinedIcon fontSize="small" />}
              title="Request Priority"
              description="Maintenance requests grouped by priority level."
              color={COLORS.emergency}
              lightColor={COLORS.emergencyLight}
            />

            <Box
              sx={{
                p: { xs: 2, sm: 3 },
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, minmax(0, 1fr))',
                  lg: 'repeat(4, minmax(0, 1fr))',
                },
                gap: 2.5,
              }}
            >
              <SummaryCard
                icon={<LowPriorityOutlinedIcon />}
                label="Low Priority"
                value={report.lowPriorityRequests}
                color={COLORS.low}
                lightColor={COLORS.lowLight}
              />

              <SummaryCard
                icon={<AssignmentOutlinedIcon />}
                label="Medium Priority"
                value={report.mediumPriorityRequests}
                color={COLORS.medium}
                lightColor={COLORS.mediumLight}
              />

              <SummaryCard
                icon={<PriorityHighOutlinedIcon />}
                label="High Priority"
                value={report.highPriorityRequests}
                color={COLORS.high}
                lightColor={COLORS.highLight}
              />

              <SummaryCard
                icon={<PriorityHighOutlinedIcon />}
                label="Emergency"
                value={report.emergencyRequests}
                color={COLORS.emergency}
                lightColor={COLORS.emergencyLight}
              />
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default MaintenanceReportPage;