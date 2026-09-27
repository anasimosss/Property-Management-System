import { AppBar, Box, Container, Toolbar, Typography, IconButton, Menu, MenuItem, Button } from '@mui/material';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { useState } from 'react';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" elevation={0}>
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ flexGrow: 1, cursor: 'pointer' }}
              onClick={() => navigate('/')}
            >
              Property Management
            </Typography>
            
            {user && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button
                  color="inherit"
                  onClick={() => navigate('/properties')}
                >
                  Properties
                </Button>
                <Typography variant="body2" sx={{ display: { xs: 'none', md: 'block' }, ml: 1 }}>
                  {user.firstName} {user.lastName}
                </Typography>
                <IconButton
                  size="large"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenu}
                  color="inherit"
                >
                  <AccountCircle />
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  <MenuItem onClick={() => { handleClose(); navigate('/'); }}>
                    Dashboard
                  </MenuItem>
                  <MenuItem onClick={() => { handleClose(); navigate('/properties'); }}>
                    Properties
                  </MenuItem>
                  <MenuItem onClick={() => { handleClose(); navigate('/reports/financial'); }}>
  Financial Report
</MenuItem>

<MenuItem onClick={() => { handleClose(); navigate('/reports/lease-occupancy'); }}>
  Lease & Occupancy
</MenuItem>

<MenuItem onClick={() => { handleClose(); navigate('/reports/maintenance'); }}>
  Maintenance Report
</MenuItem>
                  <MenuItem onClick={handleClose} disabled>
                    <Typography variant="body2">{user.email}</Typography>
                  </MenuItem>
                  <MenuItem onClick={handleClose} disabled>
                    <Typography variant="caption" color="text.secondary">
                      Role: {user.role}
                    </Typography>
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>
      <Box component="main" sx={{ flexGrow: 1, py: 3 }}>
        <Container maxWidth="lg">
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default MainLayout;
