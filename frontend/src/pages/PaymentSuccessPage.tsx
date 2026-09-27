import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Paper,
    Typography,
    Button,
    CircularProgress,
    Alert,
} from '@mui/material';

const PaymentSuccessPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const verifyPayment = async () => {
            // Chapa may return trx_ref or tx_ref.
            // If it does not return either one, use the reference
            // saved when the payment was initialized.
            const txRef =
                searchParams.get('trx_ref') ||
                searchParams.get('tx_ref') ||
                searchParams.get('txRef') ||
                sessionStorage.getItem('chapa_tx_ref');

            if (!txRef) {
                setMessage(
                    'Transaction reference was not provided. Please contact support if your payment was completed.'
                );
                setLoading(false);
                return;
            }

            try {
                const token = localStorage.getItem('auth_token');

                if (!token) {
                    throw new Error(
                        'Authentication token was not found. Please log in again.'
                    );
                }

                const response = await fetch(
                    `http://localhost:5230/api/ChapaPayments/verify/${encodeURIComponent(
                        txRef
                    )}`,
                    {
                        method: 'GET',
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data?.message || 'Payment verification failed.'
                    );
                }

                if (data.status === 'Completed') {
                    setSuccess(true);
                    setMessage('Payment completed successfully.');

                    sessionStorage.removeItem('chapa_tx_ref');
                    sessionStorage.removeItem('chapa_payment_id');
                } else if (data.status === 'Failed') {
                    setSuccess(false);
                    setMessage('The payment was not completed.');
                } else if (data.status === 'Pending') {
                    setSuccess(false);
                    setMessage(
                        'Your payment is still being processed. Please check again shortly.'
                    );
                } else {
                    setSuccess(false);
                    setMessage(`Payment status: ${data.status}`);
                }
            } catch (error) {
                setSuccess(false);
                setMessage(
                    error instanceof Error
                        ? error.message
                        : 'Payment verification failed.'
                );
            } finally {
                setLoading(false);
            }
        };

        verifyPayment();
    }, [searchParams]);

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 3,
                bgcolor: 'background.default',
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    width: '100%',
                    maxWidth: 500,
                    p: 5,
                    textAlign: 'center',
                    borderRadius: 3,
                }}
            >
                {loading ? (
                    <>
                        <CircularProgress sx={{ mb: 3 }} />

                        <Typography variant="h6">
                            Verifying your payment...
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 1 }}
                        >
                            Please wait while we confirm your payment with
                            Chapa.
                        </Typography>
                    </>
                ) : (
                    <>
                        {success ? (
                            <Alert severity="success" sx={{ mb: 3 }}>
                                {message}
                            </Alert>
                        ) : (
                            <Alert severity="warning" sx={{ mb: 3 }}>
                                {message}
                            </Alert>
                        )}

                        <Typography
                            variant="h5"
                            sx={{ fontWeight: 600 }}
                            gutterBottom
                        >
                            {success
                                ? 'Payment Successful'
                                : 'Payment Verification'}
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 3 }}
                        >
                            {success
                                ? 'Your payment has been successfully verified.'
                                : 'Your payment could not be confirmed as completed yet.'}
                        </Typography>

                        <Button
                            variant="contained"
                            onClick={() => navigate('/payments')}
                        >
                            Back to Payments
                        </Button>
                    </>
                )}
            </Paper>
        </Box>
    );
};

export default PaymentSuccessPage;