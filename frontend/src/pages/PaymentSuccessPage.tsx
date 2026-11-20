import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Paper,
    Typography,
    Button,
    CircularProgress,
    Alert,
    Divider,
    Stack,
    Chip,
    SvgIcon,
    type SvgIconProps,
} from '@mui/material';
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';

const CheckCircleOutlineIcon = (props: SvgIconProps) => (
    <SvgIcon {...props}>
        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm-1.5-3.5-4-4L7.9 11.1l2.6 2.59 5.6-5.59 1.4 1.41-7 6.99Z" />
    </SvgIcon>
);

interface PaymentResponse {
    id: number;
    leaseId: number;
    unitNumber: string;
    tenantId: number;
    tenantName: string;
    amount: number;
    paymentDate: string;
    dueDate: string;
    paymentType: string;
    paymentMethod: string;
    status: string;
    referenceNumber?: string | null;
    notes?: string | null;
    createdAtUtc: string;
    paymentChannel: string;
    chapaTransactionReference?: string | null;
    chapaReference?: string | null;
}

const PaymentSuccessPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [success, setSuccess] = useState(false);
    const [payment, setPayment] =
        useState<PaymentResponse | null>(null);

    useEffect(() => {
        const verifyPayment = async () => {
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
                const token =
                    localStorage.getItem('auth_token');

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
                        data?.message ||
                            'Payment verification failed.'
                    );
                }

                setPayment(data);

                if (data.status === 'Completed') {
                    setSuccess(true);
                    setMessage(
                        'Your payment has been successfully verified.'
                    );

                    sessionStorage.removeItem(
                        'chapa_tx_ref'
                    );
                    sessionStorage.removeItem(
                        'chapa_payment_id'
                    );
                } else if (data.status === 'Failed') {
                    setSuccess(false);
                    setMessage(
                        'The payment was not completed.'
                    );
                } else if (data.status === 'Pending') {
                    setSuccess(false);
                    setMessage(
                        'Your payment is still being processed. Please check again shortly.'
                    );
                } else {
                    setSuccess(false);
                    setMessage(
                        `Payment status: ${data.status}`
                    );
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

    const handlePrintReceipt = () => {
        window.print();
    };

    const formattedAmount =
        payment?.amount.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }) ?? '0.00';

    const paymentDate = payment
        ? new Date(payment.paymentDate).toLocaleDateString(
              'en-US',
              {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
              }
          )
        : '';

    const paymentTime = payment
        ? new Date(payment.paymentDate).toLocaleTimeString(
              'en-US',
              {
                  hour: '2-digit',
                  minute: '2-digit',
              }
          )
        : '';

    const dueDate = payment
        ? new Date(
              `${payment.dueDate}T00:00:00`
          ).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
          })
        : '';

    return (
        <Box
            sx={{
                minHeight: '100vh',
                bgcolor: '#f4f6f8',
                py: { xs: 2, sm: 5 },
                px: { xs: 1.5, sm: 3 },
                '@media print': {
                    bgcolor: '#fff',
                    py: 0,
                    px: 0,
                },
            }}
        >
            {loading ? (
                <Box
                    sx={{
                        minHeight: '80vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Paper
                        elevation={0}
                        sx={{
                            p: 5,
                            textAlign: 'center',
                            borderRadius: 3,
                            maxWidth: 450,
                            width: '100%',
                        }}
                    >
                        <CircularProgress sx={{ mb: 3 }} />

                        <Typography
                            variant="h6"
                            sx={{ fontWeight: 700 }}
                        >
                            Verifying your payment...
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 1 }}
                        >
                            Please wait while we confirm
                            your payment.
                        </Typography>
                    </Paper>
                </Box>
            ) : !success || !payment ? (
                <Box
                    sx={{
                        minHeight: '80vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 3, sm: 5 },
                            textAlign: 'center',
                            borderRadius: 3,
                            maxWidth: 520,
                            width: '100%',
                        }}
                    >
                        <Alert
                            severity="warning"
                            sx={{
                                mb: 3,
                                textAlign: 'left',
                            }}
                        >
                            {message}
                        </Alert>

                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: 700,
                                mb: 1,
                            }}
                        >
                            Payment Verification
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 3 }}
                        >
                            Your payment could not be
                            confirmed as completed yet.
                        </Typography>

                        <Button
                            variant="contained"
                            onClick={() =>
                                navigate('/payments')
                            }
                        >
                            Back to Payments
                        </Button>
                    </Paper>
                </Box>
            ) : (
                <Box
                    sx={{
                        maxWidth: 760,
                        mx: 'auto',
                    }}
                >
                    {/* Receipt */}
                    <Paper
                        elevation={0}
                        className="property-hub-receipt"
                        sx={{
                            overflow: 'hidden',
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: '#e1e5e9',
                            bgcolor: '#fff',
                            '@media print': {
                                border: 'none',
                                borderRadius: 0,
                                boxShadow: 'none',
                            },
                        }}
                    >
                        {/* Header */}
                        <Box
                            sx={{
                                px: {
                                    xs: 3,
                                    sm: 5,
                                },
                                py: 4,
                                display: 'flex',
                                justifyContent:
                                    'space-between',
                                alignItems: {
                                    xs: 'flex-start',
                                    sm: 'center',
                                },
                                gap: 3,
                                flexDirection: {
                                    xs: 'column',
                                    sm: 'row',
                                },
                                borderBottom:
                                    '1px solid #e8ebee',
                            }}
                        >
                            <Box>
                                <Stack
                                    direction="row"
                                    spacing={1.5}
                                    sx={{
                                        mb: 1,
                                        alignItems: 'center',
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 42,
                                            height: 42,
                                            borderRadius: 2,
                                            display: 'flex',
                                            alignItems:
                                                'center',
                                            justifyContent:
                                                'center',
                                            bgcolor:
                                                'primary.main',
                                            color: '#fff',
                                        }}
                                    >
                                        <HomeWorkOutlinedIcon />
                                    </Box>

                                    <Box>
                                        <Typography
                                            variant="h5"
                                            sx={{
                                                fontWeight: 800,
                                                lineHeight: 1.1,
                                            }}
                                        >
                                            Property Hub
                                        </Typography>

                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            Property
                                            Management
                                        </Typography>
                                    </Box>
                                </Stack>
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
                                    variant="overline"
                                    color="text.secondary"
                                    sx={{
                                        fontWeight: 700,
                                        letterSpacing: 1.2,
                                    }}
                                >
                                    PAYMENT RECEIPT
                                </Typography>

                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 800,
                                    }}
                                >
                                    #{payment.id}
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {paymentDate}
                                </Typography>
                            </Box>
                        </Box>

                        {/* Success banner */}
                        <Box
                            sx={{
                                mx: {
                                    xs: 2,
                                    sm: 4,
                                },
                                mt: 3,
                                p: 2.5,
                                borderRadius: 2,
                                bgcolor: '#f0fdf4',
                                border: '1px solid #bbf7d0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                            }}
                        >
                            <CheckCircleOutlineIcon
                                sx={{
                                    fontSize: 38,
                                    color: '#16a34a',
                                }}
                            />

                            <Box sx={{ flex: 1 }}>
                                <Typography
                                    sx={{
                                        fontWeight: 800,
                                        color: '#166534',
                                    }}
                                >
                                    Payment Successful
                                </Typography>

                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: '#15803d',
                                    }}
                                >
                                    {message}
                                </Typography>
                            </Box>

                            <Chip
                                label="PAID"
                                size="small"
                                sx={{
                                    display: {
                                        xs: 'none',
                                        sm: 'flex',
                                    },
                                    fontWeight: 800,
                                    bgcolor: '#dcfce7',
                                    color: '#166534',
                                }}
                            />
                        </Box>

                        {/* Amount */}
                        <Box
                            sx={{
                                textAlign: 'center',
                                px: 3,
                                py: 4,
                            }}
                        >
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                    fontWeight: 600,
                                    mb: 0.5,
                                }}
                            >
                                Amount Paid
                            </Typography>

                            <Typography
                                sx={{
                                    fontSize: {
                                        xs: '2.2rem',
                                        sm: '3rem',
                                    },
                                    fontWeight: 800,
                                    letterSpacing: '-0.03em',
                                    lineHeight: 1.1,
                                }}
                            >
                                {formattedAmount}
                            </Typography>

                            <Typography
                                variant="body1"
                                color="text.secondary"
                                sx={{
                                    fontWeight: 600,
                                    mt: 0.5,
                                }}
                            >
                                ETB
                            </Typography>
                        </Box>

                        <Divider />

                        {/* Tenant / Property information */}
                        <Box
                            sx={{
                                px: {
                                    xs: 3,
                                    sm: 5,
                                },
                                py: 4,
                            }}
                        >
                            <Typography
                                variant="subtitle2"
                                sx={{
                                    fontWeight: 800,
                                    mb: 2,
                                    textTransform:
                                        'uppercase',
                                    letterSpacing: 0.8,
                                    color: 'text.secondary',
                                }}
                            >
                                Rental Information
                            </Typography>

                            <Box
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: {
                                        xs: '1fr',
                                        sm: '1fr 1fr',
                                    },
                                    gap: 3,
                                }}
                            >
                                <InfoBlock
                                    label="Tenant"
                                    value={
                                        payment.tenantName
                                    }
                                />

                                <InfoBlock
                                    label="Unit"
                                    value={
                                        payment.unitNumber
                                    }
                                />

                                <InfoBlock
                                    label="Payment Type"
                                    value={
                                        payment.paymentType
                                    }
                                />

                                <InfoBlock
                                    label="Due Date"
                                    value={dueDate}
                                />
                            </Box>
                        </Box>

                        <Divider />

                        {/* Payment details */}
                        <Box
                            sx={{
                                px: {
                                    xs: 3,
                                    sm: 5,
                                },
                                py: 4,
                            }}
                        >
                            <Typography
                                variant="subtitle2"
                                sx={{
                                    fontWeight: 800,
                                    mb: 2,
                                    textTransform:
                                        'uppercase',
                                    letterSpacing: 0.8,
                                    color: 'text.secondary',
                                }}
                            >
                                Payment Details
                            </Typography>

                            <Box
                                sx={{
                                    border: '1px solid',
                                    borderColor:
                                        'divider',
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                }}
                            >
                                <DetailRow
                                    label="Payment Date"
                                    value={`${paymentDate} at ${paymentTime}`}
                                />

                                <DetailRow
                                    label="Payment Method"
                                    value={
                                        payment.paymentMethod
                                    }
                                />

                                <DetailRow
                                    label="Payment Channel"
                                    value={
                                        payment.paymentChannel
                                    }
                                />

                                <DetailRow
                                    label="Status"
                                    value={
                                        payment.status
                                    }
                                    highlight
                                />

                                {payment.referenceNumber && (
                                    <DetailRow
                                        label="Reference Number"
                                        value={
                                            payment.referenceNumber
                                        }
                                    />
                                )}

                                {payment.chapaTransactionReference && (
                                    <DetailRow
                                        label="Chapa Transaction"
                                        value={
                                            payment.chapaTransactionReference
                                        }
                                        last
                                    />
                                )}
                            </Box>
                        </Box>

                        {/* Total */}
                        <Box
                            sx={{
                                mx: {
                                    xs: 3,
                                    sm: 5,
                                },
                                mb: 4,
                                p: 3,
                                borderRadius: 2,
                                bgcolor: '#f7f8fa',
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent:
                                        'space-between',
                                    alignItems: 'center',
                                    gap: 2,
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontWeight: 700,
                                    }}
                                >
                                    Total Paid
                                </Typography>

                                <Typography
                                    sx={{
                                        fontSize: '1.4rem',
                                        fontWeight: 800,
                                    }}
                                >
                                    {formattedAmount} ETB
                                </Typography>
                            </Box>
                        </Box>

                        {/* Footer */}
                        <Box
                            sx={{
                                px: {
                                    xs: 3,
                                    sm: 5,
                                },
                                py: 3,
                                bgcolor: '#fafbfc',
                                borderTop:
                                    '1px solid #e8ebee',
                                textAlign: 'center',
                            }}
                        >
                            <ReceiptLongOutlinedIcon
                                sx={{
                                    color: 'text.secondary',
                                    mb: 0.5,
                                }}
                            />

                            <Typography
                                variant="body2"
                                sx={{
                                    fontWeight: 700,
                                }}
                            >
                                Thank you for using
                                Property Hub
                            </Typography>

                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                This receipt confirms that
                                the payment above was
                                successfully processed.
                            </Typography>

                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                    display: 'block',
                                    mt: 1,
                                }}
                            >
                                Receipt #{payment.id}
                            </Typography>
                        </Box>
                    </Paper>

                    {/* Actions */}
                    <Stack
                        direction={{
                            xs: 'column',
                            sm: 'row',
                        }}
                        spacing={2}
                        sx={{
                            mt: 3,
                            '@media print': {
                                display: 'none',
                            },
                        }}
                    >
                        <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            startIcon={
                                <ReceiptLongOutlinedIcon />
                            }
                            onClick={handlePrintReceipt}
                            sx={{
                                py: 1.4,
                                fontWeight: 700,
                            }}
                        >
                            Download / Print Receipt
                        </Button>

                        <Button
                            fullWidth
                            variant="outlined"
                            size="large"
                            onClick={() =>
                                navigate('/payments')
                            }
                            sx={{
                                py: 1.4,
                                fontWeight: 700,
                            }}
                        >
                            Back to Payments
                        </Button>
                    </Stack>
                </Box>
            )}

            <style>
                {`
                    @media print {
                        @page {
                            size: A4;
                            margin: 12mm;
                        }

                        body {
                            background: #ffffff !important;
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }

                        .property-hub-receipt {
                            width: 100% !important;
                            max-width: 100% !important;
                        }
                    }
                `}
            </style>
        </Box>
    );
};

