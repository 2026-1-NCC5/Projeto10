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
  position: "relative",
  zIndex: 10,
  width: "100%",
  maxWidth: 480,
});

export const FormHeader = styled(Box)({
  marginBottom: 32,
});

export const FormTitle = styled(Typography)({
  fontFamily: "'Manrope', sans-serif",
  fontWeight: 700,
  fontSize: 20,
  color: palette.neutral.onSurface,
});

export const FormSubtitle = styled(Typography)({
  fontFamily: "'Inter', sans-serif",
  fontSize: 14,
  color: palette.neutral.onSurfaceVariant,
  marginTop: 4,
});

export const FormFields = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: 20,
});

export const PasswordGrid = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: 20,
  [theme.breakpoints.up("sm")]: {
    gridTemplateColumns: "1fr 1fr",
  },
}));

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
  fontWeight: 600,
  textDecoration: "none",
  cursor: "pointer",
  marginLeft: 4,
  "&:hover": {
    textDecoration: "underline",
    textDecorationColor: "rgba(87, 222, 160, 0.3)",
    textUnderlineOffset: 4,
  },
});

export const ErrorText = styled(Typography)({
  fontSize: 13,
  color: palette.error.main,
  fontFamily: "'Inter', sans-serif",
  textAlign: "center",
});
