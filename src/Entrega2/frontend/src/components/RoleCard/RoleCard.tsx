import {
  CardButton,
  IconWrapper,
  CardTitle,
  CardDescription,
  CheckIcon,
} from "./styles";


interface RoleCardProps {
  icon: string;
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}

function RoleCard({ icon, title, description, selected, onClick }: RoleCardProps) {
  return (
    <CardButton selected={selected} onClick={onClick}>
      <IconWrapper selected={selected}>
        <span
          className="material-symbols-outlined"
          style={selected ? { fontVariationSettings: "'FILL' 1" } : undefined}
        >
          {icon}
        </span>
      </IconWrapper>
      <div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </div>
      {selected && (
        <CheckIcon>
          <span className="material-symbols-outlined">check_circle</span>
        </CheckIcon>
      )}
    </CardButton>
  );
}

export default RoleCard;