interface InfoBlockProps {
    label: string;
    value: string;
}

const InfoBlock = ({
    label,
    value,
}: InfoBlockProps) => {
    return (
        <Box>
            <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                    display: 'block',
                    mb: 0.5,
                    fontWeight: 600,
                }}
            >
                {label}
            </Typography>

            <Typography
                variant="body1"
                sx={{
                    fontWeight: 700,
                }}
            >
                {value}
            </Typography>
        </Box>
    );
};

interface DetailRowProps {
    label: string;
    value: string;
    highlight?: boolean;
    last?: boolean;
}

const DetailRow = ({
    label,
    value,
    highlight = false,
    last = false,
}: DetailRowProps) => {
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 2,
                px: 2,
                py: 1.7,
                borderBottom: last
                    ? 'none'
                    : '1px solid',
                borderColor: 'divider',
            }}
        >
            <Typography
                variant="body2"
                color="text.secondary"
            >
                {label}
            </Typography>

            {highlight ? (
                <Chip
                    label={value}
                    size="small"
                    sx={{
                        fontWeight: 700,
                        bgcolor: '#dcfce7',
                        color: '#166534',
                    }}
                />
            ) : (
                <Typography
                    variant="body2"
                    sx={{
                        fontWeight: 700,
                        textAlign: 'right',
                        wordBreak: 'break-word',
                    }}
                >
                    {value}
                </Typography>
            )}
        </Box>
    );
};

export default PaymentSuccessPage;