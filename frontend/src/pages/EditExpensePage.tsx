import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import { expensesApi } from '../api/expenses';
import { propertiesApi } from '../api/properties';
import { buildingsApi } from '../api/buildings';
import { unitsApi } from '../api/units';
import { useAuth } from '../context/AuthContext';
import type { Building, Property, Unit } from '../types';

const EditExpensePage = () => {
  const { expenseId } = useParams<{ expenseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [properties, setProperties] = useState<Property[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);

  const [propertyId, setPropertyId] = useState('');
  const [buildingId, setBuildingId] = useState('');
  const [unitId, setUnitId] = useState('');
  const [category, setCategory] = useState('Maintenance');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [description, setDescription] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');

  const [loadingData, setLoadingData] = useState(true);
  const [loadingBuildings, setLoadingBuildings] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const canEdit =
    user?.role === 'Admin' || user?.role === 'PropertyManager';

  useEffect(() => {
    const loadData = async () => {
      if (!expenseId) {
        setError('Expense ID is required.');
        setLoadingData(false);
        return;
      }

      const parsedExpenseId = parseInt(expenseId, 10);

      if (Number.isNaN(parsedExpenseId)) {
        setError('Invalid Expense ID.');
        setLoadingData(false);
        return;
      }

      try {
        setLoadingData(true);
        setError('');

        const [expense, propertiesData] = await Promise.all([
          expensesApi.getById(parsedExpenseId),
          propertiesApi.getAll(),
        ]);

        setProperties(propertiesData);

        setPropertyId(String(expense.propertyId));
        setCategory(expense.category);
        setAmount(String(expense.amount));
        setExpenseDate(expense.expenseDate);
        setVendorName(expense.vendorName);
        setDescription(expense.description);
        setReceiptUrl(expense.receiptUrl ?? '');

        if (expense.propertyId) {
          setLoadingBuildings(true);

          const buildingsData = await buildingsApi.getByProperty(
            expense.propertyId
          );

          setBuildings(buildingsData);

          if (
            expense.buildingId !== null &&
            expense.buildingId !== undefined
          ) {
            setBuildingId(String(expense.buildingId));

            setLoadingUnits(true);

            const unitsData = await unitsApi.getByBuilding(
              expense.buildingId
            );

            setUnits(unitsData);

            if (
              expense.unitId !== null &&
              expense.unitId !== undefined
            ) {
              setUnitId(String(expense.unitId));
            }
          }
        }
      } catch (err: any) {
        if (err.response?.status === 404) {
          setError(
            'Expense with ID ' + expenseId + ' was not found.'
          );
        } else if (err.response?.status === 401) {
          setError('Authentication required. Please log in again.');
        } else {
          setError(
            err.response?.data?.message ||
              err.message ||
              'Failed to load expense.'
          );
        }
      } finally {
        setLoadingBuildings(false);
        setLoadingUnits(false);
        setLoadingData(false);
      }
    };

    loadData();
  }, [expenseId]);

  const handlePropertyChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedPropertyId = event.target.value;

    setPropertyId(selectedPropertyId);
    setBuildingId('');
    setUnitId('');
    setBuildings([]);
    setUnits([]);
    setError('');

    if (!selectedPropertyId) {
      return;
    }

    try {
      setLoadingBuildings(true);

      const data = await buildingsApi.getByProperty(
        Number(selectedPropertyId)
      );

      setBuildings(data);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to load buildings.'
      );
    } finally {
      setLoadingBuildings(false);
    }
  };

  const handleBuildingChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedBuildingId = event.target.value;

    setBuildingId(selectedBuildingId);
    setUnitId('');
    setUnits([]);
    setError('');

    if (!selectedBuildingId) {
      return;
    }

    try {
      setLoadingUnits(true);

      const data = await unitsApi.getByBuilding(
        Number(selectedBuildingId)
      );

      setUnits(data);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to load units.'
      );
    } finally {
      setLoadingUnits(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!expenseId) {
      setError('Expense ID is required.');
      return;
    }

    if (!propertyId) {
      setError('Please select a property.');
      return;
    }

    if (!amount) {
      setError('Expense amount is required.');
      return;
    }

    if (!expenseDate) {
      setError('Expense date is required.');
      return;
    }

    if (!vendorName.trim()) {
      setError('Vendor name is required.');
      return;
    }

    if (!description.trim()) {
      setError('Description is required.');
      return;
    }

    const parsedExpenseId = Number(expenseId);
    const parsedPropertyId = Number(propertyId);
    const parsedBuildingId = buildingId
      ? Number(buildingId)
      : null;
    const parsedUnitId = unitId ? Number(unitId) : null;
    const parsedAmount = Number(amount);

    if (!Number.isInteger(parsedExpenseId) || parsedExpenseId <= 0) {
      setError('Invalid Expense ID.');
      return;
    }

    if (
      !Number.isInteger(parsedPropertyId) ||
      parsedPropertyId <= 0
    ) {
      setError('Invalid property.');
      return;
    }

    if (
      parsedBuildingId !== null &&
      (!Number.isInteger(parsedBuildingId) ||
        parsedBuildingId <= 0)
    ) {
      setError('Invalid building.');
      return;
    }

    if (
      parsedUnitId !== null &&
      (!Number.isInteger(parsedUnitId) || parsedUnitId <= 0)
    ) {
      setError('Invalid unit.');
      return;
    }

    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Expense amount must be greater than 0.');
      return;
    }

    try {
      setSaving(true);

      await expensesApi.update(parsedExpenseId, {
        propertyId: parsedPropertyId,
        buildingId: parsedBuildingId,
        unitId: parsedUnitId,
        category,
        amount: parsedAmount,
        expenseDate,
        vendorName: vendorName.trim(),
        description: description.trim(),
        receiptUrl: receiptUrl.trim() || null,
      });

      navigate('/expenses/' + expenseId);
    } catch (err: any) {
      if (err.response?.status === 400) {
        setError(
          err.response?.data?.message ||
            'Please check the expense information.'
        );
      } else if (err.response?.status === 401) {
        setError('Authentication required. Please log in again.');
      } else if (err.response?.status === 403) {
        setError(
          'You do not have permission to edit this expense.'
        );
      } else if (err.response?.status === 404) {
        setError(
          err.response?.data?.message ||
            'The expense or selected property was not found.'
        );
      } else {
        setError(
          err.response?.data?.message ||
            err.message ||
            'Failed to update expense.'
        );
      }
    } finally {
      setSaving(false);
    }
  };

  if (!canEdit) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() =>
              navigate('/expenses/' + expenseId)
            }
            sx={{
              mb: 3,
              color: '#475569',
              fontWeight: 600,
              textTransform: 'none',
            }}
          >
            Back to Expense
          </Button>

          <Alert severity="error">
            Access Denied. Only Admins and Property Managers can edit
            expenses.
          </Alert>
        </Box>
      </Container>
    );
  }

  if (loadingData) {
    return (
      <Container maxWidth="lg">
        <Box
          sx={{
            minHeight: '60vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() =>
              navigate('/expenses/' + expenseId)
            }
            sx={{
              mb: 2,
              color: '#64748b',
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': {
                bgcolor: '#f1f5f9',
              },
            }}
          >
            Back to Expense
          </Button>

          <Typography
            variant="h4"
            sx={{
              color: '#0f172a',
              fontWeight: 700,
              fontSize: {
                xs: '1.7rem',
                md: '2rem',
              },
              mb: 0.5,
            }}
          >
            Edit Expense
          </Typography>

          <Typography
            sx={{
              color: '#64748b',
              fontSize: '0.95rem',
            }}
          >
            Update the information for this expense.
          </Typography>
        </Box>

        {/* Form Card */}
        <Paper
          elevation={0}
          sx={{
            border: '1px solid #e2e8f0',
            borderRadius: 3,
            overflow: 'hidden',
            bgcolor: '#fff',
          }}
        >
          {/* Card Header */}
          <Box
            sx={{
              px: {
                xs: 2.5,
                md: 4,
              },
              py: 2.5,
              borderBottom: '1px solid #e2e8f0',
              bgcolor: '#f8fafc',
            }}
          >
            <Typography
              sx={{
                fontSize: '1.05rem',
                fontWeight: 700,
                color: '#1e293b',
              }}
            >
              Expense Information
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: '0.85rem',
                color: '#64748b',
              }}
            >
              Update the details below and save your changes.
            </Typography>
          </Box>

          {error && (
            <Box
              sx={{
                px: {
                  xs: 2.5,
                  md: 4,
                },
                pt: 3,
              }}
            >
              <Alert severity="error">{error}</Alert>
            </Box>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              p: {
                xs: 2.5,
                md: 4,
              },
            }}
          >
            {/* Location */}
            <Typography
              sx={{
                mb: 2,
                fontSize: '0.95rem',
                fontWeight: 700,
                color: '#334155',
              }}
            >
              Location
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  md: 'repeat(3, 1fr)',
                },
                gap: 2,
                mb: 4,
              }}
            >
              <TextField
                fullWidth
                required
                select
                label="Property"
                value={propertyId}
                onChange={handlePropertyChange}
                disabled={saving}
              >
                {properties.map((property) => (
                  <MenuItem
                    key={property.id}
                    value={property.id}
                  >
                    {property.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                select
                label="Building"
                value={buildingId}
                onChange={handleBuildingChange}
                disabled={
                  saving ||
                  !propertyId ||
                  loadingBuildings
                }
                helperText={
                  !propertyId
                    ? 'Select a property first.'
                    : 'Optional.'
                }
              >
                <MenuItem value="">Property-wide</MenuItem>

                {buildings.map((building) => (
                  <MenuItem
                    key={building.id}
                    value={building.id}
                  >
                    {building.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                select
                label="Unit"
                value={unitId}
                onChange={(event) =>
                  setUnitId(event.target.value)
                }
                disabled={
                  saving ||
                  !buildingId ||
                  loadingUnits
                }
                helperText={
                  !buildingId
                    ? 'Optional. Select a building first.'
                    : 'Optional.'
                }
              >
                <MenuItem value="">Building-wide</MenuItem>

                {units.map((unit) => (
                  <MenuItem
                    key={unit.id}
                    value={unit.id}
                  >
                    {unit.unitNumber}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            {/* Expense Details */}
            <Typography
              sx={{
                mb: 2,
                fontSize: '0.95rem',
                fontWeight: 700,
                color: '#334155',
              }}
            >
              Expense Details
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  md: 'repeat(3, 1fr)',
                },
                gap: 2,
                mb: 2,
              }}
            >
              <TextField
                fullWidth
                required
                select
                label="Category"
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value)
                }
                disabled={saving}
              >
                <MenuItem value="Repairs">Repairs</MenuItem>
                <MenuItem value="Maintenance">
                  Maintenance
                </MenuItem>
                <MenuItem value="Insurance">
                  Insurance
                </MenuItem>
                <MenuItem value="Taxes">Taxes</MenuItem>
                <MenuItem value="Utilities">
                  Utilities
                </MenuItem>
                <MenuItem value="Landscaping">
                  Landscaping
                </MenuItem>
                <MenuItem value="ManagementFee">
                  Management Fee
                </MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>

              <TextField
                fullWidth
                required
                label="Amount"
                type="number"
                value={amount}
                onChange={(event) =>
                  setAmount(event.target.value)
                }
                slotProps={{
                  htmlInput: {
                    min: 0,
                    step: 0.01,
                  },
                }}
                disabled={saving}
              />

              <TextField
                fullWidth
                required
                label="Expense Date"
                type="date"
                value={expenseDate}
                onChange={(event) =>
                  setExpenseDate(event.target.value)
                }
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
                disabled={saving}
              />
            </Box>

            {/* Vendor and Receipt */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  md: '1fr 1fr',
                },
                gap: 2,
                mb: 2,
              }}
            >
              <TextField
                fullWidth
                required
                label="Vendor Name"
                value={vendorName}
                onChange={(event) =>
                  setVendorName(event.target.value)
                }
                disabled={saving}
              />

              <TextField
                fullWidth
                label="Receipt URL"
                value={receiptUrl}
                onChange={(event) =>
                  setReceiptUrl(event.target.value)
                }
                helperText="Optional."
                disabled={saving}
              />
            </Box>

            {/* Description */}
            <TextField
              fullWidth
              required
              label="Description"
              multiline
              minRows={4}
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              disabled={saving}
              sx={{ mb: 4 }}
            />

            {/* Actions */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 1.5,
                pt: 2,
                borderTop: '1px solid #e2e8f0',
                flexWrap: 'wrap',
              }}
            >
              <Button
                variant="outlined"
                onClick={() =>
                  navigate('/expenses/' + expenseId)
                }
                disabled={saving}
                sx={{
                  px: 3,
                  py: 1.2,
                  borderRadius: 2,
                  borderColor: '#cbd5e1',
                  color: '#475569',
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#94a3b8',
                    bgcolor: '#f8fafc',
                  },
                }}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="contained"
                startIcon={
                  saving ? (
                    <CircularProgress
                      size={18}
                      color="inherit"
                    />
                  ) : (
                    <SaveIcon />
                  )
                }
                disabled={saving}
                sx={{
                  px: 3,
                  py: 1.2,
                  borderRadius: 2,
                  bgcolor: '#2563eb',
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: '#1d4ed8',
                    boxShadow: 'none',
                  },
                }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default EditExpensePage;