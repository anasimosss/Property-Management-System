import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useMediaQuery,
  useTheme,
  Drawer,
  IconButton,
  Collapse,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';

import DashboardIcon from '@mui/icons-material/Dashboard';
import ApartmentIcon from '@mui/icons-material/Apartment';
import BusinessIcon from '@mui/icons-material/Business';
import DoorFrontIcon from '@mui/icons-material/DoorFront';
import PeopleIcon from '@mui/icons-material/People';
import DescriptionIcon from '@mui/icons-material/Description';
import PaymentIcon from '@mui/icons-material/Payment';
import ReceiptIcon from '@mui/icons-material/Receipt';
import BuildIcon from '@mui/icons-material/Build';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuIcon from '@mui/icons-material/Menu';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import DonutLargeOutlinedIcon from '@mui/icons-material/DonutLargeOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useAuth } from '../../context/AuthContext';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import SearchIcon from '@mui/icons-material/Search';


interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
  { label: 'Properties', path: '/properties', icon: <ApartmentIcon /> },
  { label: 'Buildings', path: '/buildings', icon: <BusinessIcon /> },
  { label: 'Units', path: '/units', icon: <DoorFrontIcon /> },
  {
  label: 'Available Units',
  path: '/available-units',
  icon: <SearchIcon />,
},
  {
    label: 'Unit Requests',
    path: '/unit-requests',
    icon: <AssignmentTurnedInIcon />,
  },
  {
  label: 'My Requests',
  path: '/my-unit-requests',
  icon: <AssignmentTurnedInIcon />,
},
  { label: 'Tenants', path: '/tenants', icon: <PeopleIcon /> },
  { label: 'Users', path: '/users', icon: <PeopleIcon /> },
  { label: 'Leases', path: '/leases', icon: <DescriptionIcon /> },
  { label: 'Payments', path: '/payments', icon: <PaymentIcon /> },
  { label: 'Expenses', path: '/expenses', icon: <ReceiptIcon /> },
  {
    label: 'Maintenance',
    path: '/maintenance-requests',
    icon: <BuildIcon />,
  },
];



const reportItems: NavItem[] = [
  {
    label: 'Financial Report',
    path: '/reports/financial',
    icon: <AccountBalanceOutlinedIcon />,
  },
  {
    label: 'Lease & Occupancy',
    path: '/reports/lease-occupancy',
    icon: <DonutLargeOutlinedIcon />,
  },
  {
    label: 'Maintenance Report',
    path: '/reports/maintenance',
    icon: <BuildIcon />,
  },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  mobile?: boolean;
}

