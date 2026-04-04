import { styled } from "@mui/material/styles";
import ButtonBase from "@mui/material/ButtonBase";

import { palette } from "../../theme/palette";


export const PrimaryButton = styled(ButtonBase)({
  width: "100%",
  padding: "16px 24px",
  background: `linear-gradient(135deg, ${palette.primary.main} 0%, ${palette.primary.container} 100%)`,
  color: palette.primary.onContainer,
  fontFamily: "'Manrope', sans-serif",
  fontWeight: 800,
  fontSize: 15,
  borderRadius: 8,
  border: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  boxShadow: "0 4px 16px rgba(0, 171, 114, 0.2)",
  transition: "filter 0.2s ease, transform 0.1s ease",
  "&:hover": {
    filter: "brightness(1.1)",
  },
  "&:active": {
    transform: "scale(0.98)",
  },
  "& .material-symbols-outlined": {
    fontSize: 18,
    transition: "transform 0.2s ease",
  },
  "&:hover .material-symbols-outlined": {
    transform: "translateX(4px)",
  },
  "&.Mui-disabled": {
    opacity: 0.4,
    cursor: "not-allowed",
    filter: "none",
  },
});

export const SecondaryButton = styled(ButtonBase)({
  width: "100%",
  padding: "10px 16px",
  backgroundColor: palette.neutral.surfaceContainerHigh,
  color: palette.neutral.onSurface,
  fontFamily: "'Inter', sans-serif",
  fontWeight: 500,
  fontSize: 14,
  borderRadius: 8,
  border: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  transition: "background-color 0.2s ease",
  "&:hover": {
    backgroundColor: palette.neutral.surfaceContainerHighest,
  },
  "& .material-symbols-outlined": {
    fontSize: 18,
  },
});
