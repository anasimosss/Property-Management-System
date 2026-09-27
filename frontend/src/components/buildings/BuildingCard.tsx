import { Box, Button, Card, CardContent, Chip, Divider, LinearProgress, Stack, Typography } from '@mui/material';
import ApartmentIcon from '@mui/icons-material/Apartment';
import DeleteIcon from '@mui/icons-material/Delete';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import type { BuildingStatus, MockBuilding } from '../../data/mockBuildings';

interface BuildingCardProps {
  building: MockBuilding;
  canEdit: boolean;
  onView: (building: MockBuilding) => void;
  onEdit: (building: MockBuilding) => void;
  onDelete: (building: MockBuilding) => void;
}

const statusColor: Record<BuildingStatus, 'success' | 'warning' | 'default'> = {
  Active: 'success',
  'Needs attention': 'warning',
  Inactive: 'default',
};

const BuildingCard = ({ building, canEdit, onView, onEdit, onDelete }: BuildingCardProps) => {
  const occupancy = Math.round((building.occupiedUnits / building.totalUnits) * 100);

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ p: 2.5, flexGrow: 1, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1.5, mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 1.5, minWidth: 0 }}>
            <Box sx={{ display: 'grid', placeItems: 'center', width: 42, height: 42, flexShrink: 0, borderRadius: 2, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
              <ApartmentIcon />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.3 }}>{building.name}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35 }}>{building.propertyName}</Typography>
            </Box>
          </Box>
          <Chip label={building.status} color={statusColor[building.status]} size="small" />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{building.location}</Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5, mb: 2.5 }}>
          <Box><Typography variant="caption" color="text.secondary">Floors</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{building.floors}</Typography></Box>
          <Box><Typography variant="caption" color="text.secondary">Units</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{building.totalUnits}</Typography></Box>
          <Box><Typography variant="caption" color="text.secondary">Occupied</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{building.occupiedUnits}</Typography></Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, mb: 0.75 }}>
          <Typography variant="body2" color="text.secondary">Occupancy</Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>{occupancy}%</Typography>
        </Box>
        <LinearProgress variant="determinate" value={occupancy} sx={{ height: 7, borderRadius: 4, mb: 0.75 }} />
        <Typography variant="caption" color="text.secondary">{building.occupiedUnits} / {building.totalUnits} units occupied</Typography>
      </CardContent>

      <Divider />
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ p: 2 }}>
        <Button fullWidth variant="outlined" size="small" startIcon={<VisibilityOutlinedIcon />} onClick={() => onView(building)}>View</Button>
        {canEdit && <Button fullWidth variant="outlined" size="small" startIcon={<EditOutlinedIcon />} onClick={() => onEdit(building)}>Edit</Button>}
        {canEdit && <Button fullWidth variant="text" color="error" size="small" startIcon={<DeleteIcon />} onClick={() => onDelete(building)}>Delete</Button>}
      </Stack>
    </Card>
  );
};

export default BuildingCard;
