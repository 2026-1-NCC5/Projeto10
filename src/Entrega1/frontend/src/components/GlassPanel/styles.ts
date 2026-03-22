import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";

import { palette } from "../../theme/palette";


export const GlassPanelRoot = styled(Box)({
  background: `linear-gradient(135deg, rgba(0, 31, 39, 0.8) 0%, rgba(1, 35, 44, 0.9) 100%)`,
  backdropFilter: "blur(20px)",
  borderRadius: 12,
  border: `1px solid rgba(61, 74, 65, 0.15)`,
  boxShadow: "32px 0 32px -16px rgba(0, 16, 22, 0.2)",
  padding: 32,
  color: palette.neutral.onSurface,
});
