import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { palette } from "../../theme/palette";


export const PageContainer = styled(Box)({
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  overflow: "hidden",
  padding: 24,
});

export const Content = styled(Box)({
  width: "100%",
  maxWidth: 440,
  zIndex: 10,
});

export const FormContainer = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: 24,
});

export const FooterContainer = styled(Box)({
  marginTop: 32,
  textAlign: "center",
});

export const FooterText = styled(Typography)({
  fontSize: 14,
  color: palette.neutral.onSurfaceVariant,
  fontFamily: "'Inter', sans-serif",
});

export const FooterLink = styled("a")({
  color: palette.primary.main,
  fontWeight: 700,
  textDecoration: "none",
  cursor: "pointer",
  marginLeft: 4,
  "&:hover": {
    textDecoration: "underline",
  },
});

export const ErrorText = styled(Typography)({
  fontSize: 13,
  color: palette.error.main,
  fontFamily: "'Inter', sans-serif",
  textAlign: "center",
});
