import { ToggleRoot, ToggleButton } from "./styles";


interface HistoryToggleProps {
  active: "personal" | "team";
  onChange: (tab: "personal" | "team") => void;
}

function HistoryToggle({ active, onChange }: HistoryToggleProps) {
  return (
    <ToggleRoot>
      <ToggleButton active={active === "personal"} onClick={() => onChange("personal")}>
        Meu Histórico
      </ToggleButton>
      <ToggleButton active={active === "team"} onClick={() => onChange("team")}>
        Equipe
      </ToggleButton>
    </ToggleRoot>
  );
}

export default HistoryToggle;
