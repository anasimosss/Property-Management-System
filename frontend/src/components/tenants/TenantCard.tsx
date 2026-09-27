import { Avatar, Box, Button, Card, CardContent, Chip, Divider, Stack, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PeopleIcon from '@mui/icons-material/People';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import type { MockTenant, TenantStatus } from '../../data/mockTenants';

interface TenantCardProps {
  tenant: MockTenant;
  canEdit: boolean;
  onView: (tenant: MockTenant) => void;
  onEdit: (tenant: MockTenant) => void;
  onDelete: (tenant: MockTenant) => void;
}

const statusColor: Record<TenantStatus, 'success' | 'default'> = {
  Active: 'success',
  Inactive: 'default',
};

const TenantCard = ({ tenant, canEdit, onView, onEdit, onDelete }: TenantCardProps) => {
  const initials = tenant.fullName.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ p: 2.5, flexGrow: 1, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1.5, mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 1.5, minWidth: 0 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 44, height: 44 }}>{initials || <PeopleIcon />}</Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.3 }}>{tenant.fullName}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35 }}>{tenant.email}</Typography>
            </Box>
          </Box>
          <Chip label={tenant.status} color={statusColor[tenant.status]} size="small" />
        </Box>

        <Stack spacing={0.5} sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">{tenant.phone}</Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>{tenant.propertyName}</Typography>
          <Typography variant="body2" color="text.secondary">{tenant.buildingName} · Unit {tenant.unitNumber}</Typography>
        </Stack>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5, mb: 2 }}>
          <Box><Typography variant="caption" color="text.secondary">Monthly rent</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>${tenant.monthlyRent.toLocaleString()}</Typography></Box>
          <Box><Typography variant="caption" color="text.secondary">Move-in date</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{new Date(tenant.moveInDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</Typography></Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip label={tenant.leaseStatus} size="small" color={tenant.leaseStatus === 'Expired' ? 'warning' : 'primary'} variant="outlined" />
          <Chip label={tenant.occupancyStatus} size="small" color="success" variant="outlined" />
        </Box>
      </CardContent>

      <Divider />
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ p: 2 }}>
        <Button fullWidth variant="outlined" size="small" startIcon={<VisibilityOutlinedIcon />} onClick={() => onView(tenant)}>View</Button>
        {canEdit && <Button fullWidth variant="outlined" size="small" startIcon={<EditOutlinedIcon />} onClick={() => onEdit(tenant)}>Edit</Button>}
        {canEdit && <Button fullWidth variant="text" color="error" size="small" startIcon={<DeleteIcon />} onClick={() => onDelete(tenant)}>Delete</Button>}
      </Stack>
    </Card>
  );
};

export default TenantCard;
