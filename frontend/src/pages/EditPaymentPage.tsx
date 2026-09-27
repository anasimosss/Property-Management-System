import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import EditIcon from '@mui/icons-material/Edit';
import PaymentsIcon from '@mui/icons-material/Payments';
import { paymentsApi } from '../api/payments';
import { leasesApi } from '../api/leases';
import { useAuth } from '../context/AuthContext';
import type { Lease } from '../types';

const EditPaymentPage = () => {
  const { paymentId } = useParams<{ paymentId: string }>();
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

  const canEdit =
    user?.role === 'Admin' || user?.role === 'PropertyManager';

  useEffect(() => {
    const loadData = async () => {
      if (!paymentId) {
        setError('Payment ID is required.');
        setLoadingData(false);
        return;
      }

      const parsedPaymentId = parseInt(paymentId, 10);

      if (Number.isNaN(parsedPaymentId)) {
        setError('Invalid Payment ID.');
        setLoadingData(false);
        return;
      }

      try {
        setLoadingData(true);
        setError('');

        const [payment, leasesData] = await Promise.all([
          paymentsApi.getById(parsedPaymentId),
          leasesApi.getAll(),
        ]);

        setLeases(leasesData);

        setLeaseId(String(payment.leaseId));
        setAmount(String(payment.amount));

        setPaymentDate(
          payment.paymentDate.length >= 16
            ? payment.paymentDate.slice(0, 16)
            : payment.paymentDate
        );

        setDueDate(payment.dueDate);
        setPaymentType(payment.paymentType);
        setPaymentMethod(payment.paymentMethod);
        setPaymentChannel(payment.paymentChannel);
        setStatus(payment.status);
        setReferenceNumber(payment.referenceNumber ?? '');
        setNotes(payment.notes ?? '');
      } catch (err: any) {
        if (err.response?.status === 404) {
          setError(
            'Payment with ID ' + paymentId + ' was not found.'
          );
        } else if (err.response?.status === 401) {
          setError('Authentication required. Please log in again.');
        } else {
          setError(
            err.response?.data?.message ||
            err.message ||
            'Failed to load payment.'
          );
        }
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [paymentId]);

  // Automatically set a valid default channel when
  // the Payment Method changes.
  useEffect(() => {
    if (
      paymentMethod === 'Cash' ||
      paymentMethod === 'Check' ||
      paymentMethod === 'CreditCard'
    ) {
      setPaymentChannel('None');
      return;
    }

    if (paymentMethod === 'BankTransfer') {
      if (
        paymentChannel !== 'BerhanBank' &&
        paymentChannel !== 'CommercialBankOfEthiopia'
      ) {
        setPaymentChannel('BerhanBank');
      }
      return;
    }

    if (paymentMethod === 'Electronic') {
      if (
        paymentChannel !== 'Telebirr' &&
        paymentChannel !== 'Chapa'
      ) {
        setPaymentChannel('Telebirr');
      }
      return;
    }

    setPaymentChannel('None');
  }, [paymentMethod]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!paymentId) {
      setError('Payment ID is required.');
      return;
    }

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
      setError('Due date is required.');
      return;
    }

    const parsedPaymentId = parseInt(paymentId, 10);
    const parsedLeaseId = Number(leaseId);
    const parsedAmount = Number(amount);

    if (Number.isNaN(parsedPaymentId)) {
      setError('Invalid Payment ID.');
      return;
    }

    if (!Number.isInteger(parsedLeaseId) || parsedLeaseId <= 0) {
      setError('Invalid lease.');
      return;
    }

    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Payment amount must be greater than 0.');
      return;
    }

    // Frontend validation for Payment Channel.
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

      await paymentsApi.update(parsedPaymentId, {
        leaseId: parsedLeaseId,
        amount: parsedAmount,
        paymentDate,
        dueDate,
        paymentType,
        paymentMethod,
        paymentChannel,
        status,
        referenceNumber: referenceNumber.trim() || null,
        notes: notes.trim() || null,
      });

      navigate('/payments/' + paymentId);
    } catch (err: any) {
      if (err.response?.status === 400) {
        setError(
          err.response?.data?.message ||
          'Please check the payment information.'
        );
      } else if (err.response?.status === 401) {
        setError('Authentication required. Please log in again.');
      } else if (err.response?.status === 403) {
        setError(
          'You do not have permission to edit this payment.'
        );
      } else if (err.response?.status === 404) {
        setError(
          err.response?.data?.message ||
          'The payment or selected lease was not found.'
        );
      } else {
        setError(
          err.response?.data?.message ||
          err.message ||
          'Failed to update payment.'
        );
      }
    } finally {
      setSaving(false);
    }
  };

  if (!canEdit) {
    return (
      <Box sx={{ width: '100%' }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/payments/' + paymentId)}
          sx={{
            mb: 3,
            color: '#64748b',
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': {
              bgcolor: '#f1f5f9',
            },
          }}
        >
          Back to Payment
        </Button>

        <Alert severity="error">
          Access Denied. Only Admins and Property Managers can edit
          payments.
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
          onClick={() => navigate('/payments/' + paymentId)}
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
          Back to Payment
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
              width: 48,
              height: 48,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(59, 130, 246, 0.1)',
              color: '#3b82f6',
            }}
          >
            <EditIcon />
          </Box>

          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: '#1e293b',
              }}
            >
              Edit Payment
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: '#64748b',
                mt: 0.5,
              }}
            >
              Update payment #{paymentId} information
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Form */}
      <Paper
        elevation={0}
        sx={{
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
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <PaymentsIcon sx={{ color: '#64748b' }} />

          <Box>
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
                mt: 0.25,
              }}
            >
              Update the details of this payment transaction.
            </Typography>
          </Box>
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
                sm: 'repeat(2, minmax(0, 1fr))',
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
              onChange={(event) => setLeaseId(event.target.value)}
              disabled={saving}
            >
              {leases.map((lease) => (
                <MenuItem key={lease.id} value={lease.id}>
                  Lease #{lease.id} — {lease.tenantName} — Unit{' '}
                  {lease.unitNumber}
                </MenuItem>
              ))}
            </TextField>

            {/* Amount */}
            <TextField
              fullWidth
              required
              label="Amount"
              type="number"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              slotProps={{
                htmlInput: {
                  min: 0,
                  step: 0.01,
                },
              }}
              disabled={saving}
            />

            {/* Payment Date */}
            <TextField
              fullWidth
              required
              label="Payment Date"
              type="datetime-local"
              value={paymentDate}
              onChange={(event) => setPaymentDate(event.target.value)}
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
              onChange={(event) => setDueDate(event.target.value)}
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
              disabled={saving}
            />

            {/* Payment Type */}
            <TextField
              fullWidth
              select
              label="Payment Type"
              value={paymentType}
              onChange={(event) =>
                setPaymentType(event.target.value)
              }
              disabled={saving}
            >
              <MenuItem value="Rent">Rent</MenuItem>
              <MenuItem value="SecurityDeposit">
                Security Deposit
              </MenuItem>
              <MenuItem value="LateFee">Late Fee</MenuItem>
              <MenuItem value="Utility">Utility</MenuItem>
              <MenuItem value="Refund">Refund</MenuItem>
            </TextField>

            {/* Payment Method */}
            <TextField
              fullWidth
              select
              label="Payment Method"
              value={paymentMethod}
              onChange={(event) => {
                setPaymentMethod(event.target.value);
              }}
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
              onChange={(event) => {
                const value = event.target.value;
                console.log('Selected channel:', value);
                setPaymentChannel(value);
              }}
              disabled={saving}
            >
              {paymentMethod === 'BankTransfer' && (
                [
                  {
                    value: 'BerhanBank',
                    label: 'Berhan Bank',
                  },
                  {
                    value: 'CommercialBankOfEthiopia',
                    label: 'Commercial Bank of Ethiopia',
                  },
                ].map((option) => (
                  <MenuItem
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </MenuItem>
                ))
              )}

              {paymentMethod === 'Electronic' && (
                [
                  {
                    value: 'Telebirr',
                    label: 'Telebirr',
                  },
                  {
                    value: 'Chapa',
                    label: 'Chapa',
                  },
                ].map((option) => (
                  <MenuItem
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </MenuItem>
                ))
              )}

              {(paymentMethod === 'Cash' ||
                paymentMethod === 'Check' ||
                paymentMethod === 'CreditCard') && (
                  <MenuItem value="None">
                    None
                  </MenuItem>
                )}
            </TextField>

            {/* Status */}
            <TextField
              fullWidth
              select
              label="Status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
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
            <Box
              sx={{
                gridColumn: {
                  xs: 'auto',
                  sm: '1 / -1',
                },
              }}
            >
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
              />
            </Box>
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
              onClick={() =>
                navigate('/payments/' + paymentId)
              }
              disabled={saving}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
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
                    size={18}
                    color="inherit"
                  />
                ) : (
                  <EditIcon />
                )
              }
              disabled={saving}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
              }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default EditPaymentPage;