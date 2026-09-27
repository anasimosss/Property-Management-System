import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';

const PublicLayout = () => {
  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: 'grey.50',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Outlet />
    </Box>
  );
};

export default PublicLayout;
