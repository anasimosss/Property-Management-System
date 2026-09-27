import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  TextField,
  Typography,
} from '@mui/material';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import PersonIcon from '@mui/icons-material/Person';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import ApartmentIcon from '@mui/icons-material/Apartment';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';

import {
  unitRequestsApi,
  type UnitRequestResponse,
} from '../api/unitRequests';

const UnitRequestsPage = () => {
  const navigate = useNavigate();

  const [requests, setRequests] = useState<UnitRequestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [selectedRequest, setSelectedRequest] =
    useState<UnitRequestResponse | null>(null);

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingId, setProcessingId] = useState<number | null>(null);

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await unitRequestsApi.getAll();

      setRequests(data);
    } catch (err: any) {
      console.error('Failed to load unit requests:', err);

      setError(
        err?.response?.data?.message ||
          'Failed to load unit requests. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRequests();
  }, []);

  const pendingCount = useMemo(
    () =>
      requests.filter(
        (request) => request.status === 'Pending'
      ).length,
    [requests]
  );

  const approvedCount = useMemo(
    () =>
      requests.filter(
        (request) => request.status === 'Approved'
      ).length,
    [requests]
  );

  const rejectedCount = useMemo(
    () =>
      requests.filter(
        (request) => request.status === 'Rejected'
      ).length,
    [requests]
  );

  const handleApprove = async (
    request: UnitRequestResponse
  ) => {
    try {
      setProcessingId(request.id);
      setError('');
      setSuccess('');

      const updated =
        await unitRequestsApi.approve(request.id);

      setRequests((currentRequests) =>
        currentRequests.map((item) =>
          item.id === updated.id ? updated : item
        )
      );

      setSuccess(
        `Unit ${request.unitNumber} request from ${request.tenantName} has been approved.`
      );
    } catch (err: any) {
      console.error(
        'Failed to approve unit request:',
        err
      );

      setError(
        err?.response?.data?.message ||
          'Failed to approve the unit request. Please try again.'
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleCreateLease = (
    request: UnitRequestResponse
  ) => {
    const params = new URLSearchParams({
      unitId: String(request.unitId),
      tenantId: String(request.tenantId),
      rentAmount: String(request.targetRent),
    });

    navigate(`/leases/create?${params.toString()}`);
  };

  const openRejectDialog = (
    request: UnitRequestResponse
  ) => {
    setSelectedRequest(request);
    setRejectionReason('');
    setRejectDialogOpen(true);
    setError('');
    setSuccess('');
  };

  const closeRejectDialog = () => {
    if (processingId !== null) {
      return;
    }

    setRejectDialogOpen(false);
    setSelectedRequest(null);
    setRejectionReason('');
  };

  const handleReject = async () => {
    if (!selectedRequest) {
      return;
    }

    try {
      setProcessingId(selectedRequest.id);
      setError('');
      setSuccess('');

      const updated =
        await unitRequestsApi.reject(
          selectedRequest.id,
          {
            rejectionReason:
              rejectionReason.trim() || null,
          }
        );

      setRequests((currentRequests) =>
        currentRequests.map((item) =>
          item.id === updated.id ? updated : item
        )
      );

      setRejectDialogOpen(false);

      setSuccess(
        `Unit ${selectedRequest.unitNumber} request from ${selectedRequest.tenantName} has been rejected.`
      );

      setSelectedRequest(null);
      setRejectionReason('');
    } catch (err: any) {
      console.error(
        'Failed to reject unit request:',
        err
      );

      setError(
        err?.response?.data?.message ||
          'Failed to reject the unit request. Please try again.'
      );
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (
    status: UnitRequestResponse['status']
  ) => {
    switch (status) {
      case 'Approved':
        return 'success';

      case 'Rejected':
        return 'error';

      default:
        return 'warning';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(
      undefined,
      {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }
    );
  };

  return (
    <Container
      maxWidth="xl"
      sx={{
        py: { xs: 2, md: 4 },
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 700,
            mb: 1,
          }}
        >
          Unit Requests
        </Typography>

        <Typography color="text.secondary">
          Review tenant requests for available units and
          manage their status.
        </Typography>
      </Box>

      {/* Alerts */}
      {success && (
        <Alert
          severity="success"
          sx={{ mb: 3 }}
          onClose={() => setSuccess('')}
        >
          {success}
        </Alert>
      )}

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      {/* Summary */}
      {!loading && (
        <Grid
          container
          spacing={2}
          sx={{ mb: 4 }}
        >
          <Grid
            size={{
              xs: 12,
              sm: 4,
            }}
          >
            <Card
              sx={{
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <CardContent>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Pending Requests
                </Typography>

                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700 }}
                >
                  {pendingCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 4,
            }}
          >
            <Card
              sx={{
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <CardContent>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Approved
                </Typography>

                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700 }}
                >
                  {approvedCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 4,
            }}
          >
            <Card
              sx={{
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <CardContent>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Rejected
                </Typography>

                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700 }}
                >
                  {rejectedCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Loading */}
      {loading && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            py: 10,
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {/* Empty */}
      {!loading && !error && requests.length === 0 && (
        <Card
          sx={{
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <CardContent
            sx={{
              py: 8,
              textAlign: 'center',
            }}
          >
            <HomeWorkIcon
              sx={{
                fontSize: 56,
                color: 'text.secondary',
                mb: 2,
              }}
            />

            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                mb: 1,
              }}
            >
              No unit requests
            </Typography>

            <Typography color="text.secondary">
              Tenant unit requests will appear here.
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Requests */}
      {!loading && requests.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {requests.map((request) => (
            <Card
              key={request.id}
              sx={{
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 2,
                    flexWrap: 'wrap',
                    mb: 2,
                  }}
                >
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700 }}
                    >
                      Unit {request.unitNumber}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Request #{request.id}
                    </Typography>
                  </Box>

                  <Chip
                    label={request.status}
                    color={getStatusColor(
                      request.status
                    )}
                    size="small"
                  />
                </Box>

                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={3}>
                  {/* Tenant */}
                  <Grid
                    size={{
                      xs: 12,
                      md: 4,
                    }}
                  >
                    <Typography
                      variant="overline"
                      color="text.secondary"
                    >
                      Tenant
                    </Typography>

                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mt: 0.5,
                      }}
                    >
                      <PersonIcon fontSize="small" />

                      <Typography
                        sx={{ fontWeight: 600 }}
                      >
                        {request.tenantName}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mt: 0.5,
                      }}
                    >
                      <EmailOutlinedIcon fontSize="small" />

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          overflowWrap: 'anywhere',
                        }}
                      >
                        {request.tenantEmail}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Unit */}
                  <Grid
                    size={{
                      xs: 12,
                      md: 4,
                    }}
                  >
                    <Typography
                      variant="overline"
                      color="text.secondary"
                    >
                      Unit
                    </Typography>

                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mt: 0.5,
                      }}
                    >
                      <ApartmentIcon fontSize="small" />

                      <Typography
                        sx={{ fontWeight: 600 }}
                      >
                        {request.buildingName}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mt: 0.5,
                      }}
                    >
                      <AttachMoneyIcon fontSize="small" />

                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        ETB{' '}
                        {request.targetRent.toLocaleString()}{' '}
                        / month
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Request date */}
                  <Grid
                    size={{
                      xs: 12,
                      md: 4,
                    }}
                  >
                    <Typography
                      variant="overline"
                      color="text.secondary"
                    >
                      Requested
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.5,
                        fontWeight: 600,
                      }}
                    >
                      {formatDate(
                        request.createdAtUtc
                      )}
                    </Typography>

                    {request.reviewedAtUtc && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        Reviewed{' '}
                        {formatDate(
                          request.reviewedAtUtc
                        )}
                        {request.reviewedByName
                          ? ` by ${request.reviewedByName}`
                          : ''}
                      </Typography>
                    )}
                  </Grid>
                </Grid>

                {/* Tenant message */}
                {request.message && (
                  <Box
                    sx={{
                      mt: 3,
                      p: 2,
                      borderRadius: 2,
                      bgcolor: 'action.hover',
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 0.5 }}
                    >
                      Tenant message
                    </Typography>

                    <Typography variant="body2">
                      {request.message}
                    </Typography>
                  </Box>
                )}

                {/* Rejection reason */}
                {request.rejectionReason && (
                  <Box
                    sx={{
                      mt: 2,
                      p: 2,
                      borderRadius: 2,
                      bgcolor: 'error.lighter',
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="error"
                      sx={{ mb: 0.5 }}
                    >
                      Rejection reason
                    </Typography>

                    <Typography variant="body2">
                      {request.rejectionReason}
                    </Typography>
                  </Box>
                )}

                {/* Actions */}
                {request.status === 'Pending' && (
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      gap: 1.5,
                      mt: 3,
                      flexWrap: 'wrap',
                    }}
                  >
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={
                        <CancelOutlinedIcon />
                      }
                      onClick={() =>
                        openRejectDialog(request)
                      }
                      disabled={
                        processingId === request.id
                      }
                    >
                      Reject
                    </Button>

                    <Button
                      variant="contained"
                      color="success"
                      startIcon={
                        <CheckCircleIcon />
                      }
                      onClick={() =>
                        handleApprove(request)
                      }
                      disabled={
                        processingId === request.id
                      }
                    >
                      {processingId === request.id
                        ? 'Processing...'
                        : 'Approve'}
                    </Button>
                  </Box>
                )}

                {/* Create Lease */}
                {request.status === 'Approved' && (
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      mt: 3,
                    }}
                  >
                    <Button
                      variant="contained"
                      startIcon={
                        <DescriptionOutlinedIcon />
                      }
                      onClick={() =>
                        handleCreateLease(request)
                      }
                    >
                      Create Lease
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Reject dialog */}
      <Dialog
        open={rejectDialogOpen}
        onClose={closeRejectDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Reject Unit Request
        </DialogTitle>

        <DialogContent>
          {selectedRequest && (
            <Box sx={{ pt: 1 }}>
              <Typography
                sx={{
                  fontWeight: 600,
                  mb: 1,
                }}
              >
                Unit {selectedRequest.unitNumber}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 3 }}
              >
                Tenant: {selectedRequest.tenantName}
                <br />
                Email: {selectedRequest.tenantEmail}
              </Typography>

              <TextField
                fullWidth
                multiline
                minRows={4}
                label="Rejection reason (optional)"
                placeholder="Explain why this request cannot be approved..."
                value={rejectionReason}
                onChange={(event) =>
                  setRejectionReason(
                    event.target.value
                  )
                }
                slotProps={{
                  htmlInput: {
                    maxLength: 500,
                  },
                }}
                helperText={`${rejectionReason.length}/500`}
              />
            </Box>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 3,
          }}
        >
          <Button
            onClick={closeRejectDialog}
            disabled={processingId !== null}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={handleReject}
            disabled={
              processingId !== null ||
              !selectedRequest
            }
          >
            {processingId !== null
              ? 'Rejecting...'
              : 'Reject Request'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UnitRequestsPage;
