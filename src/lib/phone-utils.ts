export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters except the leading +
  let cleaned = phone.trim();
  
  // If it doesn't start with +, add it
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned.replace(/\D/g, '');
  } else {
    cleaned = '+' + cleaned.slice(1).replace(/\D/g, '');
  }
  
  return cleaned;
};

export const validatePhoneNumber = (phone: string): { isValid: boolean; error?: string } => {
  if (!phone.trim()) {
    return { isValid: true }; // Empty phone is valid (optional field)
  }
  
  const cleaned = phone.trim();
  
  if (!cleaned.startsWith('+')) {
    return { isValid: false, error: "Phone number must start with '+'" };
  }
  
  const digits = cleaned.slice(1).replace(/\D/g, '');
  
  if (digits.length < 7) {
    return { isValid: false, error: "Phone number must have at least 7 digits" };
  }
  
  if (digits.length > 15) {
    return { isValid: false, error: "Phone number cannot exceed 15 digits" };
  }
  
  return { isValid: true };
};
