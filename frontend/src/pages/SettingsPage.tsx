import { useEffect, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    Paper,
    Switch,
    TextField,
    Typography,
} from '@mui/material';

import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

import { useThemeMode } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/auth';

const SettingsPage = () => {
    const { user, updateUser } = useAuth();
    const { themeMode, setThemeMode } = useThemeMode();

    const [emailNotifications, setEmailNotifications] = useState(() => {
        const saved = localStorage.getItem('settings_email_notifications');
        return saved === null ? true : saved === 'true';
    });

    const [maintenanceNotifications, setMaintenanceNotifications] = useState(() => {
        const saved = localStorage.getItem(
            'settings_maintenance_notifications'
        );

        return saved === null ? true : saved === 'true';
    });

    const [saved, setSaved] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);
    const [saveError, setSaveError] = useState('');

    const [firstName, setFirstName] = useState(user?.firstName ?? '');
    const [lastName, setLastName] = useState(user?.lastName ?? '');
    const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber ?? '');

    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [changingPassword, setChangingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');

    useEffect(() => {
        setFirstName(user?.firstName ?? '');
        setLastName(user?.lastName ?? '');
        setPhoneNumber(user?.phoneNumber ?? '');
    }, [user]);

    useEffect(() => {
        localStorage.setItem(
            'settings_email_notifications',
            String(emailNotifications)
        );
    }, [emailNotifications]);

    useEffect(() => {
        localStorage.setItem(
            'settings_maintenance_notifications',
            String(maintenanceNotifications)
        );
    }, [maintenanceNotifications]);

    const handleSavePreferences = async () => {
        if (!firstName.trim() || !lastName.trim()) {
            setSaveError('First name and last name are required.');
            setSaved(false);
            return;
        }

        setSavingProfile(true);
        setSaveError('');
        setSaved(false);

        try {
            const updatedUser = await authApi.updateProfile({
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                phoneNumber: phoneNumber.trim() || null,
            });

            updateUser(updatedUser);
            setSaved(true);

            window.setTimeout(() => {
                setSaved(false);
            }, 3000);
        } catch (error) {
            setSaveError(
                error instanceof Error
                    ? error.message
                    : 'Failed to save your profile.'
            );
        } finally {
            setSavingProfile(false);
        }
    };

    const handleOpenPasswordDialog = () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
        setPasswordError('');
        setPasswordSuccess('');
        setPasswordDialogOpen(true);
    };

    const handleClosePasswordDialog = () => {
        if (changingPassword) {
            return;
        }

        setPasswordDialogOpen(false);
    };

    const handleChangePassword = async () => {
        setPasswordError('');
        setPasswordSuccess('');

        if (!currentPassword) {
            setPasswordError('Please enter your current password.');
            return;
        }

        if (!newPassword) {
            setPasswordError('Please enter a new password.');
            return;
        }

        if (newPassword.length < 8) {
            setPasswordError(
                'New password must be at least 8 characters long.'
            );
            return;
        }

        if (!confirmNewPassword) {
            setPasswordError('Please confirm your new password.');
            return;
        }

        if (newPassword !== confirmNewPassword) {
            setPasswordError(
                'New password and confirmation do not match.'
            );
            return;
        }

        if (currentPassword === newPassword) {
            setPasswordError(
                'New password must be different from your current password.'
            );
            return;
        }

        setChangingPassword(true);

        try {
            const response = await authApi.changePassword({
                currentPassword,
                newPassword,
                confirmNewPassword,
            });

            setPasswordSuccess(response.message);

            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');

            window.setTimeout(() => {
                setPasswordDialogOpen(false);
                setPasswordSuccess('');
            }, 1500);
        } catch (error) {
            setPasswordError(
                error instanceof Error
                    ? error.message
                    : 'Failed to change your password.'
            );
        } finally {
            setChangingPassword(false);
        }
    };

    return (
        <Box
            sx={(theme) => ({
                width: '100%',
                minWidth: 0,
                px: { xs: 2, sm: 3, lg: 4 },
                py: { xs: 2, sm: 3 },
                backgroundColor: theme.palette.background.default,
                color: theme.palette.text.primary,
            })}
        >
            {/* Page Header */}
            <Box sx={{ mb: 3 }}>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                    }}
                >
                    <Box
                        sx={{
                            width: 44,
                            height: 44,
                            borderRadius: 3,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background:
                                'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                            color: '#fff',
                            flexShrink: 0,
                        }}
                    >
                        <PersonOutlineOutlinedIcon />
                    </Box>

                    <Box>
                        <Typography
                            variant="h5"
                            sx={(theme) => ({
                                fontWeight: 700,
                                color: theme.palette.text.primary,
                            })}
                        >
                            Settings
                        </Typography>

                        <Typography
                            variant="body2"
                            sx={(theme) => ({
                                color: theme.palette.text.secondary,
                                mt: 0.5,
                            })}
                        >
                            Manage your profile and application preferences.
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Profile Alerts */}
            {saved && (
                <Alert
                    severity="success"
                    sx={{
                        mb: 2.5,
                        borderRadius: 2,
                    }}
                >
                    Your profile has been updated successfully.
                </Alert>
            )}

            {saveError && (
                <Alert
                    severity="error"
                    sx={{
                        mb: 2.5,
                        borderRadius: 2,
                    }}
                >
                    {saveError}
                </Alert>
            )}

            {/* Profile */}
            <Paper
                elevation={0}
                sx={(theme) => ({
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 3,
                    overflow: 'hidden',
                    mb: 3,
                })}
            >
                <Box
                    sx={(theme) => ({
                        px: { xs: 2, sm: 3 },
                        py: 2,
                        backgroundColor:
                            theme.palette.mode === 'dark'
                                ? '#172033'
                                : '#f8fafc',
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                    })}
                >
                    <PersonOutlineOutlinedIcon
                        sx={{ color: 'primary.main' }}
                    />

                    <Box>
                        <Typography
                            sx={(theme) => ({
                                fontWeight: 700,
                                color: theme.palette.text.primary,
                            })}
                        >
                            Profile Information
                        </Typography>

                        <Typography
                            variant="caption"
                            sx={(theme) => ({
                                color: theme.palette.text.secondary,
                            })}
                        >
                            Update your personal information.
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ p: { xs: 2, sm: 3 } }}>
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: '1fr',
                                sm: '1fr 1fr',
                            },
                            gap: 2.5,
                        }}
                    >
                        <TextField
                            fullWidth
                            label="First Name"
                            value={firstName}
                            onChange={(event) => {
                                setFirstName(event.target.value);
                                setSaveError('');
                                setSaved(false);
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Last Name"
                            value={lastName}
                            onChange={(event) => {
                                setLastName(event.target.value);
                                setSaveError('');
                                setSaved(false);
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Email"
                            value={user?.email ?? ''}
                            disabled
                            helperText="Email address cannot be changed here."
                        />

                        <TextField
                            fullWidth
                            label="Phone Number"
                            value={phoneNumber}
                            onChange={(event) => {
                                setPhoneNumber(event.target.value);
                                setSaveError('');
                                setSaved(false);
                            }}
                        />
                    </Box>
                </Box>

                <Divider />

                <Box
                    sx={{
                        px: { xs: 2, sm: 3 },
                        py: 2,
                        display: 'flex',
                        justifyContent: 'flex-end',
                    }}
                >
                    <Button
                        variant="contained"
                        startIcon={
                            savingProfile ? (
                                <CircularProgress size={18} color="inherit" />
                            ) : (
                                <SaveOutlinedIcon />
                            )
                        }
                        onClick={handleSavePreferences}
                        disabled={savingProfile}
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            px: 2.5,
                        }}
                    >
                        {savingProfile ? 'Saving...' : 'Save Changes'}
                    </Button>
                </Box>
            </Paper>

            {/* Security */}
            <Paper
                elevation={0}
                sx={(theme) => ({
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 3,
                    overflow: 'hidden',
                    mb: 3,
                })}
            >
                <Box
                    sx={(theme) => ({
                        px: { xs: 2, sm: 3 },
                        py: 2,
                        backgroundColor:
                            theme.palette.mode === 'dark'
                                ? '#172033'
                                : '#f8fafc',
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                    })}
                >
                    <SecurityOutlinedIcon
                        sx={{ color: 'primary.main' }}
                    />

                    <Box>
                        <Typography
                            sx={(theme) => ({
                                fontWeight: 700,
                                color: theme.palette.text.primary,
                            })}
                        >
                            Security
                        </Typography>

                        <Typography
                            variant="caption"
                            sx={(theme) => ({
                                color: theme.palette.text.secondary,
                            })}
                        >
                            Manage your account security.
                        </Typography>
                    </Box>
                </Box>

                <Box
                    sx={{
                        p: { xs: 2, sm: 3 },
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 2,
                    }}
                >
                    <Box>
                        <Typography
                            sx={(theme) => ({
                                fontWeight: 600,
                                color: theme.palette.text.primary,
                            })}
                        >
                            Password
                        </Typography>

                        <Typography
                            variant="body2"
                            sx={(theme) => ({
                                color: theme.palette.text.secondary,
                                mt: 0.5,
                            })}
                        >
                            Change your account password.
                        </Typography>
                    </Box>

                    <Button
                        variant="outlined"
                        startIcon={<LockOutlinedIcon />}
                        onClick={handleOpenPasswordDialog}
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            flexShrink: 0,
                        }}
                    >
                        Change Password
                    </Button>
                </Box>
            </Paper>

            {/* Notifications */}
            <Paper
                elevation={0}
                sx={(theme) => ({
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 3,
                    overflow: 'hidden',
                    mb: 3,
                })}
            >
                <Box
                    sx={(theme) => ({
                        px: { xs: 2, sm: 3 },
                        py: 2,
                        backgroundColor:
                            theme.palette.mode === 'dark'
                                ? '#172033'
                                : '#f8fafc',
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                    })}
                >
                    <NotificationsNoneOutlinedIcon
                        sx={{ color: 'primary.main' }}
                    />

                    <Box>
                        <Typography
                            sx={(theme) => ({
                                fontWeight: 700,
                                color: theme.palette.text.primary,
                            })}
                        >
                            Notifications
                        </Typography>

                        <Typography
                            variant="caption"
                            sx={(theme) => ({
                                color: theme.palette.text.secondary,
                            })}
                        >
                            Choose which notifications you receive.
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ px: { xs: 2, sm: 3 } }}>
                    <Box
                        sx={{
                            py: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 2,
                        }}
                    >
                        <Box>
                            <Typography
                                sx={(theme) => ({
                                    fontWeight: 600,
                                    color: theme.palette.text.primary,
                                })}
                            >
                                Email Notifications
                            </Typography>

                            <Typography
                                variant="body2"
                                sx={(theme) => ({
                                    color: theme.palette.text.secondary,
                                    mt: 0.5,
                                })}
                            >
                                Receive important updates by email.
                            </Typography>
                        </Box>

                        <Switch
                            checked={emailNotifications}
                            onChange={(event) =>
                                setEmailNotifications(event.target.checked)
                            }
                        />
                    </Box>

                    <Divider />

                    <Box
                        sx={{
                            py: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 2,
                        }}
                    >
                        <Box>
                            <Typography
                                sx={(theme) => ({
                                    fontWeight: 600,
                                    color: theme.palette.text.primary,
                                })}
                            >
                                Maintenance Notifications
                            </Typography>

                            <Typography
                                variant="body2"
                                sx={(theme) => ({
                                    color: theme.palette.text.secondary,
                                    mt: 0.5,
                                })}
                            >
                                Receive alerts about maintenance requests.
                            </Typography>
                        </Box>

                        <Switch
                            checked={maintenanceNotifications}
                            onChange={(event) =>
                                setMaintenanceNotifications(event.target.checked)
                            }
                        />
                    </Box>
                </Box>
            </Paper>

            {/* Appearance */}
            <Paper
                elevation={0}
                sx={(theme) => ({
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 3,
                    overflow: 'hidden',
                    mb: 3,
                })}
            >
                <Box
                    sx={(theme) => ({
                        px: { xs: 2, sm: 3 },
                        py: 2,
                        backgroundColor:
                            theme.palette.mode === 'dark'
                                ? '#172033'
                                : '#f8fafc',
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                    })}
                >
                    <PaletteOutlinedIcon
                        sx={{ color: 'primary.main' }}
                    />

                    <Box>
                        <Typography
                            sx={(theme) => ({
                                fontWeight: 700,
                                color: theme.palette.text.primary,
                            })}
                        >
                            Appearance
                        </Typography>

                        <Typography
                            variant="caption"
                            sx={(theme) => ({
                                color: theme.palette.text.secondary,
                            })}
                        >
                            Customize how the application looks.
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ p: { xs: 2, sm: 3 } }}>
                    <Typography
                        variant="body2"
                        sx={(theme) => ({
                            color: theme.palette.text.primary,
                            fontWeight: 600,
                            mb: 1.5,
                        })}
                    >
                        Theme
                    </Typography>

                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: '1fr',
                                sm: 'repeat(3, 1fr)',
                            },
                            gap: 2,
                        }}
                    >
                        {[
                            {
                                value: 'light',
                                label: 'Light',
                                description: 'Use the light theme.',
                                icon: '☀️',
                            },
                            {
                                value: 'dark',
                                label: 'Dark',
                                description: 'Use the dark theme.',
                                icon: '🌙',
                            },
                            {
                                value: 'system',
                                label: 'System',
                                description: 'Follow your device setting.',
                                icon: '💻',
                            },
                        ].map((option) => (
                            <Box
                                key={option.value}
                                component="button"
                                type="button"
                                onClick={() =>
                                    setThemeMode(
                                        option.value as
                                        | 'light'
                                        | 'dark'
                                        | 'system'
                                    )
                                }
                                sx={(theme) => ({
                                    textAlign: 'left',
                                    border:
                                        themeMode === option.value
                                            ? '2px solid #3b82f6'
                                            : `1px solid ${theme.palette.divider}`,
                                    borderRadius: 2,
                                    backgroundColor:
                                        themeMode === option.value
                                            ? theme.palette.mode === 'dark'
                                                ? '#172e52'
                                                : '#eff6ff'
                                            : theme.palette.background.paper,
                                    color: theme.palette.text.primary,
                                    p: 2,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        borderColor: '#93c5fd',
                                    },
                                })}
                            >
                                <Typography
                                    sx={{
                                        fontSize: '1.4rem',
                                        mb: 0.75,
                                    }}
                                >
                                    {option.icon}
                                </Typography>

                                <Typography
                                    sx={(theme) => ({
                                        fontWeight: 700,
                                        color: theme.palette.text.primary,
                                        mb: 0.5,
                                    })}
                                >
                                    {option.label}
                                </Typography>

                                <Typography
                                    variant="caption"
                                    sx={(theme) => ({
                                        color: theme.palette.text.secondary,
                                    })}
                                >
                                    {option.description}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Paper>

            {/* About */}
            <Paper
                elevation={0}
                sx={(theme) => ({
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 3,
                    overflow: 'hidden',
                })}
            >
                <Box
                    sx={(theme) => ({
                        px: { xs: 2, sm: 3 },
                        py: 2,
                        backgroundColor:
                            theme.palette.mode === 'dark'
                                ? '#172033'
                                : '#f8fafc',
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                    })}
                >
                    <InfoOutlinedIcon
                        sx={{ color: 'primary.main' }}
                    />

                    <Box>
                        <Typography
                            sx={(theme) => ({
                                fontWeight: 700,
                                color: theme.palette.text.primary,
                            })}
                        >
                            About
                        </Typography>

                        <Typography
                            variant="caption"
                            sx={(theme) => ({
                                color: theme.palette.text.secondary,
                            })}
                        >
                            Application information.
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ p: { xs: 2, sm: 3 } }}>
                    <Typography
                        sx={(theme) => ({
                            fontWeight: 600,
                            color: theme.palette.text.primary,
                        })}
                    >
                        Property Management Platform
                    </Typography>

                    <Typography
                        variant="body2"
                        sx={(theme) => ({
                            color: theme.palette.text.secondary,
                            mt: 0.5,
                        })}
                    >
                        Property, tenant, lease, payment, and maintenance
                        management.
                    </Typography>
                </Box>
            </Paper>

            {/* Change Password Dialog */}
            <Dialog
                open={passwordDialogOpen}
                onClose={handleClosePasswordDialog}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        fontWeight: 700,
                    }}
                >
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'action.hover',
                            color: 'primary.main',
                        }}
                    >
                        <LockOutlinedIcon />
                    </Box>

                    Change Password
                </DialogTitle>

                <DialogContent>
                    {passwordError && (
                        <Alert
                            severity="error"
                            sx={{
                                mb: 2.5,
                                mt: 1,
                                borderRadius: 2,
                            }}
                        >
                            {passwordError}
                        </Alert>
                    )}

                    {passwordSuccess && (
                        <Alert
                            severity="success"
                            sx={{
                                mb: 2.5,
                                mt: 1,
                                borderRadius: 2,
                            }}
                        >
                            {passwordSuccess}
                        </Alert>
                    )}

                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2.5,
                            pt: 1,
                        }}
                    >
                        <TextField
                            fullWidth
                            label="Current Password"
                            type={
                                showCurrentPassword ? 'text' : 'password'
                            }
                            value={currentPassword}
                            onChange={(event) => {
                                setCurrentPassword(event.target.value);
                                setPasswordError('');
                            }}
                            autoComplete="current-password"
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <IconButton
                                            onClick={() =>
                                                setShowCurrentPassword(
                                                    !showCurrentPassword
                                                )
                                            }
                                            edge="end"
                                        >
                                            {showCurrentPassword ? (
                                                <VisibilityOffOutlinedIcon />
                                            ) : (
                                                <VisibilityOutlinedIcon />
                                            )}
                                        </IconButton>
                                    ),
                                },
                            }}
                        />

                        <TextField
                            fullWidth
                            label="New Password"
                            type={showNewPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(event) => {
                                setNewPassword(event.target.value);
                                setPasswordError('');
                            }}
                            helperText="Minimum 8 characters."
                            autoComplete="new-password"
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <IconButton
                                            onClick={() =>
                                                setShowNewPassword(
                                                    !showNewPassword
                                                )
                                            }
                                            edge="end"
                                        >
                                            {showNewPassword ? (
                                                <VisibilityOffOutlinedIcon />
                                            ) : (
                                                <VisibilityOutlinedIcon />
                                            )}
                                        </IconButton>
                                    ),
                                },
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Confirm New Password"
                            type={
                                showConfirmPassword ? 'text' : 'password'
                            }
                            value={confirmNewPassword}
                            onChange={(event) => {
                                setConfirmNewPassword(event.target.value);
                                setPasswordError('');
                            }}
                            autoComplete="new-password"
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <IconButton
                                            onClick={() =>
                                                setShowConfirmPassword(
                                                    !showConfirmPassword
                                                )
                                            }
                                            edge="end"
                                        >
                                            {showConfirmPassword ? (
                                                <VisibilityOffOutlinedIcon />
                                            ) : (
                                                <VisibilityOutlinedIcon />
                                            )}
                                        </IconButton>
                                    ),
                                },
                            }}
                        />
                    </Box>
                </DialogContent>

                <DialogActions
                    sx={{
                        px: 3,
                        pb: 2.5,
                        gap: 1,
                    }}
                >
                    <Button
                        onClick={handleClosePasswordDialog}
                        disabled={changingPassword}
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                        }}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        onClick={handleChangePassword}
                        disabled={changingPassword}
                        startIcon={
                            changingPassword ? (
                                <CircularProgress
                                    size={18}
                                    color="inherit"
                                />
                            ) : (
                                <LockOutlinedIcon />
                            )
                        }
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                        }}
                    >
                        {changingPassword
                            ? 'Changing...'
                            : 'Change Password'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default SettingsPage;