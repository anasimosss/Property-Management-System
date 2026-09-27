import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ApartmentIcon from '@mui/icons-material/Apartment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAuth } from '../context/AuthContext';
import type { RegisterRequest } from '../types';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState<RegisterRequest>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });

  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(formData);
      navigate('/', { replace: true });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Registration failed'
      );
    } finally {
      setLoading(false);
    }
  };

  const isValid =
    Boolean(formData.email) &&
    Boolean(formData.password) &&
    formData.password.length >= 6 &&
    Boolean(formData.firstName) &&
    Boolean(formData.lastName);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'linear-gradient(135deg, #f8fafc 0%, #eef4ff 50%, #f8fafc 100%)',
        py: { xs: 3, md: 5 },
        px: 2,
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Brand */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.2,
              mb: 3,
            }}
          >
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'primary.main',
                color: 'common.white',
                boxShadow: '0 8px 20px rgba(59, 130, 246, 0.22)',
              }}
            >
              <ApartmentIcon />
            </Box>

            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                letterSpacing: '-0.4px',
                color: 'text.primary',
              }}
            >
              Property Hub
            </Typography>
          </Box>

          {/* Registration Card */}
          <Paper
            elevation={0}
            sx={{
              width: '100%',
              p: { xs: 3, sm: 4.5 },
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'background.paper',
              boxShadow: '0 20px 60px rgba(15, 23, 42, 0.08)',
            }}
          >
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 3.5 }}>
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 800,
                  letterSpacing: '-0.7px',
                  color: 'text.primary',
                  mb: 1,
                }}
              >
                Create your account
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  lineHeight: 1.6,
                  maxWidth: 400,
                  mx: 'auto',
                }}
              >
                Get started with Property Hub and manage your
                property operations in one place.
              </Typography>
            </Box>

            {/* Error */}
            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  borderRadius: 2,
                }}
              >
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              {/* Name fields */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, minmax(0, 1fr))',
                  },
                  gap: 2,
                }}
              >
                <TextField
                  fullWidth
                  label="First name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  autoComplete="given-name"
                  autoFocus
                  disabled={loading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label="Last name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  autoComplete="family-name"
                  disabled={loading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Box>

              {/* Email */}
              <TextField
                fullWidth
                label="Email address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                margin="normal"
                required
                autoComplete="email"
                disabled={loading}
                sx={{
                  mt: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />

              {/* Password */}
              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                margin="normal"
                required
                autoComplete="new-password"
                disabled={loading}
                error={
                  formData.password.length > 0 &&
                  formData.password.length < 6
                }
                helperText={
                  formData.password.length > 0 &&
                    formData.password.length < 6
                    ? 'Password must contain at least 6 characters'
                    : 'Use at least 6 characters'
                }
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() =>
                            setShowPassword((current) => !current)
                          }
                          edge="end"
                          disabled={loading}
                          aria-label={
                            showPassword
                              ? 'Hide password'
                              : 'Show password'
                          }
                        >
                          {showPassword ? (
                            <VisibilityOffIcon />
                          ) : (
                            <VisibilityIcon />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />

              {/* Benefits */}
              <Box
                sx={{
                  mt: 2.5,
                  p: 2,
                  borderRadius: 2.5,
                  backgroundColor: 'rgba(59, 130, 246, 0.05)',
                  border: '1px solid rgba(59, 130, 246, 0.10)',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 1,
                  }}
                >
                  <CheckCircleIcon
                    sx={{
                      fontSize: 19,
                      color: 'primary.main',
                    }}
                  />

                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: 'text.primary',
                    }}
                  >
                    Your Property Hub account
                  </Typography>
                </Box>

                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    display: 'block',
                    pl: 3.5,
                    lineHeight: 1.6,
                  }}
                >
                  Manage properties, tenants, leases, payments,
                  maintenance, and more from one platform.
                </Typography>
              </Box>

              {/* Submit */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={!isValid || loading}
                sx={{
                  mt: 3,
                  py: 1.35,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: 'none',
                  },
                }}
              >
                {loading ? (
                  <CircularProgress
                    size={24}
                    color="inherit"
                  />
                ) : (
                  'Create account'
                )}
              </Button>
            </form>

            {/* Login */}
            <Box
              sx={{
                mt: 3,
                pt: 2.5,
                borderTop: '1px solid',
                borderColor: 'divider',
                textAlign: 'center',
              }}
            >
              <Typography
                variant="body2"
                sx={{ color: 'text.secondary' }}
              >
                Already have an account?{' '}
                <Link
                  to="/login"
                  style={{
                    color: '#1976d2',
                    textDecoration: 'none',
                    fontWeight: 700,
                  }}
                >
                  Sign in
                </Link>
              </Typography>
            </Box>
          </Paper>

          {/* Footer */}
          <Typography
            variant="caption"
            sx={{
              mt: 2.5,
              color: 'text.secondary',
              textAlign: 'center',
            }}
          >
            Property Hub · Property Management Platform
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default RegisterPage;