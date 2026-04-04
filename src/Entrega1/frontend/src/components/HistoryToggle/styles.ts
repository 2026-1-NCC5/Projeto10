import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";

import { palette } from "../../theme/palette";


export const ToggleRoot = styled(Box)({
  display: "inline-flex",
  backgroundColor: palette.neutral.surfaceContainerHigh,
  borderRadius: 8,
  padding: 4,
  marginBottom: 16,
  gap: 2,
});

export const ToggleButton = styled(ButtonBase)<{ active?: boolean }>(({ active }) => ({
  padding: "8px 16px",
  borderRadius: 6,
  fontFamily: "'Inter', sans-serif",
  fontSize: 13,
  fontWeight: 500,
  transition: "background-color 0.2s ease, color 0.2s ease",
  backgroundColor: active ? "rgba(87, 222, 160, 0.12)" : "transparent",
  color: active ? palette.primary.main : palette.neutral.onSurfaceVariant,
}));
