import { TextField } from "@mui/material";

const NumberInput: React.FC<{
    value: string | number;
    onChange: (value: string) => void;
    label: string;
    min?: number;
    max?: number;
    allowNegative?: boolean;
    sx?: any;
    size?: "small" | "medium";
  }> = ({ value, onChange, label, min = 0, max, allowNegative = false, sx, size = "small" }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      
      // Autoriser uniquement les chiffres et le signe moins si permis
      if (!/^-?\d*$/.test(newValue)) return;
      
      // Vérifier les limites
      const numValue = Number(newValue);
      if (newValue === '' || newValue === '-') {
        onChange('0');
        return;
      }
      if (!allowNegative && numValue < 0) return;
      if (min !== undefined && numValue < min) return;
      if (max !== undefined && numValue > max) return;
  
      onChange(newValue);
    };
  
    // Formater à la perte de focus
    const handleBlur = () => {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        onChange('0');
        return;
      }
      onChange(String(numValue));
    };
  
    return (
      <TextField
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        label={label}
        size={size}
        sx={{
          '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
            display: 'none'
          },
          ...sx
        }}
        inputProps={{
          inputMode: 'numeric',
          pattern: allowNegative ? '^-?\\d*$' : '\\d*'
        }}
      />
    );
  };

  export default NumberInput;