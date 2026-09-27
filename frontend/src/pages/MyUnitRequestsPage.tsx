import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Typography,
} from '@mui/material';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import ApartmentIcon from '@mui/icons-material/Apartment';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { unitRequestsApi } from '../api/unitRequests';
import type { UnitRequestResponse } from '../api/unitRequests';

const MyUnitRequestsPage = () => {
  const [requests, setRequests] = useState<UnitRequestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadRequests = async () => {
      try {
        setLoading(true);
        setError('');

        const data = await unitRequestsApi.getMy();
        setRequests(data);
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            'Failed to load your unit requests.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, []);

  const getStatusColor = (
    status: UnitRequestResponse['status']
  ): 'warning' | 'success' | 'error' => {
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
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: 300 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 300,
          }}
        >
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      {/* Page Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          mb: 3,
        }}
      >
        <AssignmentTurnedInIcon
          sx={{
            fontSize: 36,
            color: 'primary.main',
          }}
        />

        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700 }}
          >
            My Unit Requests
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Track the units you have requested.
          </Typography>
        </Box>
      </Box>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Empty State */}
      {!error && requests.length === 0 && (
        <Card>
          <CardContent
            sx={{
              py: 6,
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
              sx={{ fontWeight: 600 }}
            >
              No unit requests yet
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1 }}
            >
              You have not requested any units yet.
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Requests */}
      <Grid container spacing={3}>
        {requests.map((request) => (
          <Grid
            key={request.id}
            size={{ xs: 12, md: 6, lg: 4 }}
          >
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <CardContent>
                {/* Unit */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <HomeWorkIcon color="primary" />

                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700 }}
                    >
                      Unit {request.unitNumber}
                    </Typography>
                  </Box>

                  <Chip
                    label={request.status}
                    color={getStatusColor(request.status)}
                    size="small"
                  />
                </Box>

                {/* Building */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 1.5,
                  }}
                >
                  <ApartmentIcon
                    fontSize="small"
                    color="action"
                  />

                  <Typography variant="body2">
                    {request.buildingName}
                  </Typography>
                </Box>

                {/* Rent */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 1.5,
                  }}
                >
                  <AttachMoneyIcon
                    fontSize="small"
                    color="action"
                  />

                  <Typography variant="body2">
                    {request.targetRent.toLocaleString()} ETB / month
                  </Typography>
                </Box>

                {/* Request Date */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 2,
                  }}
                >
                  <CalendarTodayIcon
                    fontSize="small"
                    color="action"
                  />

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Requested {formatDate(request.createdAtUtc)}
                  </Typography>
                </Box>

                {/* Message */}
                {request.message && (
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 1,
                      bgcolor: 'action.hover',
                      mb: 2,
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      Your message
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{ mt: 0.5 }}
                    >
                      {request.message}
                    </Typography>
                  </Box>
                )}

                {/* Rejection Reason */}
                {request.status === 'Rejected' &&
                  request.rejectionReason && (
                    <Alert severity="error">
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600 }}
                      >
                        Rejection reason
                      </Typography>

                      <Typography variant="body2">
                        {request.rejectionReason}
                      </Typography>
                    </Alert>
                  )}

                {/* Review Information */}
                {request.reviewedAtUtc && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: 'block',
                      mt: 2,
                    }}
                  >
                    Reviewed {formatDate(request.reviewedAtUtc)}
                    {request.reviewedByName
                      ? ` by ${request.reviewedByName}`
                      : ''}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default MyUnitRequestsPage;