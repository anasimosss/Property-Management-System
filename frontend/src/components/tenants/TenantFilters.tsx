import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import type { TenantStatus, OccupancyStatus } from '../../data/mockTenants';

export type TenantStatusFilter = TenantStatus | 'All statuses';
export type OccupancyFilter = OccupancyStatus | 'All occupancy';

interface TenantFiltersProps {
  search: string;
  property: string;
  building: string;
  occupancy: OccupancyFilter;
  status: TenantStatusFilter;
  properties: string[];
  buildings: string[];
  onSearchChange: (value: string) => void;
  onPropertyChange: (value: string) => void;
  onBuildingChange: (value: string) => void;
  onOccupancyChange: (value: OccupancyFilter) => void;
  onStatusChange: (value: TenantStatusFilter) => void;
  onClear: () => void;
}

const TenantFilters = ({
  search,
  property,
  building,
  occupancy,
  status,
  properties,
  buildings,
  onSearchChange,
  onPropertyChange,
  onBuildingChange,
  onOccupancyChange,
  onStatusChange,
  onClear,
}: TenantFiltersProps) => {
  const hasFilters = search.length > 0 || property !== 'All properties' || building !== 'All buildings' || occupancy !== 'All occupancy' || status !== 'All statuses';

  return (
    <Box component="form" onSubmit={(event) => event.preventDefault()} sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
      <TextField
        label="Search tenants"
        placeholder="Search tenants..."
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        size="small"
        sx={{ flex: '1 1 230px', minWidth: { xs: '100%', sm: 220 } }}
        slotProps={{ input: { startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} /> } }}
      />
      <FormControl size="small" sx={{ minWidth: { xs: 'calc(50% - 6px)', sm: 185 } }}>
        <InputLabel id="tenant-property-filter-label">Property</InputLabel>
        <Select labelId="tenant-property-filter-label" value={property} label="Property" onChange={(event) => onPropertyChange(event.target.value)}>
          <MenuItem value="All properties">All properties</MenuItem>
          {properties.map((name) => <MenuItem key={name} value={name}>{name}</MenuItem>)}
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: { xs: 'calc(50% - 6px)', sm: 170 } }}>
        <InputLabel id="tenant-building-filter-label">Building</InputLabel>
        <Select labelId="tenant-building-filter-label" value={building} label="Building" onChange={(event) => onBuildingChange(event.target.value)}>
          <MenuItem value="All buildings">All buildings</MenuItem>
          {buildings.map((name) => <MenuItem key={name} value={name}>{name}</MenuItem>)}
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: { xs: 'calc(50% - 6px)', sm: 145 } }}>
        <InputLabel id="tenant-occupancy-filter-label">Occupancy</InputLabel>
        <Select labelId="tenant-occupancy-filter-label" value={occupancy} label="Occupancy" onChange={(event) => onOccupancyChange(event.target.value as OccupancyFilter)}>
          <MenuItem value="All occupancy">All occupancy</MenuItem>
          <MenuItem value="Occupied">Occupied</MenuItem>
          <MenuItem value="Vacant">Vacant</MenuItem>
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: { xs: 'calc(50% - 6px)', sm: 135 } }}>
        <InputLabel id="tenant-status-filter-label">Status</InputLabel>
        <Select labelId="tenant-status-filter-label" value={status} label="Status" onChange={(event) => onStatusChange(event.target.value as TenantStatusFilter)}>
          <MenuItem value="All statuses">All statuses</MenuItem>
          <MenuItem value="Active">Active</MenuItem>
          <MenuItem value="Inactive">Inactive</MenuItem>
        </Select>
      </FormControl>
      {hasFilters && <Button startIcon={<ClearIcon />} onClick={onClear}>Clear filters</Button>}
    </Box>
  );
};

export default TenantFilters;
