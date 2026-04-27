import { Snackbar, Alert } from '@mui/material';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  const backgroundColor = type === 'success' ? 'success.main' : 'error.main';

  return (
    <Snackbar
      open={true}
      autoHideDuration={3000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        onClose={onClose}
        severity={type}
        variant="filled"
        sx={{
          width: '100%',
          bgcolor: backgroundColor,
          color: '#FFFFFF',
          '& .MuiAlert-icon': { color: '#FFFFFF' },
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
