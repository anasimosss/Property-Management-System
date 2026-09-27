import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PaymentsIcon from '@mui/icons-material/Payments';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import EventIcon from '@mui/icons-material/Event';
import PaymentIcon from '@mui/icons-material/Payment';
import SearchIcon from '@mui/icons-material/Search';
import { paymentsApi } from '../api/payments';
import type { RentPaymentPeriodResponse } from '../api/payments';
import { useAuth } from '../context/AuthContext';
import type { Payment } from '../types';

const PaymentsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const isTenant = user?.role === 'Tenant';

  const canCreate =
    user?.role === 'Admin' ||
    user?.role === 'PropertyManager';

  const [payments, setPayments] = useState<Payment[]>([]);

  const [myRent, setMyRent] = useState<
    Awaited<ReturnType<typeof paymentsApi.getMyRent>> | null
  >(null);

  const [rentPeriods, setRentPeriods] = useState<
    RentPaymentPeriodResponse[]
  >([]);

  const [selectedPeriods, setSelectedPeriods] = useState<
    Record<string, number>
  >({});

  const [loading, setLoading] = useState(true);
  const [periodsLoading, setPeriodsLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        setError('');

        if (isTenant) {
          const rent = await paymentsApi.getMyRent();

          setMyRent(rent);

          /*
           * Load payment history for the tenant's
           * active lease.
           */
          const history =
            await paymentsApi.getByLease(rent.leaseId);

          setPayments(history);

          setPeriodsLoading(true);

          try {
            const periods =
              await paymentsApi.getRentPaymentPeriods(6);

            setRentPeriods(periods);
          } finally {
            setPeriodsLoading(false);
          }
        } else {
          const data = await paymentsApi.getAll();

          setPayments(data);
        }
      } catch (err: any) {
        if (err.response?.status === 401) {
          setError(
            'Authentication required. Please log in again.'
          );
        } else if (
          err.response?.status === 404 &&
          isTenant
        ) {
          setError(
            'No active lease was found for this tenant.'
          );
        } else {
          setError(
            err.response?.data?.message ||
            err.message ||
            'Failed to load payments.'
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [isTenant]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatPaymentChannel = (channel: string) => {
    switch (channel) {
      case 'BerhanBank':
        return 'Berhan Bank';

      case 'CommercialBankOfEthiopia':
        return 'Commercial Bank of Ethiopia';

      case 'Telebirr':
        return 'Telebirr';

      case 'Chapa':
        return 'Chapa';

      case 'None':
      case '':
        return '—';

      default:
        return channel;
    }
  };

  const handlePayWithChapa = async () => {
    if (!myRent) {
      return;
    }

    try {
      setPaying(true);
      setError('');

      const chapaPayment =
        await paymentsApi.initializeChapaPayment({
          leaseId: myRent.leaseId,
          amount: myRent.remainingAmount,
          dueDate: myRent.dueDate,
          paymentType: 'Rent',
        });

      window.location.href = chapaPayment.checkoutUrl;
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to initialize Chapa payment.'
      );

      setPaying(false);
    }
  };

  const handlePeriodSelection = (
    dueDate: string,
    remainingAmount: number
  ) => {
    setSelectedPeriods((current) => {
      const next = { ...current };

      if (next[dueDate] !== undefined) {
        delete next[dueDate];
      } else {
        next[dueDate] = remainingAmount;
      }

      return next;
    });
  };

  const handlePeriodAmountChange = (
    dueDate: string,
    value: string,
    maximum: number
  ) => {
    if (value === '') {
      setSelectedPeriods((current) => ({
        ...current,
        [dueDate]: 0,
      }));

      return;
    }

    const parsedValue = Number(value);

    if (!Number.isFinite(parsedValue)) {
      return;
    }

    const clampedValue = Math.min(
      Math.max(parsedValue, 0),
      maximum
    );

    setSelectedPeriods((current) => ({
      ...current,
      [dueDate]: clampedValue,
    }));
  };

  const selectedPeriodEntries = useMemo(() => {
    return rentPeriods.filter(
      (period) =>
        selectedPeriods[period.dueDate] !== undefined
    );
  }, [rentPeriods, selectedPeriods]);

  const advancePaymentTotal = useMemo(() => {
    return selectedPeriodEntries.reduce(
      (total, period) =>
        total + (selectedPeriods[period.dueDate] || 0),
      0
    );
  }, [selectedPeriodEntries, selectedPeriods]);

  const handleAdvancePayment = async () => {
    if (selectedPeriodEntries.length === 0) {
      setError(
        'Please select at least one rent period.'
      );
      return;
    }

    if (advancePaymentTotal <= 0) {
      setError(
        'Payment amount must be greater than 0.'
      );
      return;
    }

    if (!myRent) {
      setError(
        'Active rent information could not be found.'
      );
      return;
    }

    try {
      setLoading(true);
      setError('');

      const firstSelectedPeriod =
        selectedPeriodEntries[0];

      const result =
        await paymentsApi.initializeChapaPayment({
          leaseId: myRent.leaseId,
          amount: advancePaymentTotal,
          dueDate: firstSelectedPeriod.dueDate,
          paymentType: 'Rent',
          rentPeriods: selectedPeriodEntries.map(
            (period) => ({
              dueDate: period.dueDate,
              amount:
                selectedPeriods[period.dueDate] || 0,
            })
          ),
        });

      window.location.href = result.checkoutUrl;
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Failed to initialize Chapa payment.'
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return payments;
    }

    return payments.filter((payment) =>
      [
        payment.tenantName,
        payment.unitNumber,
        payment.paymentType,
        payment.paymentMethod,
        payment.paymentChannel,
        formatPaymentChannel(
          payment.paymentChannel
        ),
        payment.status,
        payment.referenceNumber ?? '',
        payment.chapaTransactionReference ?? '',
      ]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }, [payments, search]);

  const totalAmount = useMemo(
    () =>
      payments.reduce(
        (total, payment) =>
          total + payment.amount,
        0
      ),
    [payments]
  );

  const completedPayments = useMemo(
    () =>
      payments.filter(
        (payment) =>
          payment.status.toLowerCase() ===
          'completed' ||
          payment.status.toLowerCase() === 'paid'
      ),
    [payments]
  );

  const pendingPayments = useMemo(
    () =>
      payments.filter(
        (payment) =>
          payment.status.toLowerCase() ===
          'pending'
      ),
    [payments]
  );

  const currentMonthAmount = useMemo(() => {
    const now = new Date();

    const currentMonth =
      now.getMonth();

    const currentYear =
      now.getFullYear();

    return payments
      .filter((payment) => {
        const paymentDate =
          new Date(payment.paymentDate);

        return (
          paymentDate.getMonth() ===
          currentMonth &&
          paymentDate.getFullYear() ===
          currentYear
        );
      })
      .reduce(
        (total, payment) =>
          total + payment.amount,
        0
      );
  }, [payments]);

  const getRentStatus = () => {
    if (!myRent) {
      return {
        label: 'Payment Due',
        color: 'info' as const,
      };
    }

    if (myRent.remainingAmount <= 0) {
      return {
        label: 'Paid',
        color: 'success' as const,
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDate = new Date(myRent.dueDate);
    dueDate.setHours(0, 0, 0, 0);

    if (
      myRent.paidAmount > 0 &&
      myRent.remainingAmount > 0
    ) {
      if (dueDate < today) {
        return {
          label: 'Overdue',
          color: 'error' as const,
        };
      }

      return {
        label: 'Partially Paid',
        color: 'warning' as const,
      };
    }

    if (dueDate < today) {
      return {
        label: 'Overdue',
        color: 'error' as const,
      };
    }

    return {
      label: 'Payment Due',
      color: 'info' as const,
    };
  };

  const getStatusColor = (
    status: string
  ): 'success' | 'warning' | 'error' | 'default' => {
    const normalizedStatus =
      status.toLowerCase();

    if (
      normalizedStatus === 'completed' ||
      normalizedStatus === 'paid'
    ) {
      return 'success';
    }

    if (normalizedStatus === 'pending') {
      return 'warning';
    }

    if (
      normalizedStatus === 'failed' ||
      normalizedStatus === 'cancelled'
    ) {
      return 'error';
    }

    return 'default';
  };

  const statCards = [
    {
      title: 'Total Payments',
      value: payments.length.toString(),
      subtitle: 'All recorded payments',
      icon: <PaymentsIcon />,
    },
    {
      title: 'Total Collected',
      value: `${formatAmount(
        totalAmount
      )} ETB`,
      subtitle: `${completedPayments.length} completed payments`,
      icon: <AccountBalanceWalletIcon />,
    },
    {
      title: 'Pending Payments',
      value:
        pendingPayments.length.toString(),
      subtitle: 'Awaiting completion',
      icon: <PendingActionsIcon />,
    },
    {
      title: 'This Month',
      value: `${formatAmount(
        currentMonthAmount
      )} ETB`,
      subtitle:
        'Payments recorded this month',
      icon: <CalendarMonthIcon />,
    },
  ];

  if (loading) {
    return (
      <Box
        sx={{
          width: '100%',
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  /*
   * ============================================================
   * TENANT VIEW
   * ============================================================
   */

  if (isTenant) {
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
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: '#1e293b',
              mb: 0.5,
            }}
          >
            My Rent
          </Typography>

          <Typography
            variant="body2"
            sx={{ color: '#64748b' }}
          >
            View your current rent and make
            your monthly payment.
          </Typography>
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3 }}
          >
            {error}
          </Alert>
        )}

        {myRent && (
          <>
            {/* Rent Overview */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(3, minmax(0, 1fr))',
                },
                gap: 2,
                mb: 3,
              }}
            >
              {/* Unit */}
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  border:
                    '1px solid #e2e8f0',
                  borderRadius: 3,
                  bgcolor: '#fff',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
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
                      bgcolor:
                        'rgba(59, 130, 246, 0.1)',
                      color: '#3b82f6',
                    }}
                  >
                    <HomeWorkIcon />
                  </Box>

                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#64748b',
                        mb: 0.5,
                      }}
                    >
                      My Unit
                    </Typography>

                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: '#1e293b',
                      }}
                    >
                      {myRent.unitNumber}
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Rent Amount */}
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  border:
                    '1px solid #e2e8f0',
                  borderRadius: 3,
                  bgcolor: '#fff',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
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
                      bgcolor:
                        'rgba(16, 185, 129, 0.1)',
                      color: '#10b981',
                    }}
                  >
                    <AccountBalanceWalletIcon />
                  </Box>

                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#64748b',
                        mb: 0.5,
                      }}
                    >
                      Monthly Rent
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Paid:{' '}
                      {myRent.paidAmount.toLocaleString()}{' '}
                      ETB
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Remaining:{' '}
                      {myRent.remainingAmount.toLocaleString()}{' '}
                      ETB
                    </Typography>

                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: '#1e293b',
                      }}
                    >
                      {formatAmount(
                        myRent.rentAmount
                      )}{' '}
                      ETB
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Due Date */}
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  border:
                    '1px solid #e2e8f0',
                  borderRadius: 3,
                  bgcolor: '#fff',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
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
                      bgcolor:
                        'rgba(245, 158, 11, 0.1)',
                      color: '#f59e0b',
                    }}
                  >
                    <EventIcon />
                  </Box>

                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#64748b',
                        mb: 0.5,
                      }}
                    >
                      Due Date
                    </Typography>

                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: '#1e293b',
                      }}
                    >
                      {formatDate(
                        myRent.dueDate
                      )}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Box>

            {/* Current Payment Card */}
            <Paper
              elevation={0}
              sx={{
                border:
                  '1px solid #e2e8f0',
                borderRadius: 3,
                overflow: 'hidden',
                bgcolor: '#fff',
                mb: 3,
              }}
            >
              <Box
                sx={{
                  p: {
                    xs: 2.5,
                    sm: 3.5,
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent:
                      'space-between',
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
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: '#1e293b',
                      }}
                    >
                      Current Rent Payment
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        color: '#64748b',
                        mt: 0.5,
                      }}
                    >
                      Payment for your current
                      rental period
                    </Typography>
                  </Box>

                  <Chip
                    label={getRentStatus().label}
                    color={getRentStatus().color}
                    sx={{
                      fontWeight: 600,
                    }}
                  />
                </Box>

                <Box
                  sx={{
                    p: 3,
                    borderRadius: 2.5,
                    bgcolor: '#f8fafc',
                    border:
                      '1px solid #e2e8f0',
                    mb: 3,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent:
                        'space-between',
                      alignItems: 'center',
                      gap: 2,
                      flexWrap: 'wrap',
                    }}
                  >
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#64748b',
                          mb: 0.5,
                        }}
                      >
                        Amount Due
                      </Typography>

                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 700,
                          color: '#1e293b',
                        }}
                      >
                        {formatAmount(
                          myRent.remainingAmount
                        )}{' '}
                        ETB
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        textAlign: {
                          xs: 'left',
                          sm: 'right',
                        },
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#64748b',
                          mb: 0.5,
                        }}
                      >
                        Due
                      </Typography>

                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 600,
                          color: '#1e293b',
                        }}
                      >
                        {formatDate(
                          myRent.dueDate
                        )}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

            {/* Pay Button */}
{getRentStatus().label !== 'Paid' && (
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    startIcon={
                      paying ? (
                        <CircularProgress
                          size={20}
                          color="inherit"
                        />
                      ) : (
                        <PaymentIcon />
                      )
                    }
                    onClick={
                      handlePayWithChapa
                    }
                    disabled={
                      paying ||
                      myRent.remainingAmount <=
                      0
                    }
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      textTransform:
                        'none',
                      fontWeight: 700,
                      fontSize: '1rem',
                      boxShadow: 'none',
                      '&:hover': {
                        boxShadow: 'none',
                      },
                    }}
                  >
                    {paying
                      ? 'Connecting to Chapa...'
                      : 'Pay with Chapa'}
                  </Button>
                )}

               {getRentStatus().label === 'Paid' && (
  <Alert severity="success">
    Your rent payment for this period has been completed successfully.
  </Alert>
)}
              </Box>
            </Paper>

            {/* =====================================================
                ADVANCE RENT PAYMENT
                ===================================================== */}
            <Paper
              elevation={0}
              sx={{
                border:
                  '1px solid #e2e8f0',
                borderRadius: 3,
                overflow: 'hidden',
                bgcolor: '#fff',
                mb: 3,
              }}
            >
              <Box
                sx={{
                  p: {
                    xs: 2.5,
                    sm: 3.5,
                  },
                }}
              >
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: '#1e293b',
                    }}
                  >
                    Pay Rent in Advance
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      color: '#64748b',
                      mt: 0.5,
                    }}
                  >
                    Select future rent periods
                    and pay them in advance.
                    You can also make a partial
                    payment for a selected month.
                  </Typography>
                </Box>

                {periodsLoading ? (
                  <Box
                    sx={{
                      py: 5,
                      display: 'flex',
                      justifyContent:
                        'center',
                    }}
                  >
                    <CircularProgress
                      size={28}
                    />
                  </Box>
                ) : rentPeriods.length ===
                  0 ? (
                  <Alert severity="info">
                    No future rent periods are
                    available for advance
                    payment.
                  </Alert>
                ) : (
                  <>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection:
                          'column',
                        gap: 1.5,
                      }}
                    >
                      {rentPeriods.map(
                        (period) => {
                          const selected =
                            selectedPeriods[
                            period.dueDate
                            ] !== undefined;

                          const selectedAmount =
                            selectedPeriods[
                            period.dueDate
                            ] ?? 0;

                          return (
                            <Paper
                              key={
                                period.dueDate
                              }
                              elevation={0}
                              sx={{
                                p: 2,
                                border: selected
                                  ? '2px solid #3b82f6'
                                  : '1px solid #e2e8f0',
                                borderRadius: 2.5,
                                bgcolor: selected
                                  ? 'rgba(59, 130, 246, 0.04)'
                                  : '#fff',
                                transition:
                                  'border-color 0.2s ease, background-color 0.2s ease',
                              }}
                            >
                              <Box
                                sx={{
                                  display:
                                    'flex',
                                  alignItems:
                                  {
                                    xs: 'flex-start',
                                    sm: 'center',
                                  },
                                  justifyContent:
                                    'space-between',
                                  gap: 2,
                                  flexWrap:
                                    'wrap',
                                }}
                              >
                                <Box
                                  sx={{
                                    display:
                                      'flex',
                                    alignItems:
                                      'center',
                                    gap: 1.5,
                                    minWidth: 0,
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={
                                      selected
                                    }
                                    onChange={() =>
                                      handlePeriodSelection(
                                        period.dueDate,
                                        period.remainingAmount
                                      )
                                    }
                                    aria-label={`Select rent period ${formatDate(
                                      period.dueDate
                                    )}`}
                                    style={{
                                      width: 20,
                                      height: 20,
                                      cursor:
                                        'pointer',
                                    }}
                                  />

                                  <Box>
                                    <Typography
                                      sx={{
                                        fontWeight:
                                          700,
                                        color:
                                          '#1e293b',
                                      }}
                                    >
                                      {formatDate(
                                        period.dueDate
                                      )}
                                    </Typography>

                                    <Typography
                                      variant="body2"
                                      sx={{
                                        color:
                                          '#64748b',
                                        mt: 0.25,
                                      }}
                                    >
                                      Rent:{' '}
                                      {formatAmount(
                                        period.rentAmount
                                      )}{' '}
                                      ETB
                                    </Typography>
                                  </Box>
                                </Box>

                                <Box
                                  sx={{
                                    display:
                                      'flex',
                                    alignItems:
                                      'center',
                                    gap: 2,
                                    flexWrap:
                                      'wrap',
                                  }}
                                >
                                  <Box>
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        display:
                                          'block',
                                        color:
                                          '#64748b',
                                        mb: 0.25,
                                      }}
                                    >
                                      Remaining
                                    </Typography>

                                    <Typography
                                      variant="body2"
                                      sx={{
                                        fontWeight:
                                          700,
                                        color:
                                          '#1e293b',
                                      }}
                                    >
                                      {formatAmount(
                                        period.remainingAmount
                                      )}{' '}
                                      ETB
                                    </Typography>
                                  </Box>

                                  {selected && (
                                    <TextField
                                      size="small"
                                      type="number"
                                      label="Pay"
                                      value={
                                        selectedAmount
                                      }
                                      onChange={(
                                        event
                                      ) =>
                                        handlePeriodAmountChange(
                                          period.dueDate,
                                          event
                                            .target
                                            .value,
                                          period.remainingAmount
                                        )
                                      }
                                      slotProps={{
                                        htmlInput: {
                                          min: 0,
                                          max: period.remainingAmount,
                                          step: 0.01,
                                        },
                                      }}
                                      sx={{
                                        width: {
                                          xs: 140,
                                          sm: 160,
                                        },
                                      }}
                                    />
                                  )}
                                </Box>
                              </Box>
                            </Paper>
                          );
                        }
                      )}
                    </Box>

                    {selectedPeriodEntries.length >
                      0 && (
                        <Box
                          sx={{
                            mt: 3,
                            p: 2.5,
                            borderRadius: 2.5,
                            bgcolor: '#f8fafc',
                            border:
                              '1px solid #e2e8f0',
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent:
                                'space-between',
                              alignItems:
                                'center',
                              gap: 2,
                              flexWrap: 'wrap',
                            }}
                          >
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{
                                  color:
                                    '#64748b',
                                }}
                              >
                                Selected rent
                                periods
                              </Typography>

                              <Typography
                                variant="h6"
                                sx={{
                                  fontWeight: 700,
                                  color:
                                    '#1e293b',
                                }}
                              >
                                {
                                  selectedPeriodEntries.length
                                }{' '}
                                month
                                {selectedPeriodEntries.length !==
                                  1
                                  ? 's'
                                  : ''}
                              </Typography>
                            </Box>

                            <Box
                              sx={{
                                textAlign: {
                                  xs: 'left',
                                  sm: 'right',
                                },
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{
                                  color:
                                    '#64748b',
                                }}
                              >
                                Advance payment
                                total
                              </Typography>

                              <Typography
                                variant="h5"
                                sx={{
                                  fontWeight: 700,
                                  color:
                                    '#1e293b',
                                }}
                              >
                                {formatAmount(
                                  advancePaymentTotal
                                )}{' '}
                                ETB
                              </Typography>
                            </Box>
                          </Box>

                          <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            startIcon={
                              <PaymentIcon />
                            }
                            onClick={
                              handleAdvancePayment
                            }
                            disabled={
                              advancePaymentTotal <=
                              0
                            }
                            sx={{
                              mt: 2.5,
                              py: 1.5,
                              borderRadius: 2,
                              textTransform:
                                'none',
                              fontWeight: 700,
                              fontSize: '1rem',
                              boxShadow: 'none',
                              '&:hover': {
                                boxShadow:
                                  'none',
                              },
                            }}
                          >
                            Continue with Chapa
                          </Button>
                        </Box>
                      )}
                  </>
                )}
              </Box>
            </Paper>

            {/* =====================================================
                TENANT PAYMENT HISTORY
                ===================================================== */}
            <Paper
              elevation={0}
              sx={{
                border:
                  '1px solid #e2e8f0',
                borderRadius: 3,
                overflow: 'hidden',
                bgcolor: '#fff',
              }}
            >
              <Box
                sx={{
                  p: {
                    xs: 2.5,
                    sm: 3.5,
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent:
                      'space-between',
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
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: '#1e293b',
                      }}
                    >
                      Payment History
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        color: '#64748b',
                        mt: 0.5,
                      }}
                    >
                      View your previous rent
                      payments and transaction
                      details.
                    </Typography>
                  </Box>

                  <Chip
                    label={`${payments.length} payment${payments.length !== 1
                      ? 's'
                      : ''
                      }`}
                    variant="outlined"
                    size="small"
                    sx={{
                      fontWeight: 600,
                    }}
                  />
                </Box>

                {payments.length === 0 ? (
                  <Box
                    sx={{
                      py: 5,
                      textAlign: 'center',
                    }}
                  >
                    <PaymentsIcon
                      sx={{
                        fontSize: 42,
                        color: '#94a3b8',
                        mb: 1,
                      }}
                    />

                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: '#1e293b',
                        mb: 1,
                      }}
                    >
                      No Payment History
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        color: '#64748b',
                      }}
                    >
                      Your payments will appear
                      here after you make a
                      payment.
                    </Typography>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      overflowX: 'auto',
                    }}
                  >
                    <Box
                      component="table"
                      sx={{
                        width: '100%',
                        minWidth: 950,
                        borderCollapse:
                          'collapse',

                        '& th': {
                          bgcolor: '#f8fafc',
                          color: '#64748b',
                          fontSize:
                            '0.75rem',
                          fontWeight: 700,
                          textTransform:
                            'uppercase',
                          letterSpacing:
                            '0.04em',
                          textAlign: 'left',
                          borderBottom:
                            '1px solid #e2e8f0',
                          px: 2,
                          py: 1.75,
                          whiteSpace:
                            'nowrap',
                        },

                        '& td': {
                          px: 2,
                          py: 1.75,
                          borderBottom:
                            '1px solid #f1f5f9',
                          color: '#334155',
                          fontSize:
                            '0.875rem',
                          whiteSpace:
                            'nowrap',
                        },

                        '& tbody tr:hover': {
                          bgcolor:
                            '#f8fafc',
                        },

                        '& tbody tr:last-child td':
                        {
                          borderBottom:
                            'none',
                        },
                      }}
                    >
                      <thead>
                        <tr>
                          <th>Rent Period</th>
                          <th>Amount</th>
                          <th>
                            Payment Date
                          </th>
                          <th>Method</th>
                          <th>Channel</th>
                          <th>Status</th>
                          <th>
                            Transaction Reference
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {[...payments]
                          .sort(
                            (a, b) =>
                              new Date(
                                b.paymentDate
                              ).getTime() -
                              new Date(
                                a.paymentDate
                              ).getTime()
                          )
                          .map((payment) => (
                            <tr
                              key={
                                payment.id
                              }
                            >
                              <td>
                                <Typography
                                  sx={{
                                    fontWeight:
                                      600,
                                    color:
                                      '#1e293b',
                                  }}
                                >
                                  {formatDate(
                                    payment.dueDate
                                  )}
                                </Typography>

                                <Typography
                                  variant="caption"
                                  sx={{
                                    color:
                                      '#94a3b8',
                                  }}
                                >
                                  Due date
                                </Typography>
                              </td>

                              <td>
                                <Typography
                                  sx={{
                                    fontWeight:
                                      700,
                                    color:
                                      '#1e293b',
                                  }}
                                >
                                  {formatAmount(
                                    payment.amount
                                  )}{' '}
                                  ETB
                                </Typography>
                              </td>

                              <td>
                                {formatDate(
                                  payment.paymentDate
                                )}
                              </td>

                              <td>
                                {
                                  payment.paymentMethod
                                }
                              </td>

                              <td>
                                <Typography
                                  sx={{
                                    fontWeight:
                                      600,
                                    color:
                                      '#334155',
                                  }}
                                >
                                  {formatPaymentChannel(
                                    payment.paymentChannel
                                  )}
                                </Typography>
                              </td>

                              <td>
                                <Chip
                                  label={
                                    payment.status
                                  }
                                  size="small"
                                  color={getStatusColor(
                                    payment.status
                                  )}
                                  sx={{
                                    fontWeight:
                                      600,
                                    textTransform:
                                      'capitalize',
                                  }}
                                />
                              </td>

                              <td>
                                <Typography
                                  sx={{
                                    fontFamily:
                                      'monospace',
                                    fontSize:
                                      '0.72rem',
                                    color:
                                      '#475569',
                                    maxWidth: 280,
                                    overflow:
                                      'hidden',
                                    textOverflow:
                                      'ellipsis',
                                  }}
                                  title={
                                    payment.chapaTransactionReference ||
                                    payment.referenceNumber ||
                                    ''
                                  }
                                >
                                  {payment.chapaTransactionReference ||
                                    payment.referenceNumber ||
                                    '—'}
                                </Typography>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </Box>
                  </Box>
                )}
              </Box>
            </Paper>
          </>
        )}
      </Box>
    );
  }

  /*
   * ============================================================
   * ADMIN / PROPERTY MANAGER VIEW
   * ============================================================
   */

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
      {/* Page Header */}
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
              fontWeight: 700,
              color: '#1e293b',
              mb: 0.5,
            }}
          >
            Payments
          </Typography>

          <Typography
            variant="body2"
            sx={{ color: '#64748b' }}
          >
            Track and manage payments recorded
            against leases.
          </Typography>
        </Box>

        {canCreate && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() =>
              navigate('/payments/create')
            }
            sx={{
              borderRadius: 2,
              px: 2.5,
              py: 1.2,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 'none',
              },
            }}
          >
            Create Payment
          </Button>
        )}
      </Box>

      {/* Error */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
      )}

      {/* Statistics */}
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
        {statCards.map((card) => (
          <Paper
            key={card.title}
            elevation={0}
            sx={{
              p: 2.5,
              border:
                '1px solid #e2e8f0',
              borderRadius: 3,
              minWidth: 0,
              bgcolor: '#fff',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent:
                  'space-between',
                alignItems: 'flex-start',
                gap: 2,
              }}
            >
              <Box
                sx={{
                  minWidth: 0,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: '#64748b',
                    mb: 1,
                  }}
                >
                  {card.title}
                </Typography>

                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: '#1e293b',
                    mb: 0.5,
                    wordBreak:
                      'break-word',
                  }}
                >
                  {card.value}
                </Typography>

                <Typography
                  variant="caption"
                  sx={{
                    color: '#94a3b8',
                  }}
                >
                  {card.subtitle}
                </Typography>
              </Box>

              <Box
                sx={{
                  width: 44,
                  height: 44,
                  flexShrink: 0,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent:
                    'center',
                  bgcolor:
                    'rgba(59, 130, 246, 0.1)',
                  color: '#3b82f6',
                }}
              >
                {card.icon}
              </Box>
            </Box>
          </Paper>
        ))}
      </Box>

      {/* Payments Table */}
      <Paper
        elevation={0}
        sx={{
          border:
            '1px solid #e2e8f0',
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        {/* Table Header */}
        <Box
          sx={{
            p: 2.5,
            display: 'flex',
            justifyContent:
              'space-between',
            alignItems: {
              xs: 'stretch',
              sm: 'center',
            },
            gap: 2,
            flexWrap: 'wrap',
            borderBottom:
              '1px solid #e2e8f0',
          }}
        >
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: '#1e293b',
              }}
            >
              Payment Records
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: '#64748b',
                mt: 0.5,
              }}
            >
              {filteredPayments.length} payment
              {filteredPayments.length !==
                1
                ? 's'
                : ''}{' '}
              found
            </Typography>
          </Box>

          {/* Search */}
          <TextField
            size="small"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search payments..."
            sx={{
              width: {
                xs: '100%',
                sm: 320,
              },
              bgcolor: '#fff',
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon
                      sx={{
                        color: '#94a3b8',
                      }}
                    />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>

        {filteredPayments.length === 0 ? (
          <Box
            sx={{
              p: 6,
              textAlign: 'center',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: '#1e293b',
                mb: 1,
              }}
            >
              {payments.length === 0
                ? 'No Payments Found'
                : 'No Matching Payments'}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: '#64748b',
              }}
            >
              {payments.length === 0
                ? 'There are no payments in the system yet.'
                : 'Try changing your search.'}
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              overflowX: 'auto',
            }}
          >
            <Box
              component="table"
              sx={{
                width: '100%',
                minWidth: 1100,
                borderCollapse:
                  'collapse',

                '& th': {
                  bgcolor: '#f8fafc',
                  color: '#64748b',
                  fontSize:
                    '0.75rem',
                  fontWeight: 700,
                  textTransform:
                    'uppercase',
                  letterSpacing:
                    '0.04em',
                  textAlign: 'left',
                  borderBottom:
                    '1px solid #e2e8f0',
                  px: 2,
                  py: 1.75,
                  whiteSpace:
                    'nowrap',
                },

                '& td': {
                  px: 2,
                  py: 1.75,
                  borderBottom:
                    '1px solid #f1f5f9',
                  color: '#334155',
                  fontSize:
                    '0.875rem',
                  whiteSpace:
                    'nowrap',
                },

                '& tbody tr:hover': {
                  bgcolor:
                    '#f8fafc',
                },

                '& tbody tr:last-child td':
                {
                  borderBottom:
                    'none',
                },
              }}
            >
              <thead>
                <tr>
                  <th>Tenant</th>
                  <th>Unit</th>
                  <th>Amount</th>
                  <th>Payment Date</th>
                  <th>Type</th>
                  <th>Method</th>
                  <th>Channel</th>
                  <th>Status</th>
                  <th>Reference</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredPayments.map(
                  (payment) => (
                    <tr
                      key={
                        payment.id
                      }
                    >
                      <td>
                        <Typography
                          sx={{
                            fontWeight:
                              600,
                            color:
                              '#1e293b',
                          }}
                        >
                          {
                            payment.tenantName
                          }
                        </Typography>
                      </td>

                      <td>
                        {
                          payment.unitNumber
                        }
                      </td>

                      <td>
                        <Typography
                          sx={{
                            fontWeight:
                              600,
                            color:
                              '#1e293b',
                          }}
                        >
                          {formatAmount(
                            payment.amount
                          )}{' '}
                          ETB
                        </Typography>
                      </td>

                      <td>
                        {formatDate(
                          payment.paymentDate
                        )}
                      </td>

                      <td>
                        {
                          payment.paymentType
                        }
                      </td>

                      <td>
                        {
                          payment.paymentMethod
                        }
                      </td>

                      <td>
                        <Typography
                          sx={{
                            fontWeight:
                              600,
                            color:
                              '#334155',
                          }}
                        >
                          {formatPaymentChannel(
                            payment.paymentChannel
                          )}
                        </Typography>
                      </td>

                      <td>
                        <Chip
                          label={
                            payment.status
                          }
                          size="small"
                          color={getStatusColor(
                            payment.status
                          )}
                          sx={{
                            fontWeight:
                              600,
                            textTransform:
                              'capitalize',
                          }}
                        />
                      </td>

                      <td>
                        <Typography
                          sx={{
                            fontFamily:
                              'monospace',
                            fontSize:
                              '0.72rem',
                            maxWidth: 220,
                            overflow:
                              'hidden',
                            textOverflow:
                              'ellipsis',
                          }}
                          title={
                            payment.chapaTransactionReference ||
                            payment.referenceNumber ||
                            ''
                          }
                        >
                          {payment.chapaTransactionReference ||
                            payment.referenceNumber ||
                            '—'}
                        </Typography>
                      </td>

                      <td>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={
                            <VisibilityIcon />
                          }
                          onClick={() =>
                            navigate(
                              `/payments/${payment.id}`
                            )
                          }
                          sx={{
                            borderRadius:
                              1.5,
                            textTransform:
                              'none',
                            fontWeight:
                              600,
                          }}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default PaymentsPage;