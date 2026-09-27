import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import type { LeaseStatus } from '../../data/mockLeases';

export type LeaseStatusFilter = LeaseStatus | 'All statuses';

interface LeaseFiltersProps {
  search: string;
  property: string;
  building: string;
  status: LeaseStatusFilter;
  properties: string[];
  buildings: string[];
  onSearchChange: (value: string) => void;
  onPropertyChange: (value: string) => void;
  onBuildingChange: (value: string) => void;
  onStatusChange: (value: LeaseStatusFilter) => void;
  onClear: () => void;
}

const LeaseFilters = ({
  search,
  property,
  building,
  status,
  properties,
  buildings,
  onSearchChange,
  onPropertyChange,
  onBuildingChange,
  onStatusChange,
  onClear,
}: LeaseFiltersProps) => {
  const hasFilters = search.length > 0 || property !== 'All properties' || building !== 'All buildings' || status !== 'All statuses';

  return (
    <Box component="form" onSubmit={(event) => event.preventDefault()} sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
      <TextField
        label="Search leases"
        placeholder="Search leases..."
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        size="small"
        sx={{ flex: '1 1 240px', minWidth: { xs: '100%', sm: 230 } }}
        slotProps={{ input: { startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} /> } }}
      />
      <FormControl size="small" sx={{ minWidth: { xs: 'calc(50% - 6px)', sm: 190 } }}>
        <InputLabel id="lease-property-filter-label">Property</InputLabel>
        <Select labelId="lease-property-filter-label" value={property} label="Property" onChange={(event) => onPropertyChange(event.target.value)}>
          <MenuItem value="All properties">All properties</MenuItem>
          {properties.map((name) => <MenuItem key={name} value={name}>{name}</MenuItem>)}
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: { xs: 'calc(50% - 6px)', sm: 180 } }}>
        <InputLabel id="lease-building-filter-label">Building</InputLabel>
        <Select labelId="lease-building-filter-label" value={building} label="Building" onChange={(event) => onBuildingChange(event.target.value)}>
          <MenuItem value="All buildings">All buildings</MenuItem>
          {buildings.map((name) => <MenuItem key={name} value={name}>{name}</MenuItem>)}
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: { xs: 'calc(50% - 6px)', sm: 155 } }}>
        <InputLabel id="lease-status-filter-label">Lease status</InputLabel>
        <Select labelId="lease-status-filter-label" value={status} label="Lease status" onChange={(event) => onStatusChange(event.target.value as LeaseStatusFilter)}>
          <MenuItem value="All statuses">All statuses</MenuItem>
          <MenuItem value="Active">Active</MenuItem>
          <MenuItem value="Expiring Soon">Expiring Soon</MenuItem>
          <MenuItem value="Pending">Pending</MenuItem>
          <MenuItem value="Expired">Expired</MenuItem>
        </Select>
      </FormControl>
      {hasFilters && <Button startIcon={<ClearIcon />} onClick={onClear}>Clear filters</Button>}
    </Box>
  );
};

export default LeaseFilters;
