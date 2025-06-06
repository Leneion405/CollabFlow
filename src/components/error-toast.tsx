import { toast } from 'react-hot-toast';

export const showErrorToast = (error: unknown) => {
  let message = 'An unexpected error occurred';
  
  // Type guard for objects with message property
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const errorWithMessage = error as { message?: string };
    if (typeof errorWithMessage.message === 'string') {
      message = errorWithMessage.message;
    }
  } else if (typeof error === 'string') {
    message = error;
  } else if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error
  ) {
    const errorWithResponse = error as {
      response?: {
        data?: {
          message?: string;
        };
      };
    };
    if (typeof errorWithResponse.response?.data?.message === 'string') {
      message = errorWithResponse.response.data.message;
    }
  }

  toast.error(message, {
    duration: 4000,
    position: 'top-right',
    style: {
      background: '#ef4444',
      color: '#ffffff',
    },
  });
};

export const showSuccessToast = (message: string) => {
  toast.success(message, {
    duration: 3000,
    position: 'top-right',
    style: {
      background: '#10b981',
      color: '#ffffff',
    },
  });
};
