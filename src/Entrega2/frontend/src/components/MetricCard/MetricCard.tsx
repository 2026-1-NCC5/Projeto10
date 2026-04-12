import type { ReactNode } from "react";

import GlassPanel from "../GlassPanel/GlassPanel";
import { CardRoot, CardLabel, CardValue, CardHint, IconWrap } from "./styles";


interface Props {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: string;
}


function MetricCard({ label, value, hint, icon }: Props) {
  return (
    <GlassPanel>
      <CardRoot>
        {icon && (
          <IconWrap>
            <span className="material-symbols-outlined">{icon}</span>
          </IconWrap>
        )}
        <CardLabel>{label}</CardLabel>
        <CardValue>{value}</CardValue>
        {hint && <CardHint>{hint}</CardHint>}
      </CardRoot>
    </GlassPanel>
  );
}


export default MetricCard;
