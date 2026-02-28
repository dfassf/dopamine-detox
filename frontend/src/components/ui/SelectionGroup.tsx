interface SelectionGroupProps<T> {
  options: { label: string; value: T }[];
  selected: T | null;
  onChange: (value: T) => void;
}

export function SelectionGroup<T>({
  options,
  selected,
  onChange,
}: SelectionGroupProps<T>) {
  return (
    <div className="selection-group">
      {options.map((opt) => (
        <button
          key={opt.label}
          className={`selection-option${selected === opt.value ? " selection-option--active" : ""}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
