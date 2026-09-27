import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    InputAdornment,
    InputLabel,
    IconButton,
    MenuItem,
    Paper,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import PeopleIcon from '@mui/icons-material/People';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

import {
    createUser,
    deleteUser,
    getUser,
    getUsers,
    updateUserStatus,
    type User,
    type UserRole,
} from '../api/users';

const roleLabels: Record<UserRole, string> = {
    PropertyManager: 'Property Manager',
    MaintenanceStaff: 'Maintenance Staff',
    Tenant: 'Tenant',
};

const UsersPage = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<'All' | UserRole>('All');

    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    const [openDialog, setOpenDialog] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [formError, setFormError] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isLoadingUser, setIsLoadingUser] = useState(false);
    const [userDetailsError, setUserDetailsError] = useState('');

    const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);

    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: '',
        role: 'Tenant' as UserRole,
    });

    const loadUsers = useCallback(async () => {
        try {
            setIsLoading(true);
            setLoadError('');

            const data = await getUsers();

            setUsers(data);
        } catch (error: any) {
            console.error('Failed to load users:', error);

            const message =
                error?.response?.data?.message ||
                'Failed to load users. Please try again.';

            setLoadError(message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const filteredUsers = useMemo(() => {
        const searchValue = search.toLowerCase().trim();

        return users.filter((user) => {
            const matchesRole =
                roleFilter === 'All' || user.role === roleFilter;

            const phoneNumber = user.phoneNumber ?? '';

            const matchesSearch =
                !searchValue ||
                `${user.firstName} ${user.lastName}`
                    .toLowerCase()
                    .includes(searchValue) ||
                user.email.toLowerCase().includes(searchValue) ||
                phoneNumber.includes(searchValue);

            return matchesRole && matchesSearch;
        });
    }, [users, search, roleFilter]);

    const resetForm = () => {
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phoneNumber: '',
            password: '',
            confirmPassword: '',
            role: 'Tenant',
        });

        setFormError('');
        setShowPassword(false);
        setShowConfirmPassword(false);
    };

    const handleCloseDialog = () => {
        if (isCreating) {
            return;
        }

        setOpenDialog(false);
        resetForm();
    };

    const handleViewUser = async (id: number) => {
        try {
            setSelectedUser(null);
            setUserDetailsError('');
            setIsLoadingUser(true);

            const user = await getUser(id);

            setSelectedUser(user);
        } catch (error: any) {
            console.error('Failed to load user details:', error);

            const message =
                error?.response?.data?.message ||
                'Failed to load user details. Please try again.';

            setUserDetailsError(message);
        } finally {
            setIsLoadingUser(false);
        }
    };

    const handleCloseUserDetails = () => {
        if (isLoadingUser) {
            return;
        }

        setSelectedUser(null);
        setUserDetailsError('');
    };

    const handleToggleUserStatus = async (user: User) => {
        try {
            setUpdatingUserId(user.id);
            setLoadError('');

            const response = await updateUserStatus(user.id);

            setUsers((currentUsers) =>
                currentUsers.map((currentUser) =>
                    currentUser.id === user.id
                        ? response.user
                        : currentUser
                )
            );

            setSelectedUser((currentSelectedUser) =>
                currentSelectedUser?.id === user.id
                    ? response.user
                    : currentSelectedUser
            );
        } catch (error: any) {
            console.error('Failed to update user status:', error);

            const message =
                error?.response?.data?.message ||
                'Failed to update user status. Please try again.';

            setLoadError(message);
        } finally {
            setUpdatingUserId(null);
        }
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) {
            return;
        }

        try {
            setIsDeleting(true);
            setLoadError('');

            await deleteUser(userToDelete.id);

            setUsers((currentUsers) =>
                currentUsers.filter(
                    (user) => user.id !== userToDelete.id
                )
            );

            if (selectedUser?.id === userToDelete.id) {
                setSelectedUser(null);
            }

            setUserToDelete(null);
        } catch (error: any) {
            console.error('Failed to delete user:', error);

            const message =
                error?.response?.data?.message ||
                'Failed to delete user. Please try again.';

            setLoadError(message);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCreateUser = async () => {
        setFormError('');

        if (
            !formData.firstName.trim() ||
            !formData.lastName.trim() ||
            !formData.email.trim() ||
            !formData.password ||
            !formData.confirmPassword
        ) {
            setFormError('Please fill in all required fields.');
            return;
        }

        if (formData.password.length < 6) {
            setFormError('Password must be at least 6 characters.');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setFormError('Passwords do not match.');
            return;
        }

        try {
            setIsCreating(true);

            await createUser({
                email: formData.email.trim(),
                password: formData.password,
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                phoneNumber: formData.phoneNumber.trim() || undefined,
                role: formData.role,
            });

            setOpenDialog(false);
            resetForm();

            await loadUsers();
        } catch (error: any) {
            console.error('Failed to create user:', error);

            const message =
                error?.response?.data?.message ||
                'Failed to create user. Please try again.';

            setFormError(message);
        } finally {
            setIsCreating(false);
        }
    };

    const formatCreatedDate = (date: string) => {
        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return date;
        }

        return parsedDate.toLocaleString();
    };

    return (
        <Box>
            {/* Page Header */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    gap: 2,
                    mb: 3,
                }}
            >
                <Box>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                        }}
                    >
                        <PeopleIcon color="primary" />

                        <Typography
                            variant="h4"
                            sx={{ fontWeight: 700 }}
                        >
                            User Management
                        </Typography>
                    </Box>

                    <Typography
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                    >
                        Manage property managers, maintenance staff, and tenants.
                    </Typography>
                </Box>

                <Button
                    onClick={() => setOpenDialog(true)}
                    variant="contained"
                    startIcon={<AddIcon />}
                    size="large"
                >
                    Add User
                </Button>
            </Box>

            {/* Error */}
            {loadError && (
                <Alert
                    severity="error"
                    sx={{ mb: 3 }}
                    action={
                        <Button
                            color="inherit"
                            size="small"
                            onClick={loadUsers}
                        >
                            Retry
                        </Button>
                    }
                >
                    {loadError}
                </Alert>
            )}

            {/* Search and Filter */}
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    mb: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                }}
            >
                <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={2}
                >
                    <TextField
                        fullWidth
                        placeholder="Search by name, email, or phone..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="action" />
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />

                    <FormControl
                        sx={{
                            minWidth: {
                                xs: '100%',
                                md: 220,
                            },
                        }}
                    >
                        <InputLabel>Role</InputLabel>

                        <Select
                            value={roleFilter}
                            label="Role"
                            onChange={(event) =>
                                setRoleFilter(
                                    event.target.value as 'All' | UserRole
                                )
                            }
                        >
                            <MenuItem value="All">
                                All Roles
                            </MenuItem>

                            <MenuItem value="PropertyManager">
                                Property Manager
                            </MenuItem>

                            <MenuItem value="MaintenanceStaff">
                                Maintenance Staff
                            </MenuItem>

                            <MenuItem value="Tenant">
                                Tenant
                            </MenuItem>
                        </Select>
                    </FormControl>
                </Stack>
            </Paper>

            {/* Users Table */}
            <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    overflowX: 'auto',
                }}
            >
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <strong>User</strong>
                            </TableCell>

                            <TableCell>
                                <strong>Email</strong>
                            </TableCell>

                            <TableCell>
                                <strong>Phone</strong>
                            </TableCell>

                            <TableCell>
                                <strong>Role</strong>
                            </TableCell>

                            <TableCell>
                                <strong>Status</strong>
                            </TableCell>

                            <TableCell align="right">
                                <strong>Actions</strong>
                            </TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    align="center"
                                >
                                    <Box
                                        sx={{
                                            py: 6,
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            gap: 1.5,
                                        }}
                                    >
                                        <CircularProgress size={24} />

                                        <Typography color="text.secondary">
                                            Loading users...
                                        </Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ) : (
                            <>
                                {filteredUsers.map((user) => (
                                    <TableRow
                                        key={user.id}
                                        hover
                                    >
                                        <TableCell>
                                            <Box sx={{ fontWeight: 600 }}>
                                                {user.firstName}{' '}
                                                {user.lastName}
                                            </Box>
                                        </TableCell>

                                        <TableCell>
                                            {user.email}
                                        </TableCell>

                                        <TableCell>
                                            {user.phoneNumber || '—'}
                                        </TableCell>

                                        <TableCell>
                                            <Chip
                                                label={roleLabels[user.role]}
                                                size="small"
                                                variant="outlined"
                                            />
                                        </TableCell>

                                        <TableCell>
                                            <Chip
                                                label={
                                                    user.isActive
                                                        ? 'Active'
                                                        : 'Inactive'
                                                }
                                                size="small"
                                                color={
                                                    user.isActive
                                                        ? 'success'
                                                        : 'default'
                                                }
                                            />
                                        </TableCell>

                                        <TableCell align="right">
                                            <Stack
                                                direction="row"
                                                spacing={1}
                                                sx={{
                                                    justifyContent: 'flex-end',
                                                }}
                                            >
                                                <Button
                                                    size="small"
                                                    onClick={() =>
                                                        handleViewUser(user.id)
                                                    }
                                                    disabled={
                                                        updatingUserId ===
                                                        user.id ||
                                                        isDeleting
                                                    }
                                                >
                                                    View
                                                </Button>

                                                <Button
                                                    size="small"
                                                    color={
                                                        user.isActive
                                                            ? 'error'
                                                            : 'success'
                                                    }
                                                    onClick={() =>
                                                        handleToggleUserStatus(
                                                            user
                                                        )
                                                    }
                                                    disabled={
                                                        updatingUserId ===
                                                        user.id ||
                                                        isDeleting
                                                    }
                                                    startIcon={
                                                        updatingUserId ===
                                                            user.id ? (
                                                            <CircularProgress
                                                                size={14}
                                                                color="inherit"
                                                            />
                                                        ) : undefined
                                                    }
                                                >
                                                    {updatingUserId ===
                                                        user.id
                                                        ? 'Updating...'
                                                        : user.isActive
                                                            ? 'Deactivate'
                                                            : 'Activate'}
                                                </Button>

                                                <Button
                                                    size="small"
                                                    color="error"
                                                    onClick={() =>
                                                        setUserToDelete(user)
                                                    }
                                                    disabled={
                                                        isDeleting ||
                                                        updatingUserId ===
                                                        user.id
                                                    }
                                                >
                                                    Delete
                                                </Button>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))}

                                {filteredUsers.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            align="center"
                                        >
                                            <Typography
                                                color="text.secondary"
                                                sx={{ py: 5 }}
                                            >
                                                No users found.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* View User Details Dialog */}
            <Dialog
                open={
                    Boolean(selectedUser) ||
                    isLoadingUser ||
                    Boolean(userDetailsError)
                }
                onClose={handleCloseUserDetails}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        <Box>
                            <Typography
                                variant="h6"
                                sx={{ fontWeight: 700 }}
                            >
                                User Details
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                View account information.
                            </Typography>
                        </Box>

                        <IconButton
                            onClick={handleCloseUserDetails}
                            aria-label="close"
                            disabled={isLoadingUser}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>

                <Divider />

                <DialogContent sx={{ pt: 3 }}>
                    {isLoadingUser && (
                        <Box
                            sx={{
                                py: 6,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 2,
                            }}
                        >
                            <CircularProgress />

                            <Typography color="text.secondary">
                                Loading user details...
                            </Typography>
                        </Box>
                    )}

                    {userDetailsError && !isLoadingUser && (
                        <Alert severity="error">
                            {userDetailsError}
                        </Alert>
                    )}

                    {selectedUser && !isLoadingUser && (
                        <Stack spacing={2.5}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    p: 2,
                                    borderRadius: 2,
                                    bgcolor: 'action.hover',
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 52,
                                        height: 52,
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        bgcolor: 'primary.main',
                                        color: 'primary.contrastText',
                                        fontSize: 20,
                                        fontWeight: 700,
                                    }}
                                >
                                    {selectedUser.firstName.charAt(0)}
                                    {selectedUser.lastName.charAt(0)}
                                </Box>

                                <Box>
                                    <Typography
                                        variant="h6"
                                        sx={{ fontWeight: 700 }}
                                    >
                                        {selectedUser.firstName}{' '}
                                        {selectedUser.lastName}
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        {roleLabels[selectedUser.role]}
                                    </Typography>
                                </Box>
                            </Box>

                            <Box
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: {
                                        xs: '1fr',
                                        sm: '1fr 1fr',
                                    },
                                    gap: 2,
                                }}
                            >
                                <Box>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        Email
                                    </Typography>

                                    <Typography
                                        sx={{
                                            fontWeight: 500,
                                            wordBreak: 'break-word',
                                        }}
                                    >
                                        {selectedUser.email}
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        Phone Number
                                    </Typography>

                                    <Typography sx={{ fontWeight: 500 }}>
                                        {selectedUser.phoneNumber || '—'}
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        Role
                                    </Typography>

                                    <Box sx={{ mt: 0.5 }}>
                                        <Chip
                                            label={
                                                roleLabels[selectedUser.role]
                                            }
                                            size="small"
                                            variant="outlined"
                                        />
                                    </Box>
                                </Box>

                                <Box>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        Account Status
                                    </Typography>

                                    <Box sx={{ mt: 0.5 }}>
                                        <Chip
                                            label={
                                                selectedUser.isActive
                                                    ? 'Active'
                                                    : 'Inactive'
                                            }
                                            size="small"
                                            color={
                                                selectedUser.isActive
                                                    ? 'success'
                                                    : 'default'
                                            }
                                        />
                                    </Box>
                                </Box>

                                <Box
                                    sx={{
                                        gridColumn: {
                                            xs: 'auto',
                                            sm: '1 / -1',
                                        },
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        Created
                                    </Typography>

                                    <Typography sx={{ fontWeight: 500 }}>
                                        {formatCreatedDate(
                                            selectedUser.createdAtUtc
                                        )}
                                    </Typography>
                                </Box>
                            </Box>
                        </Stack>
                    )}
                </DialogContent>

                <Divider />

                <DialogActions sx={{ p: 2.5 }}>
                    <Button
                        onClick={handleCloseUserDetails}
                        disabled={isLoadingUser}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={Boolean(userToDelete)}
                onClose={() => {
                    if (!isDeleting) {
                        setUserToDelete(null);
                    }
                }}
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle sx={{ fontWeight: 700 }}>
                    Delete User
                </DialogTitle>

                <DialogContent>
                    <Typography>
                        Are you sure you want to delete{' '}
                        <strong>
                            {userToDelete
                                ? `${userToDelete.firstName} ${userToDelete.lastName}`
                                : ''}
                        </strong>
                        ?
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1.5 }}
                    >
                        This action cannot be undone. User accounts with
                        related records may not be eligible for deletion.
                    </Typography>
                </DialogContent>

                <DialogActions sx={{ p: 2.5 }}>
                    <Button
                        onClick={() => setUserToDelete(null)}
                        disabled={isDeleting}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleDeleteUser}
                        disabled={isDeleting}
                        startIcon={
                            isDeleting ? (
                                <CircularProgress
                                    size={18}
                                    color="inherit"
                                />
                            ) : undefined
                        }
                    >
                        {isDeleting ? 'Deleting...' : 'Delete User'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Add User Dialog */}
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        <Box>
                            <Typography
                                variant="h6"
                                sx={{ fontWeight: 700 }}
                            >
                                Add New User
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Create an account for a property management
                                team member or tenant.
                            </Typography>
                        </Box>

                        <IconButton
                            onClick={handleCloseDialog}
                            aria-label="close"
                            disabled={isCreating}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>

                <Divider />

                <DialogContent sx={{ pt: 3 }}>
                    {formError && (
                        <Alert
                            severity="error"
                            sx={{ mb: 2 }}
                        >
                            {formError}
                        </Alert>
                    )}

                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: '1fr',
                                sm: '1fr 1fr',
                            },
                            gap: 2,
                        }}
                    >
                        <TextField
                            label="First Name"
                            required
                            value={formData.firstName}
                            onChange={(event) =>
                                setFormData({
                                    ...formData,
                                    firstName: event.target.value,
                                })
                            }
                        />

                        <TextField
                            label="Last Name"
                            required
                            value={formData.lastName}
                            onChange={(event) =>
                                setFormData({
                                    ...formData,
                                    lastName: event.target.value,
                                })
                            }
                        />

                        <TextField
                            label="Email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={(event) =>
                                setFormData({
                                    ...formData,
                                    email: event.target.value,
                                })
                            }
                            sx={{
                                gridColumn: {
                                    xs: 'auto',
                                    sm: '1 / -1',
                                },
                            }}
                        />

                        <TextField
                            label="Phone Number"
                            value={formData.phoneNumber}
                            onChange={(event) =>
                                setFormData({
                                    ...formData,
                                    phoneNumber: event.target.value,
                                })
                            }
                        />

                        <TextField
                            select
                            label="Role"
                            required
                            value={formData.role}
                            onChange={(event) =>
                                setFormData({
                                    ...formData,
                                    role: event.target.value as UserRole,
                                })
                            }
                        >
                            <MenuItem value="PropertyManager">
                                Property Manager
                            </MenuItem>

                            <MenuItem value="MaintenanceStaff">
                                Maintenance Staff
                            </MenuItem>

                            <MenuItem value="Tenant">
                                Tenant
                            </MenuItem>
                        </TextField>

                        <TextField
                            label="Password"
                            type={
                                showPassword
                                    ? 'text'
                                    : 'password'
                            }
                            required
                            value={formData.password}
                            onChange={(event) =>
                                setFormData({
                                    ...formData,
                                    password: event.target.value,
                                })
                            }
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() =>
                                                    setShowPassword(
                                                        !showPassword
                                                    )
                                                }
                                                edge="end"
                                                aria-label={
                                                    showPassword
                                                        ? 'hide password'
                                                        : 'show password'
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
                        />

                        <TextField
                            label="Confirm Password"
                            type={
                                showConfirmPassword
                                    ? 'text'
                                    : 'password'
                            }
                            required
                            value={formData.confirmPassword}
                            onChange={(event) =>
                                setFormData({
                                    ...formData,
                                    confirmPassword:
                                        event.target.value,
                                })
                            }
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() =>
                                                    setShowConfirmPassword(
                                                        !showConfirmPassword
                                                    )
                                                }
                                                edge="end"
                                                aria-label={
                                                    showConfirmPassword
                                                        ? 'hide password'
                                                        : 'show password'
                                                }
                                            >
                                                {showConfirmPassword ? (
                                                    <VisibilityOffIcon />
                                                ) : (
                                                    <VisibilityIcon />
                                                )}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />
                    </Box>
                </DialogContent>

                <Divider />

                <DialogActions sx={{ p: 2.5 }}>
                    <Button
                        onClick={handleCloseDialog}
                        disabled={isCreating}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        startIcon={
                            isCreating ? (
                                <CircularProgress
                                    size={18}
                                    color="inherit"
                                />
                            ) : (
                                <AddIcon />
                            )
                        }
                        onClick={handleCreateUser}
                        disabled={isCreating}
                    >
                        {isCreating
                            ? 'Creating...'
                            : 'Create User'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default UsersPage;
