import { styled, keyframes } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { palette } from "../../theme/palette";


const ping = keyframes`
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
`;

export const IndicatorContainer = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 12,
  background: "rgba(0, 31, 39, 0.8)",
  backdropFilter: "blur(20px)",
  padding: "8px 16px",
  borderRadius: 9999,
  border: `1px solid rgba(61, 74, 65, 0.1)`,
});

export const PulseWrapper = styled(Box)({
  position: "relative",
  display: "flex",
  width: 12,
  height: 12,
});

export const PulseRing = styled("span")({
  position: "absolute",
  display: "inline-flex",
  width: "100%",
  height: "100%",
  borderRadius: "50%",
  backgroundColor: palette.primary.main,
  opacity: 0.75,
  animation: `${ping} 1s cubic-bezier(0, 0, 0.2, 1) infinite`,
});

export const PulseDot = styled("span")({
  position: "relative",
  display: "inline-flex",
  width: 12,
  height: 12,
  borderRadius: "50%",
  backgroundColor: palette.primary.main,
});

export const IndicatorText = styled(Typography)({
  fontFamily: "'Inter', sans-serif",
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  color: palette.neutral.onSurface,
});
