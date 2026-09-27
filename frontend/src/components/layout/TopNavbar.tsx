import { useEffect, useMemo, useState } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  IconButton,
  InputBase,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Paper,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress,
} from '@mui/material';

import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import ApartmentIcon from '@mui/icons-material/Apartment';
import DoorFrontIcon from '@mui/icons-material/DoorFront';
import PeopleIcon from '@mui/icons-material/People';

import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

import { propertiesApi } from '../../api/properties';
import { unitsApi } from '../../api/units';
import { tenantsApi } from '../../api/tenants';

import type { Property, Unit, Tenant } from '../../types';

interface TopNavbarProps {
  onMenuClick: () => void;
  pageTitle: string;
}

type SearchResult = {
  id: number;
  title: string;
  subtitle: string;
  type: 'Property' | 'Unit' | 'Tenant';
  path: string;
};

const TopNavbar = ({
  onMenuClick,
  pageTitle,
}: TopNavbarProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [anchorEl, setAnchorEl] =
    useState<null | HTMLElement>(null);

  const [search, setSearch] = useState('');

  const [properties, setProperties] = useState<Property[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);

  const [searchLoading, setSearchLoading] = useState(true);

  const [showSearchResults, setShowSearchResults] =
    useState(false);

  /*
   * Load data used by the global search.
   */
  useEffect(() => {
    const loadSearchData = async () => {
      try {
        setSearchLoading(true);

        const [
          propertiesData,
          unitsData,
          tenantsData,
        ] = await Promise.all([
          propertiesApi.getAll(),
          unitsApi.getAll(),
          tenantsApi.getAll(),
        ]);

        setProperties(propertiesData);
        setUnits(unitsData);
        setTenants(tenantsData);
      } catch (error) {
        console.error(
          'Failed to load global search data:',
          error
        );
      } finally {
        setSearchLoading(false);
      }
    };

    loadSearchData();
  }, []);

  /*
   * Build global search results.
   */
  const searchResults = useMemo<SearchResult[]>(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return [];
    }

    const results: SearchResult[] = [];

    // Properties
    properties.forEach((property) => {
      const searchableText = [
        property.name,
        property.city,
        property.regionOrSubCity,
        property.addressLine1,
        property.addressLine2,
        property.propertyType,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      if (searchableText.includes(query)) {
        results.push({
          id: property.id,
          title: property.name,
          subtitle: [
            property.city,
            property.regionOrSubCity,
            property.propertyType,
          ]
            .filter(Boolean)
            .join(' • '),
          type: 'Property',
          path: `/properties/${property.id}`,
        });
      }
    });

    // Units
    units.forEach((unit) => {
      const searchableText = [
        unit.unitNumber,
        unit.buildingName,
        unit.status,
        String(unit.floor ?? ''),
        String(unit.bedrooms),
        String(unit.bathrooms),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      if (searchableText.includes(query)) {
        results.push({
          id: unit.id,
          title: `Unit ${unit.unitNumber}`,
          subtitle: [
            unit.buildingName,
            unit.status,
            unit.floor != null
              ? `Floor ${unit.floor}`
              : '',
          ]
            .filter(Boolean)
            .join(' • '),
          type: 'Unit',
          path: `/units/${unit.id}`,
        });
      }
    });

    // Tenants
    tenants.forEach((tenant) => {
      const searchableText = [
        tenant.firstName,
        tenant.lastName,
        tenant.email,
        tenant.phoneNumber,
        tenant.emergencyContactName,
        tenant.emergencyContactPhone,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      if (searchableText.includes(query)) {
        results.push({
          id: tenant.id,
          title: `${tenant.firstName} ${tenant.lastName}`,
          subtitle: [
            tenant.email,
            tenant.phoneNumber,
          ]
            .filter(Boolean)
            .join(' • '),
          type: 'Tenant',
          path: `/tenants/${tenant.id}`,
        });
      }
    });

    return results.slice(0, 10);
  }, [search, properties, units, tenants]);

  const handleMenu = (
    event: React.MouseEvent<HTMLElement>
  ) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/login');
  };

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;

    setSearch(value);
    setShowSearchResults(value.trim().length > 0);
  };

  const handleSearchResultClick = (path: string) => {
    setSearch('');
    setShowSearchResults(false);
    navigate(path);
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        /*
         * IMPORTANT:
         * The sidebar is normally 260px wide on desktop.
         *
         * The old version used drawer + 1 z-index,
         * which caused the navbar to cover the sidebar.
         *
         * Now the desktop navbar starts AFTER the sidebar.
         */
        left: {
          xs: 0,
          md: 260,
        },

        width: {
          xs: '100%',
          md: 'calc(100% - 260px)',
        },

        zIndex: (theme) => theme.zIndex.drawer,

        backgroundColor: '#ffffff',
        color: '#1e293b',
        borderBottom: '1px solid #e2e8f0',
      }}
    >
      <Toolbar
        sx={{
          minHeight: '72px !important',
          px: { xs: 2, md: 3 },
        }}
      >
        {/* Mobile menu button */}
        {isMobile && (
          <IconButton
            onClick={onMenuClick}
            sx={{
              mr: 1,
              color: '#334155',
            }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Property Hub branding */}
        {!isMobile && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              minWidth: 220,
              mr: 2,
            }}
          >
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 1.5,
                backgroundColor: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 1.25,
                flexShrink: 0,
              }}
            >
              <ApartmentIcon
                sx={{
                  color: '#ffffff',
                  fontSize: 22,
                }}
              />
            </Box>

            <Typography
              sx={{
                fontSize: 18,
                fontWeight: 800,
                color: '#0f172a',
                letterSpacing: '-0.3px',
                whiteSpace: 'nowrap',
              }}
            >
              Property Hub
            </Typography>
          </Box>
        )}

        {/* Page title */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            fontSize: { xs: 18, md: 20 },
            minWidth: {
              xs: 'auto',
              md: 120,
            },
            whiteSpace: 'nowrap',
          }}
        >
          {pageTitle}
        </Typography>

        {/* Global search */}
        {!isMobile && (
          <Box
            sx={{
              position: 'relative',
              flex: 1,
              maxWidth: 500,
              ml: 4,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 2,
                px: 1.5,
                height: 42,
                transition: 'all 0.2s ease',
                '&:focus-within': {
                  borderColor: '#2563eb',
                  backgroundColor: '#ffffff',
                  boxShadow:
                    '0 0 0 3px rgba(37, 99, 235, 0.08)',
                },
              }}
            >
              <SearchIcon
                sx={{
                  color: '#64748b',
                  mr: 1,
                  fontSize: 21,
                }}
              />

              <InputBase
                fullWidth
                placeholder="Search properties, units, tenants..."
                value={search}
                onChange={handleSearchChange}
                onFocus={() => {
                  if (search.trim()) {
                    setShowSearchResults(true);
                  }
                }}
                sx={{
                  fontSize: 14,
                }}
              />

              {searchLoading && (
                <CircularProgress
                  size={18}
                  sx={{
                    ml: 1,
                    color: '#2563eb',
                  }}
                />
              )}
            </Box>

            {/* Search results */}
            {showSearchResults && search.trim() && (
              <Paper
                elevation={8}
                sx={{
                  position: 'absolute',
                  top: 48,
                  left: 0,
                  right: 0,
                  borderRadius: 2,
                  overflow: 'hidden',
                  zIndex: 20,
                  border: '1px solid #e2e8f0',
                }}
              >
                {searchResults.length === 0 ? (
                  <Box
                    sx={{
                      px: 2,
                      py: 2.5,
                      textAlign: 'center',
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      No properties, units, or tenants found.
                    </Typography>
                  </Box>
                ) : (
                  <List
                    disablePadding
                    sx={{
                      maxHeight: 420,
                      overflowY: 'auto',
                    }}
                  >
                    {searchResults.map(
                      (result, index) => (
                        <Box
                          key={`${result.type}-${result.id}`}
                        >
                          <ListItemButton
                            onClick={() =>
                              handleSearchResultClick(
                                result.path
                              )
                            }
                            sx={{
                              px: 2,
                              py: 1.25,
                              '&:hover': {
                                backgroundColor:
                                  '#f8fafc',
                              },
                            }}
                          >
                            <ListItemIcon
                              sx={{
                                minWidth: 42,
                              }}
                            >
                              {result.type ===
                                'Property' && (
                                  <ApartmentIcon
                                    sx={{
                                      color: '#2563eb',
                                    }}
                                  />
                                )}

                              {result.type === 'Unit' && (
                                <DoorFrontIcon
                                  sx={{
                                    color: '#16a34a',
                                  }}
                                />
                              )}

                              {result.type === 'Tenant' && (
                                <PeopleIcon
                                  sx={{
                                    color: '#9333ea',
                                  }}
                                />
                              )}
                            </ListItemIcon>

                            <ListItemText
                              primary={
                                <Typography
                                  sx={{
                                    fontSize: 14,
                                    fontWeight: 600,
                                  }}
                                >
                                  {result.title}
                                </Typography>
                              }
                              secondary={
                                <Typography
                                  sx={{
                                    fontSize: 12,
                                    color: '#64748b',
                                    mt: 0.25,
                                  }}
                                >
                                  {result.subtitle}
                                </Typography>
                              }
                            />

                            <Typography
                              sx={{
                                fontSize: 11,
                                color: '#94a3b8',
                                ml: 1,
                              }}
                            >
                              {result.type}
                            </Typography>
                          </ListItemButton>

                          {index <
                            searchResults.length - 1 && (
                              <Divider />
                            )}
                        </Box>
                      )
                    )}
                  </List>
                )}
              </Paper>
            )}
          </Box>
        )}

        {/* Spacer */}
        <Box sx={{ flex: 1 }} />

        {/* Notifications */}
        <IconButton
          sx={{
            mr: 1,
            color: '#475569',
          }}
        >
          <Badge
            badgeContent={3}
            color="error"
          >
            <NotificationsIcon />
          </Badge>
        </IconButton>

        {/* User menu */}
        <IconButton
          onClick={handleMenu}
          sx={{
            p: 0.5,
          }}
        >
          {user ? (
            <Avatar
              sx={{
                width: 36,
                height: 36,
                fontSize: 14,
                fontWeight: 700,
                backgroundColor: '#2563eb',
              }}
            >
              {user.firstName?.[0]}
              {user.lastName?.[0]}
            </Avatar>
          ) : (
            <AccountCircle />
          )}
        </IconButton>

        {/* Account menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem disabled>
            {user
              ? `${user.firstName} ${user.lastName}`
              : 'Account'}
          </MenuItem>

          <Divider />

          <MenuItem
            onClick={() => {
              handleClose();
              navigate('/settings');
            }}
          >
            Settings
          </MenuItem>

          <MenuItem onClick={handleLogout}>
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default TopNavbar;