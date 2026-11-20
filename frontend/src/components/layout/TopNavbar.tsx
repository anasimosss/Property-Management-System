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
  Alert,
  Button,
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
import PaymentIcon from '@mui/icons-material/Payment';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import BuildIcon from '@mui/icons-material/Build';
import EventIcon from '@mui/icons-material/Event';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

import { propertiesApi } from '../../api/properties';
import { unitsApi } from '../../api/units';
import { tenantsApi } from '../../api/tenants';

import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../../api/notificationApi';

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

interface NotificationItem {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAtUtc: string;
}

const notificationRefreshIntervalMs = 60_000;

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

  const [notificationAnchorEl, setNotificationAnchorEl] =
    useState<null | HTMLElement>(null);

  const [search, setSearch] = useState('');

  const [properties, setProperties] = useState<Property[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);

  const [searchLoading, setSearchLoading] = useState(true);

  const [showSearchResults, setShowSearchResults] =
    useState(false);

  const [notifications, setNotifications] =
    useState<NotificationItem[]>([]);

  const [unreadNotificationCount, setUnreadNotificationCount] =
    useState(0);

  const [notificationsLoading, setNotificationsLoading] =
    useState(false);

  const [notificationsError, setNotificationsError] =
    useState('');

  const [notificationReloadKey, setNotificationReloadKey] =
    useState(0);

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
   * Load unread notification count.
   */
  useEffect(() => {
    if (!user) {
      setUnreadNotificationCount(0);
      setNotifications([]);
      return;
    }

    if (notificationAnchorEl) {
      return;
    }

    let active = true;

    const refreshUnreadCount = async () => {
      try {
        const count = await getUnreadNotificationCount();

        if (active) {
          setUnreadNotificationCount(count);
        }
      } catch (error) {
        console.error(
          'Failed to refresh notification count:',
          error
        );
      }
    };

    refreshUnreadCount();

    const intervalId = window.setInterval(
      refreshUnreadCount,
      notificationRefreshIntervalMs
    );

    window.addEventListener('focus', refreshUnreadCount);

    return () => {
      active = false;
      window.clearInterval(intervalId);
      window.removeEventListener('focus', refreshUnreadCount);
    };
  }, [user, notificationAnchorEl]);

  /*
   * Load notifications when the notification panel opens.
   */
  useEffect(() => {
    if (!notificationAnchorEl || !user) {
      return;
    }

    let active = true;

    const loadNotifications = async () => {
      const isInitialLoad = notifications.length === 0;

      if (isInitialLoad) {
        setNotificationsLoading(true);
      }

      try {
        setNotificationsError('');
        const data = await getNotifications();
        const unreadCount =
          await getUnreadNotificationCount();

        if (active) {
          setNotifications(data);
          setUnreadNotificationCount(unreadCount);
        }
      } catch (error) {
        console.error(
          'Failed to load notifications:',
          error
        );
        if (active) {
          setNotificationsError(
            'Notifications could not be loaded. Check your connection and retry.'
          );
        }
      } finally {
        if (active && isInitialLoad) {
          setNotificationsLoading(false);
        }
      }
    };

    loadNotifications();

    const intervalId = window.setInterval(
      loadNotifications,
      notificationRefreshIntervalMs
    );

    window.addEventListener('focus', loadNotifications);

    return () => {
      active = false;
      window.clearInterval(intervalId);
      window.removeEventListener('focus', loadNotifications);
    };
  }, [
    notificationAnchorEl,
    notificationReloadKey,
    user,
  ]);

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

  const handleNotificationClick = (
    event: React.MouseEvent<HTMLElement>
  ) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
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

  const handleNotificationRead = async (
    notification: NotificationItem
  ) => {
    if (notification.type.toLowerCase() === 'maintenance') {
      handleNotificationClose();
      navigate('/maintenance-requests');
    }

    if (notification.isRead) {
      return;
    }

    try {
      await markNotificationAsRead(notification.id);
      setNotificationsError('');

      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id
            ? { ...item, isRead: true }
            : item
        )
      );

      setUnreadNotificationCount((current) =>
        Math.max(0, current - 1)
      );
    } catch (error) {
      console.error(
        'Failed to mark notification as read:',
        error
      );
      setNotificationsError(
        'That notification could not be updated. Please retry.'
      );
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotificationsError('');

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );

      setUnreadNotificationCount(0);
    } catch (error) {
      console.error(
        'Failed to mark all notifications as read:',
        error
      );
      setNotificationsError(
        'Notifications could not be updated. Please retry.'
      );
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'payment':
        return (
          <PaymentIcon
            sx={{
              color: '#16a34a',
              fontSize: 21,
            }}
          />
        );

      case 'rentduesoon':
        return <EventIcon sx={{ color: '#d97706', fontSize: 21 }} />;

      case 'rentoverdue':
        return <WarningAmberIcon sx={{ color: '#dc2626', fontSize: 21 }} />;

      case 'lease':
        return <HomeWorkIcon sx={{ color: '#2563eb', fontSize: 21 }} />;

      case 'maintenance':
        return <BuildIcon sx={{ color: '#0f766e', fontSize: 21 }} />;

      case 'unit':
        return <DoorFrontIcon sx={{ color: '#16a34a', fontSize: 21 }} />;

      default:
        return (
          <NotificationsNoneIcon
            sx={{
              color: '#2563eb',
              fontSize: 21,
            }}
          />
        );
    }
  };

  const formatNotificationTime = (
    createdAtUtc: string
  ) => {
    const date = new Date(createdAtUtc);

    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
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
          onClick={handleNotificationClick}
          sx={{
            mr: 1,
            color: '#475569',
          }}
        >
          <Badge
            badgeContent={unreadNotificationCount}
            color="error"
            invisible={unreadNotificationCount === 0}
          >
            <NotificationsIcon />
          </Badge>
        </IconButton>

        {/* Notification panel */}
        <Menu
          anchorEl={notificationAnchorEl}
          open={Boolean(notificationAnchorEl)}
          onClose={handleNotificationClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          slotProps={{
            paper: {
              sx: {
                width: {
                  xs: 'calc(100vw - 24px)',
                  sm: 390,
                },
                maxWidth: 390,
                maxHeight: 520,
                mt: 1,
                borderRadius: 2.5,
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
              },
            },
          }}
        >
          {/* Header */}
          <Box
            sx={{
              px: 2,
              py: 1.75,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: '#0f172a',
                }}
              >
                Notifications
              </Typography>

              <Typography
                sx={{
                  fontSize: 12,
                  color: '#64748b',
                  mt: 0.25,
                }}
              >
                {unreadNotificationCount > 0
                  ? `${unreadNotificationCount} unread`
                  : "You're all caught up"}
              </Typography>
            </Box>

            {notifications.some(
              (notification) => !notification.isRead
            ) && (
              <IconButton
                size="small"
                onClick={handleMarkAllAsRead}
                title="Mark all as read"
                sx={{
                  color: '#2563eb',
                }}
              >
                <DoneAllIcon fontSize="small" />
              </IconButton>
            )}
          </Box>

          <Divider />

          {notificationsError && (
            <Alert
              severity="error"
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={() =>
                    setNotificationReloadKey((current) => current + 1)
                  }
                >
                  Retry
                </Button>
              }
              sx={{ borderRadius: 0 }}
            >
              {notificationsError}
            </Alert>
          )}

          {/* Loading */}
          {notificationsLoading && (
            <Box
              sx={{
                py: 5,
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <CircularProgress size={28} />
            </Box>
          )}

          {/* Empty state */}
          {!notificationsLoading &&
            notifications.length === 0 && (
              <Box
                sx={{
                  px: 3,
                  py: 5,
                  textAlign: 'center',
                }}
              >
                <NotificationsNoneIcon
                  sx={{
                    fontSize: 42,
                    color: '#cbd5e1',
                    mb: 1,
                  }}
                />

                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#475569',
                  }}
                >
                  No notifications
                </Typography>

                <Typography
                  sx={{
                    fontSize: 12,
                    color: '#94a3b8',
                    mt: 0.5,
                  }}
                >
                  New updates will appear here.
                </Typography>
              </Box>
            )}

          {/* Notification list */}
          {!notificationsLoading &&
            notifications.length > 0 && (
              <List
                disablePadding
                sx={{
                  maxHeight: 420,
                  overflowY: 'auto',
                }}
              >
                {notifications.map(
                  (notification, index) => (
                    <Box key={notification.id}>
                      <ListItemButton
                        onClick={() =>
                          handleNotificationRead(
                            notification
                          )
                        }
                        sx={{
                          px: 2,
                          py: 1.5,
                          alignItems: 'flex-start',
                          backgroundColor:
                            notification.isRead
                              ? '#ffffff'
                              : '#eff6ff',
                          '&:hover': {
                            backgroundColor:
                              notification.isRead
                                ? '#f8fafc'
                                : '#dbeafe',
                          },
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 40,
                            mt: 0.25,
                          }}
                        >
                          {getNotificationIcon(
                            notification.type
                          )}
                        </ListItemIcon>

                        <ListItemText
                          primary={
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                              }}
                            >
                              <Typography
                                sx={{
                                  fontSize: 13.5,
                                  fontWeight:
                                    notification.isRead
                                      ? 600
                                      : 800,
                                  color: '#0f172a',
                                  flex: 1,
                                }}
                              >
                                {notification.title}
                              </Typography>

                              {!notification.isRead && (
                                <Box
                                  sx={{
                                    width: 7,
                                    height: 7,
                                    borderRadius: '50%',
                                    backgroundColor:
                                      '#2563eb',
                                    flexShrink: 0,
                                  }}
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography
                                sx={{
                                  fontSize: 12.5,
                                  color: '#475569',
                                  lineHeight: 1.5,
                                  mt: 0.5,
                                }}
                              >
                                {notification.message}
                              </Typography>

                              <Typography
                                sx={{
                                  fontSize: 11,
                                  color: '#94a3b8',
                                  mt: 0.75,
                                }}
                              >
                                {formatNotificationTime(
                                  notification.createdAtUtc
                                )}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItemButton>

                      {index <
                        notifications.length - 1 && (
                        <Divider />
                      )}
                    </Box>
                  )
                )}
              </List>
            )}
        </Menu>

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