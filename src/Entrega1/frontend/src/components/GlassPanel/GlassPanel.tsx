import type { BoxProps } from "@mui/material/Box";

import { GlassPanelRoot } from "./styles";


function GlassPanel({ children, ...props }: BoxProps) {
  return <GlassPanelRoot {...props}>{children}</GlassPanelRoot>;
}

export default GlassPanel;
