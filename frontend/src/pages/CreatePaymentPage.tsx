import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PaymentsIcon from '@mui/icons-material/Payments';
import { paymentsApi } from '../api/payments';
import { leasesApi } from '../api/leases';
import { useAuth } from '../context/AuthContext';
import type { Lease } from '../types';

const CreatePaymentPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [leases, setLeases] = useState<Lease[]>([]);

  const [leaseId, setLeaseId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [paymentType, setPaymentType] = useState('Rent');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paymentChannel, setPaymentChannel] = useState('None');
  const [status, setStatus] = useState('Completed');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');

  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const canCreate =
    user?.role === 'Admin' || user?.role === 'PropertyManager';

  useEffect(() => {
    const loadLeases = async () => {
      try {
        setLoadingData(true);
        setError('');

        const data = await leasesApi.getAll();
        setLeases(data);
      } catch (err: any) {
        if (err.response?.status === 401) {
          setError('Authentication required. Please log in again.');
        } else {
          setError(
            err.response?.data?.message ||
            err.message ||
            'Failed to load leases.'
          );
        }
      } finally {
        setLoadingData(false);
      }
    };

    loadLeases();
  }, []);

  // Get the currently selected lease.
  const selectedLease = leases.find(
    (lease) => lease.id === Number(leaseId)
  );

  // Calculate the Due Date from:
  // Payment Date's month + Lease Rent Due Day.
  useEffect(() => {
    if (!selectedLease || !paymentDate) {
      setDueDate('');
      return;
    }

    // paymentDate from datetime-local is like:
    // 2026-09-24T14:30
    const datePart = paymentDate.split('T')[0];

    if (!datePart) {
      setDueDate('');
      return;
    }

    const [yearString, monthString] = datePart.split('-');

    const year = Number(yearString);
    const month = Number(monthString);

    if (
      !Number.isInteger(year) ||
      !Number.isInteger(month) ||
      month < 1 ||
      month > 12
    ) {
      setDueDate('');
      return;
    }

    const dueDay = selectedLease.rentDueDayOfMonth;

    // Find the last day of the payment date's month.
    const lastDayOfMonth = new Date(
      year,
      month,
      0
    ).getDate();

    // If the lease says 31 but the month only has 30 days,
    // use the last day of that month.
    const actualDueDay = Math.min(
      dueDay,
      lastDayOfMonth
    );

    const calculatedDueDate =
      `${yearString}-${monthString}-${String(actualDueDay).padStart(2, '0')}`;

    setDueDate(calculatedDueDate);
  }, [selectedLease, paymentDate]);

  // Keep Payment Channel valid for the selected Payment Method.
  useEffect(() => {
    switch (paymentMethod) {
      case 'Cash':
      case 'Check':
      case 'CreditCard':
        setPaymentChannel('None');
        break;

      case 'BankTransfer':
        if (
          paymentChannel !== 'BerhanBank' &&
          paymentChannel !== 'CommercialBankOfEthiopia'
        ) {
          setPaymentChannel('BerhanBank');
        }
        break;

      case 'Electronic':
        if (
          paymentChannel !== 'Telebirr' &&
          paymentChannel !== 'Chapa'
        ) {
          setPaymentChannel('Telebirr');
        }
        break;

      default:
        setPaymentChannel('None');
    }
  }, [paymentMethod, paymentChannel]);

  const handleLeaseChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedId = event.target.value;

    setLeaseId(selectedId);

    const lease = leases.find(
      (item) => item.id === Number(selectedId)
    );

    // When creating a Rent payment, use the lease's agreed
    // monthly rent as the initial payment amount.
    if (lease && paymentType === 'Rent') {
      setAmount(lease.rentAmount.toString());
    }
  };

  const handlePaymentTypeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newPaymentType = event.target.value;

    setPaymentType(newPaymentType);

    // When switching back to Rent, use the lease's rent amount.
    if (
      newPaymentType === 'Rent' &&
      selectedLease
    ) {
      setAmount(selectedLease.rentAmount.toString());
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!leaseId) {
      setError('Please select a lease.');
      return;
    }

    if (!amount) {
      setError('Payment amount is required.');
      return;
    }

    if (!paymentDate) {
      setError('Payment date is required.');
      return;
    }

    if (!dueDate) {
      setError(
        'Due date could not be calculated. Please select a lease and payment date.'
      );
      return;
    }

    const parsedLeaseId = Number(leaseId);
    const parsedAmount = Number(amount);

    if (
      !Number.isInteger(parsedLeaseId) ||
      parsedLeaseId <= 0
    ) {
      setError('Invalid lease.');
      return;
    }

    if (
      Number.isNaN(parsedAmount) ||
      parsedAmount <= 0
    ) {
      setError('Payment amount must be greater than 0.');
      return;
    }

    // Frontend validation before sending to the API.
    if (
      (paymentMethod === 'Cash' ||
        paymentMethod === 'Check' ||
        paymentMethod === 'CreditCard') &&
      paymentChannel !== 'None'
    ) {
      setError(
        `${paymentMethod} payments must have Payment Channel set to None.`
      );
      return;
    }

    if (
      paymentMethod === 'BankTransfer' &&
      paymentChannel !== 'BerhanBank' &&
      paymentChannel !== 'CommercialBankOfEthiopia'
    ) {
      setError(
        'Bank Transfer payments must use Berhan Bank or Commercial Bank of Ethiopia.'
      );
      return;
    }

    if (
      paymentMethod === 'Electronic' &&
      paymentChannel !== 'Telebirr' &&
      paymentChannel !== 'Chapa'
    ) {
      setError(
        'Electronic payments must use Telebirr or Chapa.'
      );
      return;
    }

    try {
      setSaving(true);

      // Chapa payment flow
      if (
        paymentMethod === 'Electronic' &&
        paymentChannel === 'Chapa'
      ) {
        const chapaPayment =
          await paymentsApi.initializeChapaPayment({
            leaseId: parsedLeaseId,
            amount: parsedAmount,
            dueDate,
            paymentType,
          });

        sessionStorage.setItem(
          'chapa_tx_ref',
          chapaPayment.txRef
        );

        sessionStorage.setItem(
          'chapa_payment_id',
          chapaPayment.paymentId.toString()
        );

        window.location.href =
          chapaPayment.checkoutUrl;

        return;
      }

      // Normal payment flow
      await paymentsApi.create({
        leaseId: parsedLeaseId,
        amount: parsedAmount,
        paymentDate,
        dueDate,
        paymentType,
        paymentMethod,
        paymentChannel,
        status,
        referenceNumber:
          referenceNumber.trim() || null,
        notes: notes.trim() || null,
      });

      navigate('/payments');
    } catch (err: any) {
      if (err.response?.status === 400) {
        setError(
          err.response?.data?.message ||
          'Please check the payment information.'
        );
      } else if (err.response?.status === 401) {
        setError(
          'Authentication required. Please log in again.'
        );
      } else if (err.response?.status === 403) {
        setError(
          'You do not have permission to create a payment.'
        );
      } else if (err.response?.status === 404) {
        setError(
          err.response?.data?.message ||
          'The selected lease was not found.'
        );
      } else {
        setError(
          err.response?.data?.message ||
          err.message ||
          'Failed to create payment.'
        );
      }
    } finally {
      setSaving(false);
    }
  };

  if (!canCreate) {
    return (
      <Box sx={{ width: '100%' }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/payments')}
          sx={{
            mb: 3,
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Back to Payments
        </Button>

        <Alert severity="error">
          Access Denied. Only Admins and Property Managers can
          create payments.
        </Alert>
      </Box>
    );
  }

  if (loadingData) {
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
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/payments')}
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
          Back to Payments
        </Button>

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
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(59, 130, 246, 0.1)',
              color: '#3b82f6',
            }}
          >
            <PaymentsIcon />
          </Box>

          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: '#1e293b',
              }}
            >
              Create Payment
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: '#64748b',
                mt: 0.5,
              }}
            >
              Record a new payment against a lease.
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Form */}
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 1000,
          border: '1px solid #e2e8f0',
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            px: { xs: 2, sm: 3, md: 4 },
            py: 2.5,
            bgcolor: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: '#1e293b',
            }}
          >
            Payment Information
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: '#64748b',
              mt: 0.5,
            }}
          >
            Enter the details below to record the payment.
          </Typography>
        </Box>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
          }}
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
                md: 'repeat(2, minmax(0, 1fr))',
              },
              gap: 2.5,
            }}
          >
            {/* Lease */}
            <TextField
              fullWidth
              required
              select
              label="Lease"
              value={leaseId}
              onChange={handleLeaseChange}
              disabled={saving}
            >
              {leases.length === 0 ? (
                <MenuItem disabled value="">
                  No leases available
                </MenuItem>
              ) : (
                leases.map((lease) => (
                  <MenuItem
                    key={lease.id}
                    value={lease.id}
                  >
                    Lease #{lease.id} — {lease.tenantName} — Unit{' '}
                    {lease.unitNumber}
                  </MenuItem>
                ))
              )}
            </TextField>

            {/* Amount */}
            <TextField
              fullWidth
              required
              label="Amount"
              type="number"
              value={amount}
              onChange={(event) =>
                setAmount(event.target.value)
              }
              slotProps={{
                htmlInput: {
                  min: 0,
                  step: 0.01,
                },
              }}
              disabled={saving}
              helperText={
                paymentType === 'Rent' && selectedLease
                  ? `Lease rent: ${selectedLease.rentAmount.toLocaleString(
                    'en-US',
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )} ETB`
                  : undefined
              }
            />

            {/* Payment Date */}
            <TextField
              fullWidth
              required
              label="Payment Date"
              type="datetime-local"
              value={paymentDate}
              onChange={(event) =>
                setPaymentDate(event.target.value)
              }
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
              disabled={saving}
            />

            {/* Due Date */}
            <TextField
              fullWidth
              required
              label="Due Date"
              type="date"
              value={dueDate}
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
                htmlInput: {
                  readOnly: true,
                },
              }}
              disabled={saving || !selectedLease || !paymentDate}
              helperText={
                selectedLease && paymentDate
                  ? `Based on the lease due day: ${selectedLease.rentDueDayOfMonth}`
                  : 'Select a lease and payment date.'
              }
            />

            {/* Payment Type */}
            <TextField
              fullWidth
              select
              label="Payment Type"
              value={paymentType}
              onChange={handlePaymentTypeChange}
              disabled={saving}
            >
              <MenuItem value="Rent">
                Rent
              </MenuItem>

              <MenuItem value="SecurityDeposit">
                Security Deposit
              </MenuItem>

              <MenuItem value="LateFee">
                Late Fee
              </MenuItem>

              <MenuItem value="Utility">
                Utility
              </MenuItem>

              <MenuItem value="Refund">
                Refund
              </MenuItem>
            </TextField>

            {/* Payment Method */}
            <TextField
              fullWidth
              select
              label="Payment Method"
              value={paymentMethod}
              onChange={(event) =>
                setPaymentMethod(event.target.value)
              }
              disabled={saving}
            >
              <MenuItem value="Electronic">
                Electronic
              </MenuItem>

              <MenuItem value="CreditCard">
                Credit Card
              </MenuItem>

              <MenuItem value="BankTransfer">
                Bank Transfer
              </MenuItem>

              <MenuItem value="Check">
                Check
              </MenuItem>

              <MenuItem value="Cash">
                Cash
              </MenuItem>
            </TextField>

            {/* Payment Channel */}
            <TextField
              fullWidth
              select
              label="Payment Channel"
              value={paymentChannel}
              onChange={(event) =>
                setPaymentChannel(event.target.value)
              }
              disabled={saving}
            >
              {(paymentMethod === 'Cash' ||
                paymentMethod === 'Check' ||
                paymentMethod === 'CreditCard') && (
                  <MenuItem value="None">
                    None
                  </MenuItem>
                )}

              {paymentMethod === 'BankTransfer' && (
                <MenuItem value="BerhanBank">
                  Berhan Bank
                </MenuItem>
              )}

              {paymentMethod === 'BankTransfer' && (
                <MenuItem value="CommercialBankOfEthiopia">
                  Commercial Bank of Ethiopia
                </MenuItem>
              )}

              {paymentMethod === 'Electronic' && (
                <MenuItem value="Telebirr">
                  Telebirr
                </MenuItem>
              )}

              {paymentMethod === 'Electronic' && (
                <MenuItem value="Chapa">
                  Chapa
                </MenuItem>
              )}
            </TextField>

            {/* Status */}
            <TextField
              fullWidth
              select
              label="Status"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value)
              }
              disabled={saving}
            >
              <MenuItem value="Pending">
                Pending
              </MenuItem>

              <MenuItem value="Completed">
                Completed
              </MenuItem>

              <MenuItem value="Failed">
                Failed
              </MenuItem>

              <MenuItem value="Refunded">
                Refunded
              </MenuItem>
            </TextField>

            {/* Reference Number */}
            <TextField
              fullWidth
              label="Reference Number"
              value={referenceNumber}
              onChange={(event) =>
                setReferenceNumber(event.target.value)
              }
              disabled={saving}
            />

            {/* Notes */}
            <TextField
              fullWidth
              label="Notes"
              multiline
              minRows={4}
              value={notes}
              onChange={(event) =>
                setNotes(event.target.value)
              }
              disabled={saving}
              sx={{
                gridColumn: {
                  xs: 'auto',
                  md: '1 / -1',
                },
              }}
            />
          </Box>

          {/* Actions */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 1.5,
              mt: 4,
              pt: 3,
              borderTop: '1px solid #e2e8f0',
              flexWrap: 'wrap',
            }}
          >
            <Button
              variant="outlined"
              onClick={() => navigate('/payments')}
              disabled={saving}
              sx={{
                px: 3,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="contained"
              disabled={saving}
              startIcon={
                saving ? (
                  <CircularProgress
                    size={18}
                    color="inherit"
                  />
                ) : (
                  <PaymentsIcon />
                )
              }
              sx={{
                px: 3,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: 'none',
                },
              }}
            >
              {saving
                ? 'Creating...'
                : 'Create Payment'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default CreatePaymentPage;