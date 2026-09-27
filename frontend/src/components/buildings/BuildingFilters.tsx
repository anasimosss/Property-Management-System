import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import type { BuildingStatus } from '../../data/mockBuildings';

export type BuildingStatusFilter = BuildingStatus | 'All statuses';

interface BuildingFiltersProps {
  search: string;
  property: string;
  status: BuildingStatusFilter;
  properties: string[];
  onSearchChange: (value: string) => void;
  onPropertyChange: (value: string) => void;
  onStatusChange: (value: BuildingStatusFilter) => void;
  onClear: () => void;
}

const BuildingFilters = ({
  search,
  property,
  status,
  properties,
  onSearchChange,
  onPropertyChange,
  onStatusChange,
  onClear,
}: BuildingFiltersProps) => {
  const hasFilters = search.length > 0 || property !== 'All properties' || status !== 'All statuses';

  return (
    <Box
      component="form"
      onSubmit={(event) => event.preventDefault()}
      sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}
    >
      <TextField
        label="Search buildings"
        placeholder="Search buildings..."
        value={search}
        onInput={(event) => onSearchChange((event.target as HTMLInputElement).value)}
        size="small"
        sx={{ flex: '1 1 250px', minWidth: { xs: '100%', sm: 230 } }}
        slotProps={{ input: { startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} /> } }}
      />
      <FormControl size="small" sx={{ minWidth: { xs: 'calc(50% - 6px)', sm: 205 } }}>
        <InputLabel id="building-property-filter-label">Property</InputLabel>
        <Select
          labelId="building-property-filter-label"
          value={property}
          label="Property"
          onChange={(event) => onPropertyChange(event.target.value)}
        >
          <MenuItem value="All properties">All properties</MenuItem>
          {properties.map((propertyName) => <MenuItem key={propertyName} value={propertyName}>{propertyName}</MenuItem>)}
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: { xs: 'calc(50% - 6px)', sm: 160 } }}>
        <InputLabel id="building-status-filter-label">Status</InputLabel>
        <Select
          labelId="building-status-filter-label"
          value={status}
          label="Status"
          onChange={(event) => onStatusChange(event.target.value as BuildingStatusFilter)}
        >
          <MenuItem value="All statuses">All statuses</MenuItem>
          <MenuItem value="Active">Active</MenuItem>
          <MenuItem value="Needs attention">Needs attention</MenuItem>
          <MenuItem value="Inactive">Inactive</MenuItem>
        </Select>
      </FormControl>
      {hasFilters && <Button startIcon={<ClearIcon />} onClick={onClear}>Clear filters</Button>}
    </Box>
  );
};

export default BuildingFilters;
