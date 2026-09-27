import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
Alert,
Box,
Button,
Chip,
CircularProgress,
Container,
Dialog,
DialogActions,
DialogContent,
DialogContentText,
DialogTitle,
Divider,
Paper,
Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import BusinessIcon from '@mui/icons-material/Business';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonIcon from '@mui/icons-material/Person';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { expensesApi } from '../api/expenses';
import { useAuth } from '../context/AuthContext';
import type { Expense } from '../types';

const ExpenseDetailsPage = () => {
const { expenseId } = useParams<{ expenseId: string }>();
const navigate = useNavigate();
const { user } = useAuth();

const [expense, setExpense] = useState<Expense | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
const [deleting, setDeleting] = useState(false);
const [deleteError, setDeleteError] = useState('');

useEffect(() => {
const fetchExpense = async () => {
if (!expenseId) {
setError('Expense ID is required.');
setLoading(false);
return;
}

  const parsedExpenseId = parseInt(expenseId, 10);

  if (Number.isNaN(parsedExpenseId)) {
    setError('Invalid Expense ID.');
    setLoading(false);
    return;
  }

  try {
    setLoading(true);
    setError('');

    const data = await expensesApi.getById(parsedExpenseId);
    setExpense(data);
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
          'Failed to load expense details.'
      );
    }
  } finally {
    setLoading(false);
  }
};

fetchExpense();

}, [expenseId]);

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

const formatDateTime = (dateString: string) => {
return new Date(dateString).toLocaleString('en-US', {
year: 'numeric',
month: 'long',
day: 'numeric',
hour: 'numeric',
minute: '2-digit',
});
};

const handleDeleteClick = () => {
setDeleteDialogOpen(true);
setDeleteError('');
};

const handleDeleteCancel = () => {
if (deleting) return;

setDeleteDialogOpen(false);
setDeleteError('');

};

const handleDeleteConfirm = async () => {
if (!expenseId) return;

const parsedExpenseId = parseInt(expenseId, 10);

if (Number.isNaN(parsedExpenseId)) {
  setDeleteError('Invalid Expense ID.');
  return;
}

try {
  setDeleting(true);
  setDeleteError('');

  await expensesApi.delete(parsedExpenseId);

  navigate('/expenses');
} catch (err: any) {
  if (err.response?.status === 404) {
    setDeleteError('Expense not found.');
  } else if (err.response?.status === 403) {
    setDeleteError(
      'You do not have permission to delete this expense.'
    );
  } else if (err.response?.status === 401) {
    setDeleteError(
      'Authentication required. Please log in again.'
    );
  } else {
    setDeleteError(
      err.response?.data?.message ||
        err.message ||
        'Failed to delete expense. Please try again.'
    );
  }
} finally {
  setDeleting(false);
}

};

const canEdit =
user?.role === 'Admin' || user?.role === 'PropertyManager';

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

if (error) {
return ( <Container maxWidth="xl">
<Box sx={{ py: 3 }}>
<Button
startIcon={<ArrowBackIcon />}
onClick={() => navigate('/expenses')}
sx={{
mb: 3,
color: '#475569',
textTransform: 'none',
fontWeight: 500,
}}
>
Back to Expenses </Button>

      <Alert severity="error">{error}</Alert>
    </Box>
  </Container>
);

}

if (!expense) {
return ( <Container maxWidth="xl">
<Box sx={{ py: 3 }}>
<Button
startIcon={<ArrowBackIcon />}
onClick={() => navigate('/expenses')}
sx={{
mb: 3,
color: '#475569',
textTransform: 'none',
fontWeight: 500,
}}
>
Back to Expenses </Button>

      <Alert severity="info">Expense not found.</Alert>
    </Box>
  </Container>
);

}

const location = expense.unitNumber
? `Unit ${expense.unitNumber}`
: expense.buildingName
? expense.buildingName
: 'Property-wide';

