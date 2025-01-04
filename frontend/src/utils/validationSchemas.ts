import * as Yup from 'yup';

export const tradingFormSchema = Yup.object({
  amount: Yup.number()
    .required('Amount is required')
    .positive('Amount must be positive')
    .max(100000, 'Amount cannot exceed 100,000'),
    
  type: Yup.string()
    .required('Trade type is required')
    .oneOf(['buy', 'sell'], 'Invalid trade type'),
});