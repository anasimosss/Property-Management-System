import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DeleteIcon from '@mui/icons-material/Delete';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PaymentOutlinedIcon from '@mui/icons-material/PaymentOutlined';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import type { LeaseStatus, MockLease } from '../../data/mockLeases';

interface LeaseCardProps {
  lease: MockLease;
  canEdit: boolean;
  onView: (lease: MockLease) => void;
  onEdit: (lease: MockLease) => void;
  onDelete: (lease: MockLease) => void;
  onPayRent?: (lease: MockLease) => void;
}

const statusColor: Record<
  LeaseStatus,
  'success' | 'warning' | 'error' | 'info'
> = {
  Active: 'success',
  'Expiring Soon': 'warning',
  Expired: 'error',
  Pending: 'info',
};

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

const LeaseCard = ({
  lease,
  canEdit,
  onView,
  onEdit,
  onDelete,
  onPayRent,
}: LeaseCardProps) => (
  <Card
    sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      border:
        lease.status === 'Expiring Soon'
          ? '1px solid #f59e0b'
          : undefined,
    }}
  >
    <CardContent
      sx={{
        p: 2.5,
        flexGrow: 1,
        '&:last-child': { pb: 2.5 },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 1.5,
          mb: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            gap: 1.5,
            minWidth: 0,
          }}
        >
          <Box
            sx={{
              display: 'grid',
              placeItems: 'center',
              width: 42,
              height: 42,
              flexShrink: 0,
              borderRadius: 2,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
            }}
          >
            <ReceiptLongIcon />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                lineHeight: 1.3,
              }}
            >
              {lease.leaseNumber}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.35 }}
            >
              {lease.tenantName}
            </Typography>
          </Box>
        </Box>

        <Chip
          label={lease.status}
          color={statusColor[lease.status]}
          size="small"
        />
      </Box>

      <Typography
        variant="body2"
        sx={{ fontWeight: 600 }}
      >
        {lease.propertyName}
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 2 }}
      >
        {lease.buildingName} · Unit {lease.unitNumber}
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 1.5,
          mb: 2,
        }}
      >
        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
          >
            Monthly rent
          </Typography>

          <Typography
            variant="body2"
            sx={{ fontWeight: 600 }}
          >
            ${lease.monthlyRent.toLocaleString()}
          </Typography>
        </Box>

        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
          >
            Deposit
          </Typography>

          <Typography
            variant="body2"
            sx={{ fontWeight: 600 }}
          >
            ${lease.securityDeposit.toLocaleString()}
          </Typography>
        </Box>

        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
          >
            Start date
          </Typography>

          <Typography
            variant="body2"
            sx={{ fontWeight: 600 }}
          >
            {formatDate(lease.startDate)}
          </Typography>
        </Box>

        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
          >
            End date
          </Typography>

          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color:
                lease.status === 'Expiring Soon'
                  ? 'warning.dark'
                  : undefined,
            }}
          >
            {formatDate(lease.endDate)}
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          gap: 1,
          alignItems: 'center',
        }}
      >
        <CalendarMonthIcon
          sx={{
            fontSize: 18,
            color: 'text.secondary',
          }}
        />

        <Typography
          variant="caption"
          color="text.secondary"
        >
          Rent due on day {lease.dueDay} each month
        </Typography>
      </Box>
    </CardContent>

    <Divider />

    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1}
      sx={{ p: 2 }}
    >
      <Button
        fullWidth
        variant="outlined"
        size="small"
        startIcon={<VisibilityOutlinedIcon />}
        onClick={() => onView(lease)}
      >
        View
      </Button>

      {canEdit && (
        <Button
          fullWidth
          variant="outlined"
          size="small"
          startIcon={<EditOutlinedIcon />}
          onClick={() => onEdit(lease)}
        >
          Edit
        </Button>
      )}

      {canEdit && (
        <Button
          fullWidth
          variant="text"
          color="error"
          size="small"
          startIcon={<DeleteIcon />}
          onClick={() => onDelete(lease)}
        >
          Delete
        </Button>
      )}

      {onPayRent && lease.status === 'Active' && (
        <Button
          fullWidth
          variant="contained"
          color="primary"
          size="small"
          startIcon={<PaymentOutlinedIcon />}
          onClick={() => onPayRent(lease)}
        >
          Pay Rent
        </Button>
      )}
    </Stack>
  </Card>
);

export default LeaseCard;