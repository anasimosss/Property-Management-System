import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
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
import PaymentsIcon from '@mui/icons-material/Payments';
import PersonIcon from '@mui/icons-material/Person';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { paymentsApi } from '../api/payments';
import { useAuth } from '../context/AuthContext';
import type { Payment } from '../types';

const PaymentDetailsPage = () => {
  const { paymentId } = useParams<{ paymentId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    const fetchPayment = async () => {
      if (!paymentId) {
        setError('Payment ID is required.');
        setLoading(false);
        return;
      }

      const parsedPaymentId = parseInt(paymentId, 10);

      if (Number.isNaN(parsedPaymentId)) {
        setError('Invalid Payment ID.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const data = await paymentsApi.getById(parsedPaymentId);
        setPayment(data);
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
            'Failed to load payment details.'
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPayment();
  }, [paymentId]);

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString(
      'en-US',
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }
    );
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

  const getStatusColor = (
    status: string
  ): 'success' | 'warning' | 'error' | 'default' => {
    const normalizedStatus = status.toLowerCase();

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
    if (!paymentId) return;

    const parsedPaymentId = parseInt(paymentId, 10);

    if (Number.isNaN(parsedPaymentId)) {
      setDeleteError('Invalid Payment ID.');
      return;
    }

    try {
      setDeleting(true);
      setDeleteError('');

      await paymentsApi.delete(parsedPaymentId);

      navigate('/payments');
    } catch (err: any) {
      if (err.response?.status === 404) {
        setDeleteError('Payment not found.');
      } else if (err.response?.status === 403) {
        setDeleteError(
          'You do not have permission to delete this payment.'
        );
      } else if (err.response?.status === 401) {
        setDeleteError(
          'Authentication required. Please log in again.'
        );
      } else {
        setDeleteError(
          err.response?.data?.message ||
          err.message ||
          'Failed to delete payment. Please try again.'
        );
      }
    } finally {
      setDeleting(false);
    }
  };

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

  if (error) {
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

        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!payment) {
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

        <Alert severity="info">Payment not found.</Alert>
      </Box>
    );
  }

  const canEdit =
    user?.role === 'Admin' || user?.role === 'PropertyManager';

  const canDelete = user?.role === 'Admin';

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
                Payment #{payment.id}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: '#64748b',
                  mt: 0.5,
                }}
              >
                Payment details and transaction information
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
                  navigate(`/payments/${payment.id}/edit`)
                }
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Edit Payment
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
                Delete
              </Button>
            )}
          </Box>
        </Box>
      </Box>

      {/* Payment Summary */}
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
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            border: '1px solid #e2e8f0',
            borderRadius: 3,
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: '#64748b', mb: 1 }}
          >
            Payment Amount
          </Typography>

          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: '#1e293b',
            }}
          >
            {formatAmount(payment.amount)} ETB
          </Typography>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            border: '1px solid #e2e8f0',
            borderRadius: 3,
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: '#64748b', mb: 1 }}
          >
            Status
          </Typography>

          <Chip
            label={payment.status}
            color={getStatusColor(payment.status)}
            sx={{
              fontWeight: 600,
              textTransform: 'capitalize',
            }}
          />
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            border: '1px solid #e2e8f0',
            borderRadius: 3,
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: '#64748b', mb: 1 }}
          >
            Tenant
          </Typography>

          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: '#1e293b',
            }}
          >
            {payment.tenantName}
          </Typography>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            border: '1px solid #e2e8f0',
            borderRadius: 3,
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: '#64748b', mb: 1 }}
          >
            Unit
          </Typography>

          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: '#1e293b',
            }}
          >
            {payment.unitNumber}
          </Typography>
        </Paper>
      </Box>

      {/* Main Details */}
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
        </Box>

        <Box
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
              },
              gap: 3,
            }}
          >
            <DetailItem
              icon={<PaymentsIcon />}
              label="Payment ID"
              value={payment.id.toString()}
            />

            <DetailItem
              icon={<PaymentsIcon />}
              label="Lease"
              value={`Lease #${payment.leaseId}`}
            />

            <DetailItem
              icon={<PersonIcon />}
              label="Tenant"
              value={payment.tenantName}
            />

            <DetailItem
              icon={<HomeWorkIcon />}
              label="Unit"
              value={payment.unitNumber}
            />

            <DetailItem
              icon={<AccountBalanceWalletIcon />}
              label="Amount"
              value={`${formatAmount(payment.amount)} ETB`}
            />

            <DetailItem
              icon={<CalendarMonthIcon />}
              label="Payment Date"
              value={formatDateTime(payment.paymentDate)}
            />

            <DetailItem
              icon={<CalendarMonthIcon />}
              label="Due Date"
              value={formatDate(payment.dueDate)}
            />

            <DetailItem
              icon={<PaymentsIcon />}
              label="Payment Type"
              value={payment.paymentType}
            />

            <DetailItem
              icon={<AccountBalanceWalletIcon />}
              label="Payment Method"
              value={payment.paymentMethod}
            />

            <DetailItem
              icon={<AccountBalanceWalletIcon />}
              label="Payment Channel"
              value={formatPaymentChannel(payment.paymentChannel)}
            />

            <DetailItem
              icon={<PaymentsIcon />}
              label="Reference Number"
              value={payment.referenceNumber ?? '—'}
            />

            <Box
              sx={{
                gridColumn: {
                  xs: 'auto',
                  sm: '1 / -1',
                },
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: '#64748b',
                  fontWeight: 600,
                  display: 'block',
                  mb: 0.75,
                }}
              >
                Notes
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: '#334155',
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.7,
                }}
              >
                {payment.notes ?? 'No notes provided.'}
              </Typography>
            </Box>

            <DetailItem
              icon={<CalendarMonthIcon />}
              label="Created"
              value={formatDateTime(payment.createdAtUtc)}
            />
          </Box>
        </Box>
      </Paper>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-payment-dialog-title"
        aria-describedby="delete-payment-dialog-description"
      >
        <DialogTitle id="delete-payment-dialog-title">
          Delete Payment
        </DialogTitle>

        <DialogContent>
          <DialogContentText id="delete-payment-dialog-description">
            Are you sure you want to delete Payment #{payment.id}?
            This action cannot be undone.
          </DialogContentText>

          {deleteError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {deleteError}
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleDeleteCancel}
            disabled={deleting}
          >
            Cancel
          </Button>

          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleting}
          >
            {deleting ? (
              <CircularProgress size={22} color="inherit" />
            ) : (
              'Delete'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

interface DetailItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const DetailItem = ({ icon, label, value }: DetailItemProps) => (
  <Box
    sx={{
      display: 'flex',
      gap: 1.5,
      alignItems: 'flex-start',
    }}
  >
    <Box
      sx={{
        width: 36,
        height: 36,
        flexShrink: 0,
        borderRadius: 1.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f1f5f9',
        color: '#64748b',
        '& svg': {
          fontSize: 20,
        },
      }}
    >
      {icon}
    </Box>

    <Box sx={{ minWidth: 0 }}>
      <Typography
        variant="caption"
        sx={{
          color: '#64748b',
          fontWeight: 600,
          display: 'block',
          mb: 0.5,
        }}
      >
        {label}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          color: '#1e293b',
          fontWeight: 500,
          wordBreak: 'break-word',
        }}
      >
        {value}
      </Typography>
    </Box>
  </Box>
);

export default PaymentDetailsPage;