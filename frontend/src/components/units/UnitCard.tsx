import { Box, Button, Card, CardContent, Chip, Divider, LinearProgress, Stack, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DoorFrontIcon from '@mui/icons-material/DoorFront';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import type { MockUnit, UnitStatus } from '../../data/mockUnits';

interface UnitCardProps {
  unit: MockUnit;
  canEdit: boolean;
  onView: (unit: MockUnit) => void;
  onEdit: (unit: MockUnit) => void;
  onDelete: (unit: MockUnit) => void;
}

const statusColor: Record<UnitStatus, 'success' | 'warning' | 'default'> = {
  Occupied: 'success',
  Vacant: 'default',
  Maintenance: 'warning',
};

const UnitCard = ({ unit, canEdit, onView, onEdit, onDelete }: UnitCardProps) => (
  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
    <CardContent sx={{ p: 2.5, flexGrow: 1, '&:last-child': { pb: 2.5 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1.5, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1.5, minWidth: 0 }}>
          <Box sx={{ display: 'grid', placeItems: 'center', width: 42, height: 42, flexShrink: 0, borderRadius: 2, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
            <DoorFrontIcon />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.3 }}>{unit.unitNumber}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35 }}>{unit.buildingName}</Typography>
          </Box>
        </Box>
        <Chip label={unit.status} color={statusColor[unit.status]} size="small" />
      </Box>

      <Typography variant="body2" sx={{ fontWeight: 600 }}>{unit.propertyName}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{unit.location}</Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5, mb: 2 }}>
        <Box><Typography variant="caption" color="text.secondary">Floor</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{unit.floor}</Typography></Box>
        <Box><Typography variant="caption" color="text.secondary">Type</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{unit.unitType}</Typography></Box>
        <Box><Typography variant="caption" color="text.secondary">Rent / mo.</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>${unit.monthlyRent.toLocaleString()}</Typography></Box>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>{unit.bedrooms} bed · {unit.bathrooms} bath</Typography>
      <LinearProgress variant="determinate" value={unit.status === 'Occupied' ? 100 : 0} color={unit.status === 'Maintenance' ? 'warning' : unit.status === 'Occupied' ? 'success' : 'inherit'} sx={{ height: 7, borderRadius: 4, mb: 0.75 }} />
      <Typography variant="caption" color="text.secondary">
        {unit.status === 'Occupied' ? `Tenant: ${unit.tenantName}` : unit.status === 'Maintenance' ? 'Temporarily unavailable' : 'Available for leasing'}
      </Typography>
    </CardContent>

    <Divider />
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ p: 2 }}>
      <Button fullWidth variant="outlined" size="small" startIcon={<VisibilityOutlinedIcon />} onClick={() => onView(unit)}>View</Button>
      {canEdit && <Button fullWidth variant="outlined" size="small" startIcon={<EditOutlinedIcon />} onClick={() => onEdit(unit)}>Edit</Button>}
      {canEdit && <Button fullWidth variant="text" color="error" size="small" startIcon={<DeleteIcon />} onClick={() => onDelete(unit)}>Delete</Button>}
    </Stack>
  </Card>
);

export default UnitCard;
