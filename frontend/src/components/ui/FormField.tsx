interface FormFieldProps {
  label: string;
  helper?: string;
  error?: string;
  children: React.ReactNode;
}

export function FormField({ label, helper, error, children }: FormFieldProps) {
  return (
    <div className="form-group">
      <label>{label}</label>
      {children}
      {error && <div className="error-text">{error}</div>}
      {!error && helper && <div className="helper">{helper}</div>}
    </div>
  );
}

interface SelectFieldProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  label: string;
  helper?: string;
  error?: string;
  placeholder?: string;
  options: { value: string; label: string }[];
}

export function SelectField({
  label,
  helper,
  error,
  placeholder,
  options,
  value,
  ...rest
}: SelectFieldProps) {
  return (
    <FormField label={label} helper={helper} error={error}>
      <select
        value={value}
        style={{ color: value ? "var(--gray-900)" : "var(--gray-400)" }}
        {...rest}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FormField>
  );
}
