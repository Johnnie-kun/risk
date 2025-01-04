import * as Yup from 'yup';

// Dynamic error messages based on input values
const amountErrorMessage = (value: number) =>
  `Amount must be less than or equal to ${value.toLocaleString()}`;

export const tradingFormSchema = Yup.object({
  amount: Yup.number()
    .required('Amount is required')
    .typeError('Amount must be a valid number') // Ensures the input is numeric
    .positive('Amount must be greater than 0')
    .max(100000, amountErrorMessage(100000)) // Dynamic error message
    .test(
      'is-decimal',
      'Amount can have up to two decimal places',
      (value) => (value ? /^\d+(\.\d{1,2})?$/.test(value.toString()) : true)
    )
    .test(
      'min-amount',
      'Amount must be at least $10',
      (value) => (value ? value >= 10 : false) // Minimum amount of $10
    ),

  type: Yup.string()
    .required('Trade type is required')
    .oneOf(['buy', 'sell'], 'Invalid trade type'), // Strictly allows only "buy" or "sell"

  leverage: Yup.number()
    .optional()
    .integer('Leverage must be an integer')
    .min(1, 'Leverage must be at least 1x')
    .max(125, 'Leverage cannot exceed 125x'), // Optional field for leverage (futures trading)

  stopLoss: Yup.number()
    .optional()
    .positive('Stop loss must be greater than 0')
    .typeError('Stop loss must be a valid number')
    .test(
      'is-decimal',
      'Stop loss can have up to two decimal places',
      (value) => (value ? /^\d+(\.\d{1,2})?$/.test(value.toString()) : true)
    ),

  takeProfit: Yup.number()
    .optional()
    .positive('Take profit must be greater than 0')
    .typeError('Take profit must be a valid number')
    .test(
      'is-decimal',
      'Take profit can have up to two decimal places',
      (value) => (value ? /^\d+(\.\d{1,2})?$/.test(value.toString()) : true)
    ),
});