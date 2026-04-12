import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { palette } from "../../theme/palette";


export const ErrorRoot = styled(Box)({
  padding: 24,
  borderRadius: 12,
  border: `1px solid ${palette.tertiary.main}`,
  backgroundColor: "rgba(235, 112, 111, 0.08)",
  marginBottom: 16,
});

export const ErrorTitle = styled(Typography)({
  fontFamily: "'Manrope', sans-serif",
  fontWeight: 700,
  fontSize: 15,
  color: palette.tertiary.main,
  marginBottom: 6,
});

export const ErrorMessage = styled(Typography)({
  fontFamily: "'Inter', sans-serif",
  fontSize: 13,
  color: palette.neutral.onSurfaceVariant,
});
