import type { ReactNode } from 'react';
import { Box, Paper, Typography, useTheme } from '@mui/material';

interface PropertySummaryCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  color: string;
}

const PropertySummaryCard = ({
  label,
  value,
  icon,
  color,
}: PropertySummaryCardProps) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: 'background.paper',
        boxShadow: 'none',
        height: '100%',
        borderRadius: 3,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="body2"
            sx={{
              mb: 1,
              color: 'text.secondary',
            }}
          >
            {label}
          </Typography>

          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: 'text.primary',
            }}
          >
            {value}
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            placeItems: 'center',
            width: 44,
            height: 44,
            flexShrink: 0,
            color,
            bgcolor: `${color}18`,
            borderRadius: 2,
          }}
        >
          {icon}
        </Box>
      </Box>
    </Paper>
  );
};

export default PropertySummaryCard;