const Sidebar = ({ open, onClose, mobile = false }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { user } = useAuth();

  const isAdmin = user?.role === 'Admin';
  const isTenant = user?.role === 'Tenant';

  const hasActiveReport = reportItems.some((item) =>
    location.pathname.startsWith(item.path)
  );

  const [reportsOpen, setReportsOpen] = useState(hasActiveReport);

  const handleNavigate = (path: string) => {
    navigate(path);

    if (mobile) {
      onClose();
    }
  };

  const sidebarContent = (
    <Box
      sx={{
        width: 260,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#1e293b',
        borderRight: isMobile
          ? 'none'
          : '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.2,
          }}
        >
          <img
            src="/Prop%20mgmt%20Sys.svg"
            alt="Property Management"
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '100%',
              objectFit: 'contain',
              display: 'block',
            }}
          />

          <Typography
            variant="h6"
            sx={{
              color: '#fff',
              fontWeight: 1000,
              fontSize: '1.25rem',
            }}
          >
            Property Hub
          </Typography>
        </Box>

        {mobile && (
          <IconButton onClick={onClose} sx={{ color: '#fff' }}>
            <MenuIcon />
          </IconButton>
        )}
      </Box>

      {/* Navigation */}
      <List sx={{ flexGrow: 1, py: 2 }}>
        {navItems
          .filter((item) => {
            // Tenant cannot access these modules.
            if (isTenant) {
  return ![
    '/tenants',
    '/users',
    '/expenses',
    '/unit-requests',
  ].includes(item.path);
}

            // Only Admin can access Users.
            if (item.path === '/users') {
              return isAdmin;
            }

            return true;
          })
          .map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/dashboard' &&
                location.pathname.startsWith(item.path));

            return (
              <ListItem key={item.path} disablePadding sx={{ px: 1 }}>
                <ListItemButton
                  onClick={() => handleNavigate(item.path)}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    mx: 1,
                    py: 1.5,
                    px: 2,
                    bgcolor: isActive
                      ? 'rgba(59, 130, 246, 0.15)'
                      : 'transparent',
                    color: isActive ? '#3b82f6' : '#94a3b8',
                    '&:hover': {
                      bgcolor: isActive
                        ? 'rgba(59, 130, 246, 0.2)'
                        : 'rgba(255, 255, 255, 0.05)',
                      color: isActive ? '#3b82f6' : '#fff',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: 'inherit',
                      minWidth: 40,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>

                  <ListItemText
                    primary={item.label}
                    sx={{
                      '& .MuiTypography-root': {
                        fontWeight: isActive ? 600 : 400,
                        fontSize: '0.875rem',
                      },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}

        {/* Reports */}
        {!isTenant && (
          <>
            <ListItem disablePadding sx={{ px: 1 }}>
              <ListItemButton
                onClick={() =>
                  setReportsOpen((previous) => !previous)
                }
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  mx: 1,
                  py: 1.5,
                  px: 2,
                  bgcolor: hasActiveReport
                    ? 'rgba(59, 130, 246, 0.1)'
                    : 'transparent',
                  color: hasActiveReport
                    ? '#3b82f6'
                    : '#94a3b8',
                  '&:hover': {
                    bgcolor: hasActiveReport
                      ? 'rgba(59, 130, 246, 0.15)'
                      : 'rgba(255, 255, 255, 0.05)',
                    color: hasActiveReport
                      ? '#3b82f6'
                      : '#fff',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <ListItemIcon
                  sx={{
                    color: 'inherit',
                    minWidth: 40,
                  }}
                >
                  <AssessmentOutlinedIcon />
                </ListItemIcon>

                <ListItemText
                  primary="Reports"
                  sx={{
                    '& .MuiTypography-root': {
                      fontWeight: hasActiveReport ? 600 : 400,
                      fontSize: '0.875rem',
                    },
                  }}
                />

                <ExpandMoreIcon
                  sx={{
                    transform: reportsOpen
                      ? 'rotate(180deg)'
                      : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                  }}
                />
              </ListItemButton>
            </ListItem>

            <Collapse
              in={reportsOpen}
              timeout="auto"
              unmountOnExit
            >
              <List disablePadding>
                {reportItems.map((item) => {
                  const isActive =
                    location.pathname.startsWith(item.path);

                  return (
                    <ListItem
                      key={item.path}
                      disablePadding
                      sx={{ px: 1 }}
                    >
                      <ListItemButton
                        onClick={() =>
                          handleNavigate(item.path)
                        }
                        sx={{
                          borderRadius: 2,
                          mb: 0.5,
                          ml: 3,
                          mr: 1,
                          py: 1.25,
                          px: 2,
                          bgcolor: isActive
                            ? 'rgba(59, 130, 246, 0.15)'
                            : 'transparent',
                          color: isActive
                            ? '#3b82f6'
                            : '#94a3b8',
                          '&:hover': {
                            bgcolor: isActive
                              ? 'rgba(59, 130, 246, 0.2)'
                              : 'rgba(255, 255, 255, 0.05)',
                            color: isActive
                              ? '#3b82f6'
                              : '#fff',
                          },
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            color: 'inherit',
                            minWidth: 36,
                          }}
                        >
                          {item.icon}
                        </ListItemIcon>

                        <ListItemText
                          primary={item.label}
                          sx={{
                            '& .MuiTypography-root': {
                              fontWeight: isActive ? 600 : 400,
                              fontSize: '0.8125rem',
                            },
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            </Collapse>
          </>
        )}

        {/* Settings */}
        <ListItem disablePadding sx={{ px: 1 }}>
          <ListItemButton
            onClick={() => handleNavigate('/settings')}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              mx: 1,
              py: 1.5,
              px: 2,
              bgcolor:
                location.pathname === '/settings'
                  ? 'rgba(59, 130, 246, 0.15)'
                  : 'transparent',
              color:
                location.pathname === '/settings'
                  ? '#3b82f6'
                  : '#94a3b8',
              '&:hover': {
                bgcolor:
                  location.pathname === '/settings'
                    ? 'rgba(59, 130, 246, 0.2)'
                    : 'rgba(255, 255, 255, 0.05)',
                color:
                  location.pathname === '/settings'
                    ? '#3b82f6'
                    : '#fff',
              },
              transition: 'all 0.2s ease',
            }}
          >
            <ListItemIcon
              sx={{
                color: 'inherit',
                minWidth: 40,
              }}
            >
              <SettingsIcon />
            </ListItemIcon>

            <ListItemText
              primary="Settings"
              sx={{
                '& .MuiTypography-root': {
                  fontWeight:
                    location.pathname === '/settings'
                      ? 600
                      : 400,
                  fontSize: '0.875rem',
                },
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>

      {/* Footer */}
      <Box
        sx={{
          p: 2,
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: '#64748b',
            textAlign: 'center',
            display: 'block',
          }}
        >
          Property Management v1.0
        </Typography>
      </Box>
    </Box>
  );

  if (mobile) {
    return (
      <Drawer
        anchor="left"
        open={open}
        onClose={onClose}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          '& .MuiDrawer-paper': {
            width: 260,
            boxSizing: 'border-box',
          },
        }}
      >
        {sidebarContent}
      </Drawer>
    );
  }

  return sidebarContent;
};

export default Sidebar;