return ( <Container maxWidth="xl">
<Box sx={{ py: 3 }}>
<Button
startIcon={<ArrowBackIcon />}
onClick={() => navigate('/expenses')}
sx={{
mb: 2.5,
color: '#475569',
textTransform: 'none',
fontWeight: 500,
'&:hover': {
bgcolor: '#f1f5f9',
},
}}
>
Back to Expenses </Button>


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
          p: { xs: 2.5, md: 3.5 },
          bgcolor: '#fff',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                mb: 1,
              }}
            >
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

              <Box>
                <Typography
                  variant="h4"
                  component="h1"
                  sx={{
                    fontWeight: 700,
                    color: '#1e293b',
                    fontSize: {
                      xs: '1.6rem',
                      sm: '2rem',
                    },
                  }}
                >
                  Expense #{expense.id}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ color: '#64748b' }}
                >
                  Expense record and transaction details
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              display: 'flex',
              gap: 1.5,
              flexWrap: 'wrap',
            }}
          >
            {canEdit && (
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() =>
                  navigate('/expenses/' + expense.id + '/edit')
                }
                sx={{
                  borderColor: '#cbd5e1',
                  color: '#475569',
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: '#3b82f6',
                    color: '#3b82f6',
                    bgcolor: '#eff6ff',
                  },
                }}
              >
                Edit Expense
              </Button>
            )}

            {user?.role === 'Admin' && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDeleteClick}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Delete
              </Button>
            )}
          </Box>
        </Box>
      </Box>

      <Box sx={{ p: { xs: 2.5, md: 3.5 } }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              lg: 'repeat(4, 1fr)',
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
              borderRadius: 2.5,
              bgcolor: '#f8fafc',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <AttachMoneyIcon sx={{ color: '#16a34a' }} />

              <Box>
                <Typography
                  variant="caption"
                  sx={{ color: '#64748b' }}
                >
                  Amount
                </Typography>

                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: '#1e293b',
                  }}
                >
                  {expense.amount.toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              border: '1px solid #e2e8f0',
              borderRadius: 2.5,
              bgcolor: '#f8fafc',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <CalendarMonthIcon sx={{ color: '#3b82f6' }} />

              <Box>
                <Typography
                  variant="caption"
                  sx={{ color: '#64748b' }}
                >
                  Expense Date
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 600,
                    color: '#1e293b',
                  }}
                >
                  {formatDate(expense.expenseDate)}
                </Typography>
              </Box>
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              border: '1px solid #e2e8f0',
              borderRadius: 2.5,
              bgcolor: '#f8fafc',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <BusinessIcon sx={{ color: '#f97316' }} />

              <Box>
                <Typography
                  variant="caption"
                  sx={{ color: '#64748b' }}
                >
                  Property
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 600,
                    color: '#1e293b',
                  }}
                >
                  {expense.propertyName}
                </Typography>
              </Box>
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              border: '1px solid #e2e8f0',
              borderRadius: 2.5,
              bgcolor: '#f8fafc',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <PersonIcon sx={{ color: '#8b5cf6' }} />

              <Box>
                <Typography
                  variant="caption"
                  sx={{ color: '#64748b' }}
                >
                  Recorded By
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 600,
                    color: '#1e293b',
                  }}
                >
                  {expense.recordedByUserName}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: '2fr 1fr',
            },
            gap: 3,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              border: '1px solid #e2e8f0',
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                px: 2.5,
                py: 2,
                borderBottom: '1px solid #e2e8f0',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: '#1e293b',
                }}
              >
                Expense Information
              </Typography>
            </Box>

            <Box sx={{ p: 2.5 }}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                  },
                  gap: 3,
                }}
              >
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#64748b',
                      display: 'block',
                      mb: 0.5,
                    }}
                  >
                    Expense ID
                  </Typography>

                  <Typography
                    sx={{
                      fontWeight: 600,
                      color: '#1e293b',
                    }}
                  >
                    #{expense.id}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#64748b',
                      display: 'block',
                      mb: 0.5,
                    }}
                  >
                    Category
                  </Typography>

                  <Chip
                    label={expense.category}
                    size="small"
                    sx={{
                      bgcolor: '#eff6ff',
                      color: '#2563eb',
                      fontWeight: 600,
                      borderRadius: 1.5,
                    }}
                  />
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#64748b',
                      display: 'block',
                      mb: 0.5,
                    }}
                  >
                    Building
                  </Typography>

                  <Typography
                    sx={{
                      fontWeight: 600,
                      color: '#1e293b',
                    }}
                  >
                    {expense.buildingName ?? 'Property-wide'}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#64748b',
                      display: 'block',
                      mb: 0.5,
                    }}
                  >
                    Unit
                  </Typography>

                  <Typography
                    sx={{
                      fontWeight: 600,
                      color: '#1e293b',
                    }}
                  >
                    {expense.unitNumber
                      ? 'Unit ' + expense.unitNumber
                      : 'Building-wide / Property-wide'}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#64748b',
                      display: 'block',
                      mb: 0.5,
                    }}
                  >
                    Vendor
                  </Typography>

                  <Typography
                    sx={{
                      fontWeight: 600,
                      color: '#1e293b',
                    }}
                  >
                    {expense.vendorName}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#64748b',
                      display: 'block',
                      mb: 0.5,
                    }}
                  >
                    Location
                  </Typography>

                  <Typography
                    sx={{
                      fontWeight: 600,
                      color: '#1e293b',
                    }}
                  >
                    {location}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography
                variant="caption"
                sx={{
                  color: '#64748b',
                  display: 'block',
                  mb: 1,
                }}
              >
                Description
              </Typography>

              <Typography
                sx={{
                  color: '#475569',
                  lineHeight: 1.7,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {expense.description || 'No description provided.'}
              </Typography>
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              border: '1px solid #e2e8f0',
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                px: 2.5,
                py: 2,
                borderBottom: '1px solid #e2e8f0',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: '#1e293b',
                }}
              >
                Record Details
              </Typography>
            </Box>

            <Box sx={{ p: 2.5 }}>
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#64748b',
                    display: 'block',
                    mb: 0.5,
                  }}
                >
                  Recorded By
                </Typography>

                <Typography
                  sx={{
                    fontWeight: 600,
                    color: '#1e293b',
                  }}
                >
                  {expense.recordedByUserName}
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#64748b',
                    display: 'block',
                    mb: 0.5,
                  }}
                >
                  Created
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ color: '#475569' }}
                >
                  {formatDateTime(expense.createdAtUtc)}
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#64748b',
                    display: 'block',
                    mb: 1,
                  }}
                >
                  Receipt
                </Typography>

                {expense.receiptUrl ? (
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<ReceiptLongIcon />}
                    href={expense.receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      borderColor: '#cbd5e1',
                      color: '#475569',
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      '&:hover': {
                        borderColor: '#3b82f6',
                        color: '#3b82f6',
                        bgcolor: '#eff6ff',
                      },
                    }}
                  >
                    View Receipt
                  </Button>
                ) : (
                  <Typography
                    variant="body2"
                    sx={{ color: '#94a3b8' }}
                  >
                    No receipt attached.
                  </Typography>
                )}
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Paper>

    <Dialog
      open={deleteDialogOpen}
      onClose={handleDeleteCancel}
      aria-labelledby="delete-expense-dialog-title"
      aria-describedby="delete-expense-dialog-description"
    >
      <DialogTitle id="delete-expense-dialog-title">
        Delete Expense
      </DialogTitle>

      <DialogContent>
        <DialogContentText id="delete-expense-dialog-description">
          Are you sure you want to delete Expense #{expense.id}?
          This action cannot be undone.
        </DialogContentText>

        {deleteError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {deleteError}
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button
          onClick={handleDeleteCancel}
          disabled={deleting}
        >
          Cancel
        </Button>

        <Button
          onClick={handleDeleteConfirm}
          color="error"
          variant="contained"
          disabled={deleting}
        >
          {deleting ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Delete'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  </Box>
</Container>

);
};

export default ExpenseDetailsPage;
