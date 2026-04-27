type ReadoutProps = {
  label: string;
  value: string;
};

export function Readout({ label, value }: ReadoutProps) {
  return (
    <div className="c-readout">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
