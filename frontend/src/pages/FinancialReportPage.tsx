import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
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

import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined';

import {
  dashboardApi,
  type DashboardSummary,
  type FinancialReport,
} from '../api/dashboard';

import { propertiesApi } from '../api/properties';
import type { Property } from '../types';

const FinancialReportPage = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(
    null
  );
  const [financialReport, setFinancialReport] =
    useState<FinancialReport | null>(null);

  const [loading, setLoading] = useState(true);
  const [propertiesLoading, setPropertiesLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSummary = async () => {
      try {
        setLoading(true);
        setError('');

        const data = await dashboardApi.getSummary();
        setSummary(data);
      } catch (err) {
        console.error('Failed to load financial summary:', err);
        setError('Failed to load financial report.');
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, []);

  useEffect(() => {
    const loadProperties = async () => {
      try {
        setPropertiesLoading(true);

        const data = await propertiesApi.getAll();
        setProperties(data);
      } catch (err) {
        console.error('Failed to load properties:', err);
      } finally {
        setPropertiesLoading(false);
      }
    };

    loadProperties();
  }, []);

  useEffect(() => {
    if (selectedPropertyId === null) {
      setFinancialReport(null);
      return;
    }

    const loadFinancialReport = async () => {
      try {
        setReportLoading(true);

        const data = await dashboardApi.getFinancialReport(
          selectedPropertyId
        );

        setFinancialReport(data);
      } catch (err) {
        console.error(
          'Failed to load property financial report:',
          err
        );

        setFinancialReport(null);
      } finally {
        setReportLoading(false);
      }
    };

    loadFinancialReport();
  }, [selectedPropertyId]);

  const formatAmount = (amount: number) =>
    amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const SummaryCard = ({
    title,
    value,
    icon,
    description,
    color,
    lightColor,
  }: {
    title: string;
    value: number;
    icon: React.ReactNode;
    description: string;
    color: string;
    lightColor: string;
  }) => (
    <Paper
      elevation={0}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
        border: '1px solid #E2E8F0',
        borderRadius: 3,
        p: { xs: 2.5, sm: 3 },
        background: '#FFFFFF',
        transition: 'all 0.25s ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 12px 28px rgba(15, 23, 42, 0.08)',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: 4,
          background: color,
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="body2"
            sx={{
              color: '#64748B',
              fontWeight: 600,
              fontSize: '0.82rem',
            }}
          >
            {title}
          </Typography>

          <Typography
            sx={{
              mt: 1,
              color: '#0F172A',
              fontWeight: 800,
              fontSize: {
                xs: '1.35rem',
                sm: '1.55rem',
              },
              lineHeight: 1.2,
              wordBreak: 'break-word',
            }}
          >
            {formatAmount(value)}
          </Typography>

          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mt: 1,
              color: '#94A3B8',
            }}
          >
            {description}
          </Typography>
        </Box>

        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2.5,
            display: 'grid',
            placeItems: 'center',
            background: lightColor,
            color,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
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
          minWidth: 180,
          p: 1.75,
          borderRadius: 2.5,
          border: '1px solid #E2E8F0',
          boxShadow: '0 12px 30px rgba(15, 23, 42, 0.12)',
          background: '#FFFFFF',
        }}
      >
        <Typography
          sx={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#64748B',
            mb: 1,
          }}
        >
          Financial Summary
        </Typography>

        {payload.map((item) => (
          <Box
            key={item.name}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              mb: 0.75,
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
                  background: item.color,
                }}
              />

              <Typography
                sx={{
                  fontSize: '0.78rem',
                  color: '#475569',
                }}
              >
                {item.name}
              </Typography>
            </Box>

            <Typography
              sx={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#0F172A',
              }}
            >
              {formatAmount(item.value)}
            </Typography>
          </Box>
        ))}
      </Paper>
    );
  };

  const PropertyCard = ({
    title,
    value,
    icon,
    color,
    background,
    isProperty = false,
  }: {
    title: string;
    value: string;
    icon: React.ReactNode;
    color: string;
    background: string;
    isProperty?: boolean;
  }) => (
    <Paper
      elevation={0}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        p: 2.5,
        borderRadius: 2.5,
        border: '1px solid #E2E8F0',
        background: '#FFFFFF',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 22px rgba(15, 23, 42, 0.07)',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          mb: 1.5,
        }}
      >
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: 2,
            display: 'grid',
            placeItems: 'center',
            background,
            color,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>

        <Typography
          variant="body2"
          sx={{
            color: '#64748B',
            fontWeight: 600,
          }}
        >
          {title}
        </Typography>
      </Box>

      <Typography
        sx={{
          color: '#0F172A',
          fontWeight: 800,
          fontSize: isProperty ? '1.05rem' : '1.15rem',
          wordBreak: 'break-word',
        }}
      >
        {value}
      </Typography>

      <Box
        sx={{
          position: 'absolute',
          right: -18,
          bottom: -18,
          width: 70,
          height: 70,
          borderRadius: '50%',
          background,
          opacity: 0.45,
        }}
      />
    </Paper>
  );

  return (
    <Box
      sx={{
        width: '100%',
        minWidth: 0,
        minHeight: '100%',
        background: '#F8FAFC',
        p: { xs: 2, sm: 3, md: 4 },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          mb: 3.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 50,
            height: 50,
            borderRadius: 2.5,
            display: 'grid',
            placeItems: 'center',
            color: '#FFFFFF',
            background:
              'linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)',
            boxShadow: '0 8px 20px rgba(37, 99, 235, 0.22)',
            flexShrink: 0,
          }}
        >
          <AccountBalanceOutlinedIcon />
        </Box>

        <Box>
          <Typography
            component="h1"
            sx={{
              color: '#0F172A',
              fontWeight: 800,
              fontSize: {
                xs: '1.45rem',
                sm: '1.8rem',
              },
              lineHeight: 1.2,
            }}
          >
            Financial Report
          </Typography>

          <Typography
            variant="body2"
            sx={{
              mt: 0.5,
              color: '#64748B',
            }}
          >
            Overview of payment income, expenses, and net income.
          </Typography>
        </Box>
      </Box>

      {/* Loading */}
      {loading && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            py: 12,
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {/* Error */}
      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            borderRadius: 2.5,
          }}
        >
          {error}
        </Alert>
      )}

      {/* Content */}
      {summary && !loading && !error && (
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
                sx={{
                  color: '#0F172A',
                  fontWeight: 750,
                  fontSize: '1.1rem',
                }}
              >
                Financial Overview
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  mt: 0.35,
                  color: '#64748B',
                }}
              >
                Financial performance across all properties.
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, minmax(0, 1fr))',
                  lg: 'repeat(3, minmax(0, 1fr))',
                },
                gap: 2.5,
              }}
            >
              <SummaryCard
                title="Total Payment Income"
                value={summary.totalPaymentIncome}
                description="Total income received"
                icon={<PaymentsOutlinedIcon />}
                color="#16A34A"
                lightColor="rgba(22, 163, 74, 0.10)"
              />

              <SummaryCard
                title="Total Expenses"
                value={summary.totalExpenses}
                description="Total recorded expenses"
                icon={<ReceiptLongOutlinedIcon />}
                color="#EA580C"
                lightColor="rgba(234, 88, 12, 0.10)"
              />

              <SummaryCard
                title="Net Income"
                value={summary.netIncome}
                description="Income after expenses"
                icon={<TrendingUpOutlinedIcon />}
                color="#2563EB"
                lightColor="rgba(37, 99, 235, 0.10)"
              />
            </Box>
          </Box>

          {/* Chart */}
          <Paper
            elevation={0}
            sx={{
              border: '1px solid #E2E8F0',
              borderRadius: 3,
              overflow: 'hidden',
              background: '#FFFFFF',
            }}
          >
            <Box
              sx={{
                px: { xs: 2.5, sm: 3 },
                py: 2.25,
                borderBottom: '1px solid #E2E8F0',
                background:
                  'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
              }}
            >
              <Typography
                sx={{
                  color: '#0F172A',
                  fontWeight: 700,
                  fontSize: '1rem',
                }}
              >
                Income vs Expenses
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  mt: 0.4,
                  color: '#64748B',
                }}
              >
                Compare total income with recorded expenses.
              </Typography>
            </Box>

            <Box sx={{ p: { xs: 1.5, sm: 3 } }}>
              <Box
                sx={{
                  width: '100%',
                  height: { xs: 300, sm: 370 },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      {
                        name: 'Financial Summary',
                        income: summary.totalPaymentIncome,
                        expenses: summary.totalExpenses,
                      },
                    ]}
                    margin={{
                      top: 20,
                      right: 15,
                      left: 5,
                      bottom: 10,
                    }}
                    barCategoryGap="30%"
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#E2E8F0"
                    />

                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: '#64748B',
                        fontSize: 12,
                      }}
                    />

                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: '#94A3B8',
                        fontSize: 11,
                      }}
                      tickFormatter={(value) =>
                        Number(value).toLocaleString()
                      }
                    />

                    <Tooltip
                      content={<ChartTooltip />}
                      cursor={{
                        fill: 'rgba(37, 99, 235, 0.04)',
                      }}
                    />

                    <Legend
                      verticalAlign="top"
                      align="right"
                      height={35}
                      iconType="circle"
                      wrapperStyle={{
                        fontSize: '12px',
                        color: '#64748B',
                      }}
                    />

                    <Bar
                      dataKey="income"
                      name="Income"
                      fill="#16A34A"
                      radius={[8, 8, 2, 2]}
                      maxBarSize={90}
                    />

                    <Bar
                      dataKey="expenses"
                      name="Expenses"
                      fill="#EA580C"
                      radius={[8, 8, 2, 2]}
                      maxBarSize={90}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          </Paper>

          {/* Property Financial Report */}
          <Paper
            elevation={0}
            sx={{
              border: '1px solid #E2E8F0',
              borderRadius: 3,
              overflow: 'hidden',
              background: '#FFFFFF',
            }}
          >
            <Box
              sx={{
                px: { xs: 2.5, sm: 3 },
                py: 2.25,
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                background:
                  'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  display: 'grid',
                  placeItems: 'center',
                  color: '#7C3AED',
                  background: 'rgba(124, 58, 237, 0.10)',
                }}
              >
                <HomeWorkOutlinedIcon />
              </Box>

              <Box>
                <Typography
                  sx={{
                    color: '#0F172A',
                    fontWeight: 700,
                    fontSize: '1rem',
                  }}
                >
                  Property Financial Report
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    mt: 0.35,
                    color: '#64748B',
                  }}
                >
                  View financial information for a specific property.
                </Typography>
              </Box>
            </Box>

            <Box sx={{ p: { xs: 2, sm: 3 } }}>
              <FormControl
                fullWidth
                disabled={propertiesLoading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2.5,
                    background: '#FFFFFF',
                    '&:hover fieldset': {
                      borderColor: '#2563EB',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#2563EB',
                      borderWidth: 2,
                    },
                  },
                }}
              >
                <InputLabel id="property-select-label">
                  Select Property
                </InputLabel>

                <Select
                  labelId="property-select-label"
                  value={selectedPropertyId ?? ''}
                  label="Select Property"
                  onChange={(event) => {
                    const value = event.target.value;

                    setSelectedPropertyId(
                      typeof value === 'number' ? value : Number(value)
                    );
                  }}
                >
                  <MenuItem value="">
                    <em>Select a property</em>
                  </MenuItem>

                  {properties.map((property) => (
                    <MenuItem key={property.id} value={property.id}>
                      {property.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {reportLoading && (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    py: 8,
                  }}
                >
                  <CircularProgress size={30} />
                </Box>
              )}

              {financialReport && !reportLoading && (
                <Box sx={{ mt: 3 }}>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'repeat(2, minmax(0, 1fr))',
                        lg: 'repeat(4, minmax(0, 1fr))',
                      },
                      gap: 2,
                    }}
                  >
                    <PropertyCard
                      title="Property"
                      value={financialReport.propertyName}
                      icon={<HomeWorkOutlinedIcon fontSize="small" />}
                      color="#7C3AED"
                      background="rgba(124, 58, 237, 0.10)"
                      isProperty
                    />

                    <PropertyCard
                      title="Payment Income"
                      value={formatAmount(
                        financialReport.totalPaymentIncome
                      )}
                      icon={<PaymentsOutlinedIcon fontSize="small" />}
                      color="#16A34A"
                      background="rgba(22, 163, 74, 0.10)"
                    />

                    <PropertyCard
                      title="Expenses"
                      value={formatAmount(
                        financialReport.totalExpenses
                      )}
                      icon={<ReceiptLongOutlinedIcon fontSize="small" />}
                      color="#EA580C"
                      background="rgba(234, 88, 12, 0.10)"
                    />

                    <PropertyCard
                      title="Net Income"
                      value={formatAmount(financialReport.netIncome)}
                      icon={<TrendingUpOutlinedIcon fontSize="small" />}
                      color="#2563EB"
                      background="rgba(37, 99, 235, 0.10)"
                    />
                  </Box>
                </Box>
              )}

              {!financialReport &&
                !reportLoading &&
                selectedPropertyId === null && (
                  <Box
                    sx={{
                      textAlign: 'center',
                      py: { xs: 6, sm: 8 },
                      px: 2,
                    }}
                  >
                    <Box
                      sx={{
                        width: 72,
                        height: 72,
                        mx: 'auto',
                        mb: 2,
                        borderRadius: '50%',
                        display: 'grid',
                        placeItems: 'center',
                        background:
                          'linear-gradient(135deg, rgba(37, 99, 235, 0.10), rgba(124, 58, 237, 0.10))',
                        color: '#2563EB',
                      }}
                    >
                      <HomeWorkOutlinedIcon sx={{ fontSize: 34 }} />
                    </Box>

                    <Typography
                      sx={{
                        color: '#0F172A',
                        fontWeight: 700,
                      }}
                    >
                      Select a property
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        mt: 0.6,
                        color: '#64748B',
                      }}
                    >
                      Choose a property above to view its financial
                      report.
                    </Typography>
                  </Box>
                )}
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default FinancialReportPage;