import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  useTheme,
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import type { PropertyStatus, PropertyType } from '../../data/mockProperties';

export type PropertyTypeFilter = PropertyType | 'All types';
export type PropertyStatusFilter = PropertyStatus | 'All statuses';

interface PropertyFiltersProps {
  search: string;
  type: PropertyTypeFilter;
  status: PropertyStatusFilter;
  onSearchChange: (value: string) => void;
  onTypeChange: (value: PropertyTypeFilter) => void;
  onStatusChange: (value: PropertyStatusFilter) => void;
  onClear: () => void;
}

const PropertyFilters = ({
  search,
  type,
  status,
  onSearchChange,
  onTypeChange,
  onStatusChange,
  onClear,
}: PropertyFiltersProps) => {
  const theme = useTheme();

  const hasFilters =
    search.length > 0 ||
    type !== 'All types' ||
    status !== 'All statuses';

  return (
    <Box
      component="form"
      onSubmit={(event) => event.preventDefault()}
      sx={{
        display: 'flex',
        gap: 1.5,
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      <TextField
        label="Search properties"
        placeholder="Search properties..."
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        size="small"
        sx={{
          flex: '1 1 260px',
          minWidth: { xs: '100%', sm: 240 },
        }}
        slotProps={{
          input: {
            startAdornment: (
              <SearchIcon
                sx={{
                  mr: 1,
                  color: theme.palette.text.secondary,
                }}
              />
            ),
          },
        }}
      />

      <FormControl
        size="small"
        sx={{
          minWidth: { xs: 'calc(50% - 6px)', sm: 150 },
        }}
      >
        <InputLabel id="property-type-filter-label">
          Property type
        </InputLabel>

        <Select
          labelId="property-type-filter-label"
          value={type}
          label="Property type"
          onChange={(event) =>
            onTypeChange(
              event.target.value as PropertyTypeFilter
            )
          }
        >
          <MenuItem value="All types">All types</MenuItem>
          <MenuItem value="Residential">Residential</MenuItem>
          <MenuItem value="Commercial">Commercial</MenuItem>
          <MenuItem value="Mixed">Mixed</MenuItem>
        </Select>
      </FormControl>

      <FormControl
        size="small"
        sx={{
          minWidth: { xs: 'calc(50% - 6px)', sm: 155 },
        }}
      >
        <InputLabel id="property-status-filter-label">
          Status
        </InputLabel>

        <Select
          labelId="property-status-filter-label"
          value={status}
          label="Status"
          onChange={(event) =>
            onStatusChange(
              event.target.value as PropertyStatusFilter
            )
          }
        >
          <MenuItem value="All statuses">All statuses</MenuItem>
          <MenuItem value="Active">Active</MenuItem>
          <MenuItem value="Needs attention">
            Needs attention
          </MenuItem>
          <MenuItem value="Inactive">Inactive</MenuItem>
        </Select>
      </FormControl>

      {hasFilters && (
        <Button
          startIcon={<ClearIcon />}
          onClick={onClear}
          sx={{
            whiteSpace: 'nowrap',
            color: 'text.secondary',
          }}
        >
          Clear filters
        </Button>
      )}
    </Box>
  );
};

export default PropertyFilters;