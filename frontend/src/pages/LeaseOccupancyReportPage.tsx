import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  Paper,
  Typography,
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import {
  dashboardApi,
  type LeaseOccupancyReport,
} from '../api/dashboard';

import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined';
import PeopleOutlineOutlinedIcon from '@mui/icons-material/PeopleOutlineOutlined';
import MeetingRoomOutlinedIcon from '@mui/icons-material/MeetingRoomOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import DonutLargeOutlinedIcon from '@mui/icons-material/DonutLargeOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';

const COLORS = {
  primary: '#2563EB',
  primaryLight: '#EFF6FF',
  green: '#16A34A',
  greenLight: '#F0FDF4',
  orange: '#EA580C',
  orangeLight: '#FFF7ED',
  purple: '#7C3AED',
  purpleLight: '#F5F3FF',
  text: '#0F172A',
  secondary: '#64748B',
  border: '#E2E8F0',
  background: '#F8FAFC',
};

const LeaseOccupancyReportPage = () => {
  const [report, setReport] = useState<LeaseOccupancyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadReport = async () => {
      try {
        setLoading(true);
        setError('');

        const data = await dashboardApi.getLeaseOccupancyReport();
        setReport(data);
      } catch (err) {
        console.error('Failed to load lease occupancy report:', err);
        setError('Failed to load lease and occupancy report.');
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
    value: string | number;
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
            fontSize: { xs: '1.75rem', sm: '2rem' },
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
          minWidth: 150,
          px: 1.75,
          py: 1.5,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 2,
          boxShadow: '0 10px 30px rgba(15, 23, 42, 0.12)',
          backgroundColor: '#fff',
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
            <DonutLargeOutlinedIcon />
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
              Lease & Occupancy Report
            </Typography>

            <Typography
              variant="body2"
              sx={{
                mt: 0.5,
                color: COLORS.secondary,
              }}
            >
              Overview of unit occupancy and active leases.
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

      {/* Report */}
      {report && !loading && !error && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
          }}
        >
          {/* Summary */}
          <Box>
            <Box sx={{ mb: 1.75 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: COLORS.text,
                }}
              >
                Occupancy Overview
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  mt: 0.35,
                  color: COLORS.secondary,
                }}
              >
                Current unit and lease statistics across all properties.
              </Typography>
            </Box>

            <Box
              sx={{
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
                icon={<HomeWorkOutlinedIcon />}
                label="Total Units"
                value={report.totalUnits}
                color={COLORS.primary}
                lightColor={COLORS.primaryLight}
              />

              <SummaryCard
                icon={<PeopleOutlineOutlinedIcon />}
                label="Occupied Units"
                value={report.occupiedUnits}
                color={COLORS.green}
                lightColor={COLORS.greenLight}
              />

              <SummaryCard
                icon={<MeetingRoomOutlinedIcon />}
                label="Vacant Units"
                value={report.vacantUnits}
                color={COLORS.orange}
                lightColor={COLORS.orangeLight}
              />

              <SummaryCard
                icon={<AssignmentOutlinedIcon />}
                label="Active Leases"
                value={report.activeLeases}
                color={COLORS.purple}
                lightColor={COLORS.purpleLight}
              />
            </Box>
          </Box>

          {/* Occupancy Rate */}
          <Paper
            elevation={0}
            sx={{
              border: `1px solid ${COLORS.border}`,
              borderRadius: 3,
              overflow: 'hidden',
              backgroundColor: '#fff',
            }}
          >
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
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    display: 'grid',
                    placeItems: 'center',
                    backgroundColor: COLORS.primaryLight,
                    color: COLORS.primary,
                  }}
                >
                  <TrendingUpOutlinedIcon fontSize="small" />
                </Box>

                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 700,
                      color: COLORS.text,
                    }}
                  >
                    Occupancy Rate
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      mt: 0.25,
                      color: COLORS.secondary,
                    }}
                  >
                    Percentage of units currently occupied.
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={{ p: { xs: 2.5, sm: 3.5 } }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  gap: 2,
                  mb: 1.5,
                }}
              >
                <Box>
                  <Typography
                    variant="h2"
                    sx={{
                      fontWeight: 800,
                      color: COLORS.primary,
                      fontSize: {
                        xs: '2.5rem',
                        sm: '3.25rem',
                      },
                      lineHeight: 1,
                    }}
                  >
                    {report.occupancyRate}%
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      mt: 1,
                      color: COLORS.secondary,
                    }}
                  >
                    Current occupancy
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: { xs: 'none', sm: 'flex' },
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: COLORS.primaryLight,
                    color: COLORS.primary,
                  }}
                >
                  <DonutLargeOutlinedIcon />
                </Box>
              </Box>

              <Box
                sx={{
                  mt: 2.5,
                  width: '100%',
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: '#E2E8F0',
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    width: `${Math.min(
                      Math.max(report.occupancyRate, 0),
                      100
                    )}%`,
                    height: '100%',
                    borderRadius: 6,
                    background:
                      'linear-gradient(90deg, #2563EB 0%, #4F46E5 100%)',
                    transition: 'width 0.5s ease',
                  }}
                />
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mt: 1,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: COLORS.secondary }}
                >
                  0% occupied
                </Typography>

                <Typography
                  variant="caption"
                  sx={{ color: COLORS.secondary }}
                >
                  100% occupied
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Occupancy Chart */}
          <Paper
            elevation={0}
            sx={{
              border: `1px solid ${COLORS.border}`,
              borderRadius: 3,
              overflow: 'hidden',
              backgroundColor: '#fff',
            }}
          >
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
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    display: 'grid',
                    placeItems: 'center',
                    backgroundColor: COLORS.purpleLight,
                    color: COLORS.purple,
                  }}
                >
                  <HomeWorkOutlinedIcon fontSize="small" />
                </Box>

                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 700,
                      color: COLORS.text,
                    }}
                  >
                    Unit Occupancy
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      mt: 0.25,
                      color: COLORS.secondary,
                    }}
                  >
                    Distribution of occupied and vacant units.
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box
              sx={{
                width: '100%',
                height: { xs: 340, sm: 400 },
                p: { xs: 1, sm: 2.5 },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      {
                        name: 'Occupied',
                        value: report.occupiedUnits,
                      },
                      {
                        name: 'Vacant',
                        value: report.vacantUnits,
                      },
                    ]}
                    cx="50%"
                    cy="45%"
                    outerRadius="68%"
                    innerRadius="42%"
                    paddingAngle={3}
                    dataKey="value"
                    stroke="#fff"
                    strokeWidth={3}
                  >
                    <Cell fill={COLORS.green} />
                    <Cell fill={COLORS.orange} />
                  </Pie>

                  <Tooltip
                    content={<ChartTooltip />}
                  />

                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={9}
                    wrapperStyle={{
                      paddingTop: '16px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default LeaseOccupancyReportPage;