import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
Alert,
Box,
Button,
Chip,
CircularProgress,
Container,
InputAdornment,
Paper,
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
import VisibilityIcon from '@mui/icons-material/Visibility';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { expensesApi } from '../api/expenses';
import { useAuth } from '../context/AuthContext';
import type { Expense } from '../types';

const ExpensesPage = () => {
const navigate = useNavigate();
const { user } = useAuth();

const [expenses, setExpenses] = useState<Expense[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');
const [search, setSearch] = useState('');

useEffect(() => {
const fetchExpenses = async () => {
try {
setLoading(true);
setError('');

    const data = await expensesApi.getAll();
    setExpenses(data);
  } catch (err: any) {
    if (err.response?.status === 401) {
      setError('Authentication required. Please log in again.');
    } else {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to load expenses.'
      );
    }
  } finally {
    setLoading(false);
  }
};

fetchExpenses();

}, []);

const canCreate =
user?.role === 'Admin' || user?.role === 'PropertyManager';

const formatDate = (dateString: string) => {
return new Date(dateString + 'T00:00:00').toLocaleDateString(
'en-US',
{
year: 'numeric',
month: 'long',
day: 'numeric',
}
);
};

const totalAmount = useMemo(() => {
return expenses.reduce((sum, expense) => sum + expense.amount, 0);
}, [expenses]);

const thisMonthAmount = useMemo(() => {
const now = new Date();

return expenses.reduce((sum, expense) => {
  const date = new Date(expense.expenseDate + 'T00:00:00');

  if (
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  ) {
    return sum + expense.amount;
  }

  return sum;
}, 0);

}, [expenses]);

const categoriesCount = useMemo(() => {
return new Set(expenses.map((expense) => expense.category)).size;
}, [expenses]);

const filteredExpenses = useMemo(() => {
const query = search.trim().toLowerCase();

if (!query) {
  return expenses;
}

return expenses.filter((expense) => {
  const location = expense.unitNumber
    ? `unit ${expense.unitNumber}`
    : expense.buildingName || 'property-wide';

  return [
    expense.propertyName,
    location,
    expense.category,
    expense.vendorName,
    expense.recordedByUserName,
    expense.description,
    expense.amount.toString(),
  ]
    .join(' ')
    .toLowerCase()
    .includes(query);
});

}, [expenses, search]);

const getCategoryColor = (
category: string
): 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'default' => {
const value = category.toLowerCase();

if (
  value.includes('maintenance') ||
  value.includes('repair')
) {
  return 'warning';
}

if (
  value.includes('utility') ||
  value.includes('electric') ||
  value.includes('water')
) {
  return 'primary';
}

if (
  value.includes('tax') ||
  value.includes('insurance')
) {
  return 'error';
}

if (
  value.includes('salary') ||
  value.includes('staff')
) {
  return 'secondary';
}

return 'default';

};

if (loading) {
return ( <Container maxWidth="xl">
<Box
sx={{
minHeight: '60vh',
display: 'flex',
alignItems: 'center',
justifyContent: 'center',
}}
> <CircularProgress /> </Box> </Container>
);
}

return ( <Container maxWidth="xl">
<Box sx={{ py: 3 }}>
<Box
sx={{
display: 'flex',
justifyContent: 'space-between',
alignItems: { xs: 'flex-start', sm: 'center' },
gap: 2,
flexWrap: 'wrap',
mb: 3,
}}
> <Box>
<Typography
variant="h4"
component="h1"
sx={{
fontWeight: 700,
color: '#1e293b',
mb: 0.5,
}}
>
Expenses </Typography>

        <Typography
          variant="body2"
          sx={{ color: '#64748b' }}
        >
          Track and manage expenses recorded against your properties.
        </Typography>
      </Box>

      {canCreate && (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/expenses/create')}
          sx={{
            bgcolor: '#3b82f6',
            borderRadius: 2,
            px: 2.5,
            py: 1.2,
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: 'none',
            '&:hover': {
              bgcolor: '#2563eb',
              boxShadow: 'none',
            },
          }}
        >
          Create Expense
        </Button>
      )}
    </Box>

    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          lg: 'repeat(3, 1fr)',
        },
        gap: 2,
        mb: 3,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          border: '1px solid #e2e8f0',
          borderRadius: 3,
          bgcolor: '#fff',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography
              variant="body2"
              sx={{ color: '#64748b', mb: 0.8 }}
            >
              Total Expenses
            </Typography>

            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: '#1e293b',
              }}
            >
              {expenses.length}
            </Typography>
          </Box>

          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: '#eff6ff',
              color: '#3b82f6',
            }}
          >
            <ReceiptLongIcon />
          </Box>
        </Box>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          border: '1px solid #e2e8f0',
          borderRadius: 3,
          bgcolor: '#fff',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography
              variant="body2"
              sx={{ color: '#64748b', mb: 0.8 }}
            >
              Total Amount
            </Typography>

            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: '#1e293b',
              }}
            >
              {totalAmount.toLocaleString()}
            </Typography>
          </Box>

          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: '#f0fdf4',
              color: '#16a34a',
            }}
          >
            <TrendingUpIcon />
          </Box>
        </Box>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          border: '1px solid #e2e8f0',
          borderRadius: 3,
          bgcolor: '#fff',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography
              variant="body2"
              sx={{ color: '#64748b', mb: 0.8 }}
            >
              This Month
            </Typography>

            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: '#1e293b',
              }}
            >
              {thisMonthAmount.toLocaleString()}
            </Typography>
          </Box>

          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: '#fff7ed',
              color: '#ea580c',
            }}
          >
            <CalendarMonthIcon />
          </Box>
        </Box>
      </Paper>
    </Box>

    {error ? (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    ) : (
      <>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 2,
            border: '1px solid #e2e8f0',
            borderRadius: 3,
            bgcolor: '#fff',
          }}
        >
          <TextField
            fullWidth
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search expenses, properties, vendors, categories..."
            size="small"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#94a3b8' }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: '#f8fafc',
              },
            }}
          />
        </Paper>

        {expenses.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: 'center',
              border: '1px solid #e2e8f0',
              borderRadius: 3,
            }}
          >
            <ReceiptLongIcon
              sx={{
                fontSize: 52,
                color: '#94a3b8',
                mb: 1,
              }}
            />

            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: '#1e293b',
                mb: 0.5,
              }}
            >
              No Expenses Found
            </Typography>

            <Typography
              variant="body2"
              sx={{ color: '#64748b' }}
            >
              There are no expenses in the system yet.
            </Typography>
          </Paper>
        ) : filteredExpenses.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 5,
              textAlign: 'center',
              border: '1px solid #e2e8f0',
              borderRadius: 3,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: '#1e293b',
                mb: 0.5,
              }}
            >
              No Matching Expenses
            </Typography>

            <Typography
              variant="body2"
              sx={{ color: '#64748b' }}
            >
              Try changing your search term.
            </Typography>
          </Paper>
        ) : (
          <Paper
            elevation={0}
            sx={{
              border: '1px solid #e2e8f0',
              borderRadius: 3,
              overflow: 'hidden',
              bgcolor: '#fff',
            }}
          >
            <Box
              sx={{
                px: 2.5,
                py: 2,
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 2,
                flexWrap: 'wrap',
              }}
            >
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: '#1e293b',
                  }}
                >
                  Expense Records
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ color: '#64748b' }}
                >
                  {filteredExpenses.length} expense
                  {filteredExpenses.length !== 1 ? 's' : ''}
                </Typography>
              </Box>

              <Chip
                label={`${categoriesCount} ${
                  categoriesCount === 1 ? 'category' : 'categories'
                }`}
                size="small"
                sx={{
                  bgcolor: '#f1f5f9',
                  color: '#475569',
                  fontWeight: 500,
                }}
              />
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow
                    sx={{
                      bgcolor: '#f8fafc',
                      '& .MuiTableCell-root': {
                        borderBottom: '1px solid #e2e8f0',
                        color: '#64748b',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.03em',
                        whiteSpace: 'nowrap',
                      },
                    }}
                  >
                    <TableCell>Property</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Expense Date</TableCell>
                    <TableCell>Vendor</TableCell>
                    <TableCell>Recorded By</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {filteredExpenses.map((expense) => (
                    <TableRow
                      key={expense.id}
                      hover
                      sx={{
                        '&:last-child td': {
                          borderBottom: 0,
                        },
                        '& .MuiTableCell-root': {
                          borderBottom: '1px solid #f1f5f9',
                          py: 1.8,
                        },
                      }}
                    >
                      <TableCell>
                        <Typography
                          sx={{
                            fontWeight: 600,
                            color: '#1e293b',
                          }}
                        >
                          {expense.propertyName}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ color: '#475569' }}
                        >
                          {expense.unitNumber
                            ? 'Unit ' + expense.unitNumber
                            : expense.buildingName
                            ? expense.buildingName
                            : 'Property-wide'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={expense.category}
                          size="small"
                          color={getCategoryColor(expense.category)}
                          variant="outlined"
                          sx={{
                            fontWeight: 500,
                            borderRadius: 1.5,
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        <Typography
                          sx={{
                            fontWeight: 700,
                            color: '#1e293b',
                          }}
                        >
                          {expense.amount.toLocaleString()}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ color: '#475569' }}
                        >
                          {formatDate(expense.expenseDate)}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ color: '#475569' }}
                        >
                          {expense.vendorName}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ color: '#475569' }}
                        >
                          {expense.recordedByUserName}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<VisibilityIcon />}
                          onClick={() =>
                            navigate('/expenses/' + expense.id)
                          }
                          sx={{
                            borderColor: '#cbd5e1',
                            color: '#475569',
                            borderRadius: 1.5,
                            textTransform: 'none',
                            fontWeight: 500,
                            '&:hover': {
                              borderColor: '#3b82f6',
                              color: '#3b82f6',
                              bgcolor: '#eff6ff',
                            },
                          }}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </>
    )}
  </Box>
</Container>

);
};

export default ExpensesPage;
