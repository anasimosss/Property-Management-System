import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Apartment,
  ArrowForward,
  Security,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import type { LoginRequest } from '../types';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: '',
  });

  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/';

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
      await login(formData);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const isValid = formData.email && formData.password;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        backgroundColor: '#f8fafc',
      }}
    >
      {/* Left Branding Section */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          width: '48%',
          minHeight: '100vh',
          position: 'relative',
          overflow: 'hidden',
          background:
            'linear-gradient(145deg, #0f172a 0%, #172554 55%, #1e3a8a 100%)',
          color: 'white',
          alignItems: 'center',
          justifyContent: 'center',
          p: 6,
        }}
      >
        {/* Decorative shapes */}
        <Box
          sx={{
            position: 'absolute',
            width: 420,
            height: 420,
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.04)',
            top: -180,
            right: -150,
          }}
        />

        <Box
          sx={{
            position: 'absolute',
            width: 300,
            height: 300,
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.035)',
            bottom: -130,
            left: -100,
          }}
        />

        <Box sx={{ position: 'relative', maxWidth: 520, zIndex: 1 }}>
          {/* Logo */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              mb: 6,
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              <Apartment sx={{ fontSize: 28 }} />
            </Box>

            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                letterSpacing: '-0.02em',
              }}
            >
              PropertyHub
            </Typography>
          </Box>

          <Typography
            sx={{
              fontSize: { md: '2.8rem', lg: '3.4rem' },
              lineHeight: 1.12,
              fontWeight: 700,
              letterSpacing: '-0.04em',
              mb: 3,
            }}
          >
            Manage your properties
            <br />
            <Box component="span" sx={{ opacity: 0.65 }}>
              with confidence.
            </Box>
          </Typography>

          <Typography
            sx={{
              fontSize: '1.05rem',
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.68)',
              maxWidth: 450,
            }}
          >
            A modern platform for managing properties, buildings, units,
            tenants, leases, payments, expenses, and maintenance — all in one
            place.
          </Typography>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              mt: 6,
              color: 'rgba(255,255,255,0.65)',
            }}
          >
            <Security sx={{ fontSize: 20 }} />
            <Typography variant="body2">
              Secure access to your property management workspace
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Login Section */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 2.5, sm: 4 },
          py: 5,
        }}
      >
        <Container maxWidth="xs" disableGutters>
          {/* Mobile Logo */}
          <Box
            sx={{
              display: { xs: 'flex', md: 'none' },
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.2,
              mb: 5,
            }}
          >
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'primary.main',
                color: 'white',
              }}
            >
              <Apartment />
            </Box>

            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: 'text.primary',
              }}
            >
              PropertyHub
            </Typography>
          </Box>

          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 4.5 },
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'background.paper',
            }}
          >
            {/* Heading */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 700,
                  letterSpacing: '-0.03em',
                  mb: 1,
                }}
              >
                Welcome back
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ lineHeight: 1.6 }}
              >
                Sign in to continue to your property management dashboard.
              </Typography>
            </Box>

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
              <TextField
                fullWidth
                label="Email address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                autoFocus
                disabled={loading}
                sx={{
                  mb: 2.2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />

              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                disabled={loading}
                sx={{
                  mb: 1.5,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword((prev) => !prev)}
                          edge="end"
                          disabled={loading}
                          aria-label={
                            showPassword
                              ? 'Hide password'
                              : 'Show password'
                          }
                        >
                          {showPassword ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  mb: 3,
                }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ cursor: 'default' }}
                >
                  Secure login
                </Typography>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={!isValid || loading}
                endIcon={
                  !loading ? <ArrowForward sx={{ fontSize: 18 }} /> : null
                }
                sx={{
                  height: 52,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: 'none',
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={23} color="inherit" />
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <Divider sx={{ my: 3.5 }} />

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  style={{
                    textDecoration: 'none',
                    fontWeight: 600,
                  }}
                >
                  Create an account
                </Link>
              </Typography>
            </Box>
          </Paper>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: 'block',
              textAlign: 'center',
              mt: 3,
            }}
          >
            © {new Date().getFullYear()} PropertyHub. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default LoginPage;