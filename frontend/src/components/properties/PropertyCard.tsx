import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  LinearProgress,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import ApartmentIcon from '@mui/icons-material/Apartment';
import DeleteIcon from '@mui/icons-material/Delete';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import type {
  MockProperty,
  PropertyStatus,
} from '../../data/mockProperties';

interface PropertyCardProps {
  property: MockProperty;
  canEdit: boolean;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const statusColor: Record<
  PropertyStatus,
  'success' | 'warning' | 'default'
> = {
  Active: 'success',
  'Needs attention': 'warning',
  Inactive: 'default',
};

const PropertyCard = ({
  property,
  canEdit,
  onView,
  onEdit,
  onDelete,
}: PropertyCardProps) => {
  const theme = useTheme();

  const occupancy =
    property.totalUnits > 0
      ? Math.round(
        (property.occupiedUnits / property.totalUnits) * 100
      )
      : 0;

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'background.paper',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 3,
        boxShadow: 'none',
      }}
    >
      <CardContent
        sx={{
          p: 2.5,
          flexGrow: 1,
          '&:last-child': {
            pb: 2.5,
          },
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
              <ApartmentIcon />
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  lineHeight: 1.3,
                  color: 'text.primary',
                }}
              >
                {property.name}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  mt: 0.35,
                  color: 'text.secondary',
                }}
              >
                {property.location}
              </Typography>
            </Box>
          </Box>

          <Chip
            label={property.status}
            color={statusColor[property.status]}
            size="small"
          />
        </Box>

        <Typography
          variant="body2"
          sx={{
            mb: 2,
            color: 'text.secondary',
          }}
        >
          {property.address}
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 1.5,
            mb: 2.5,
          }}
        >
          <Box>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary' }}
            >
              Type
            </Typography>

            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: 'text.primary',
              }}
            >
              {property.type}
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary' }}
            >
              Buildings
            </Typography>

            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: 'text.primary',
              }}
            >
              {property.buildings}
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary' }}
            >
              Income / mo.
            </Typography>

            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: 'text.primary',
              }}
            >
              ${property.monthlyIncome.toLocaleString()}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 1,
            mb: 0.75,
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: 'text.secondary' }}
          >
            Occupancy
          </Typography>

          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: 'text.primary',
            }}
          >
            {occupancy}%
          </Typography>
        </Box>

        <LinearProgress
          variant="determinate"
          value={occupancy}
          sx={{
            height: 7,
            borderRadius: 4,
            mb: 0.75,
            backgroundColor:
              theme.palette.action.hover,
          }}
        />

        <Typography
          variant="caption"
          sx={{ color: 'text.secondary' }}
        >
          {property.occupiedUnits} / {property.totalUnits} units
          occupied
        </Typography>
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
          onClick={() => onView(property.id)}
        >
          View
        </Button>

        {canEdit && (
          <Button
            fullWidth
            variant="outlined"
            size="small"
            startIcon={<EditOutlinedIcon />}
            onClick={() => onEdit(property.id)}
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
            onClick={() => onDelete(property.id)}
          >
            Delete
          </Button>
        )}
      </Stack>
    </Card>
  );
};

export default PropertyCard;