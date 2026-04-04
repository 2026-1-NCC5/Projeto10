import { CardRoot, CardIconBox, CardValue, CardLabel } from "./styles";


interface SummaryCardProps {
  icon: string;
  label: string;
  value: string | number;
}

function SummaryCard({ icon, label, value }: SummaryCardProps) {
  return (
    <CardRoot>
      <CardIconBox>
        <span className="material-symbols-outlined">{icon}</span>
      </CardIconBox>
      <div>
        <CardValue>{value}</CardValue>
        <CardLabel>{label}</CardLabel>
      </div>
    </CardRoot>
  );
}

export default SummaryCard;
