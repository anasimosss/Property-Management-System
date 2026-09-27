import { useState } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';

const DashboardLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const getPageTitle = () => {
    const path = location.pathname;

    if (path === '/' || path === '/dashboard') return 'Dashboard';
    if (path.startsWith('/properties')) return 'Properties';
    if (path.startsWith('/buildings')) return 'Buildings';
    if (path.startsWith('/units')) return 'Units';
    if (path.startsWith('/tenants')) return 'Tenants';
    if (path.startsWith('/leases')) return 'Leases';
    if (path.startsWith('/payments')) return 'Payments';
    if (path.startsWith('/expenses')) return 'Expenses';
    if (path.startsWith('/maintenance')) return 'Maintenance';
    if (path.startsWith('/reports')) return 'Reports';
    if (path.startsWith('/settings')) return 'Settings';

    return 'Dashboard';
  };

  return (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        minHeight: '100vh',
        margin: 0,
        padding: 0,
        bgcolor: 'background.default',
        overflow: 'hidden',
      }}
    >
      {/* Mobile Sidebar */}
      {isMobile && (
        <Sidebar
          open={mobileOpen}
          onClose={handleDrawerToggle}
          mobile
        />
      )}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sidebar
          open={true}
          onClose={() => { }}
        />
      )}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          minWidth: 0,
          minHeight: '100vh',
          margin: 0,
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          bgcolor: 'background.default',
        }}
      >
        <TopNavbar
          onMenuClick={handleDrawerToggle}
          pageTitle={getPageTitle()}
        />

        {/* Page Content */}
        <Box
          sx={{
            flexGrow: 1,
            width: '100%',
            minWidth: 0,
            boxSizing: 'border-box',
            margin: 0,
            padding: {
              xs: 2,
              sm: 3,
              md: 3,
            },
            mt: '64px',
            overflow: 'auto',
            bgcolor: 'background.default',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;