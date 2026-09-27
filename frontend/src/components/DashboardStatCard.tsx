import { Box, Paper, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface DashboardStatCardProps {
  title: string;
  value: string | number;
  detail?: string;
  icon: ReactNode;
  color?: string;
}

const DashboardStatCard = ({
  title,
  value,
  detail,
  icon,
  color = '#3b82f6',
}: DashboardStatCardProps) => {
  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        height: '100%',
        border: '1px solid #e2e8f0',
        boxShadow: 'none',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 1 }}
          >
            {title}
          </Typography>

          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            {value}
          </Typography>
          {detail && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
              {detail}
            </Typography>
          )}
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 36,
            color,
            bgcolor: `${color}18`,
            borderRadius: 2,
            width: 52,
            height: 52,
          }}
        >
          {icon}
        </Box>
      </Box>
    </Paper>
  );
};

export default DashboardStatCard;