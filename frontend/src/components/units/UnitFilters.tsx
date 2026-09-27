import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import type { UnitStatus } from '../../data/mockUnits';

export type UnitStatusFilter = UnitStatus | 'All statuses';

interface UnitFiltersProps {
  search: string;
  property: string;
  building: string;
  status: UnitStatusFilter;
  properties: string[];
  buildings: string[];
  onSearchChange: (value: string) => void;
  onPropertyChange: (value: string) => void;
  onBuildingChange: (value: string) => void;
  onStatusChange: (value: UnitStatusFilter) => void;
  onClear: () => void;
}

const UnitFilters = ({
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
}: UnitFiltersProps) => {
  const hasFilters = search.length > 0 || property !== 'All properties' || building !== 'All buildings' || status !== 'All statuses';

  return (
    <Box component="form" onSubmit={(event) => event.preventDefault()} sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
      <TextField
        label="Search units"
        placeholder="Search units..."
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        size="small"
        sx={{ flex: '1 1 230px', minWidth: { xs: '100%', sm: 220 } }}
        slotProps={{ input: { startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} /> } }}
      />
      <FormControl size="small" sx={{ minWidth: { xs: 'calc(50% - 6px)', sm: 190 } }}>
        <InputLabel id="unit-property-filter-label">Property</InputLabel>
        <Select labelId="unit-property-filter-label" value={property} label="Property" onChange={(event) => onPropertyChange(event.target.value)}>
          <MenuItem value="All properties">All properties</MenuItem>
          {properties.map((propertyName) => <MenuItem key={propertyName} value={propertyName}>{propertyName}</MenuItem>)}
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: { xs: 'calc(50% - 6px)', sm: 180 } }}>
        <InputLabel id="unit-building-filter-label">Building</InputLabel>
        <Select labelId="unit-building-filter-label" value={building} label="Building" onChange={(event) => onBuildingChange(event.target.value)}>
          <MenuItem value="All buildings">All buildings</MenuItem>
          {buildings.map((buildingName) => <MenuItem key={buildingName} value={buildingName}>{buildingName}</MenuItem>)}
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: { xs: 'calc(50% - 6px)', sm: 150 } }}>
        <InputLabel id="unit-status-filter-label">Status</InputLabel>
        <Select labelId="unit-status-filter-label" value={status} label="Status" onChange={(event) => onStatusChange(event.target.value as UnitStatusFilter)}>
          <MenuItem value="All statuses">All statuses</MenuItem>
          <MenuItem value="Occupied">Occupied</MenuItem>
          <MenuItem value="Vacant">Vacant</MenuItem>
          <MenuItem value="Maintenance">Maintenance</MenuItem>
        </Select>
      </FormControl>
      {hasFilters && <Button startIcon={<ClearIcon />} onClick={onClear}>Clear filters</Button>}
    </Box>
  );
};

export default UnitFilters;
