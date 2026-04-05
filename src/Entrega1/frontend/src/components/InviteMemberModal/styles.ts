import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";

import { palette } from "../../theme/palette";


export const ModalDialog = styled(Dialog)({
  "& .MuiBackdrop-root": {
    backgroundColor: "rgba(0, 16, 22, 0.8)",
    backdropFilter: "blur(4px)",
  },
  "& .MuiDialog-paper": {
    background: "linear-gradient(135deg, rgba(0, 31, 39, 0.97) 0%, rgba(1, 35, 44, 0.99) 100%)",
    backdropFilter: "blur(20px)",
    borderRadius: 12,
    border: `1px solid rgba(61, 74, 65, 0.25)`,
    boxShadow: "0 24px 64px rgba(0, 16, 22, 0.6)",
    padding: 0,
    minWidth: 480,
    maxWidth: 560,
    maxHeight: "80vh",
    "@media (max-width: 600px)": {
      minWidth: "calc(100vw - 32px)",
    },
  },
});

export const ModalHeader = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "24px 28px 16px",
  borderBottom: `1px solid rgba(61, 74, 65, 0.2)`,
});

export const ModalTitle = styled(Typography)({
  fontFamily: "'Manrope', sans-serif",
  fontWeight: 700,
  fontSize: 18,
  color: palette.neutral.onSurface,
});

export const CloseButton = styled(ButtonBase)({
  width: 32,
  height: 32,
  borderRadius: 6,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: palette.neutral.onSurfaceVariant,
  transition: "background-color 0.2s ease",
  "&:hover": {
    backgroundColor: palette.neutral.surfaceContainerHigh,
  },
  "& .material-symbols-outlined": {
    fontSize: 20,
  },
});

export const ModalContent = styled(DialogContent)({
  padding: "16px 28px 24px",
  overflowY: "auto",
  "&::-webkit-scrollbar": { width: 4 },
  "&::-webkit-scrollbar-track": { background: "transparent" },
  "&::-webkit-scrollbar-thumb": {
    background: palette.neutral.outlineVariant,
    borderRadius: 2,
  },
});

export const RoleGroupTitle = styled(Typography)({
  fontFamily: "'Inter', sans-serif",
  fontWeight: 600,
  fontSize: 11,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: palette.neutral.onSurfaceVariant,
  marginTop: 20,
  marginBottom: 8,
  "&:first-of-type": { marginTop: 4 },
});

export const UserRow = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "10px 0",
  borderBottom: `1px solid rgba(61, 74, 65, 0.1)`,
  "&:last-child": { borderBottom: "none" },
});

export const UserInfo = styled(Box)({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: 2,
});

export const UserName = styled(Typography)({
  fontFamily: "'Inter', sans-serif",
  fontSize: 14,
  fontWeight: 500,
  color: palette.neutral.onSurface,
});

export const UserEmail = styled(Typography)({
  fontFamily: "'Inter', sans-serif",
  fontSize: 12,
  color: palette.neutral.onSurfaceVariant,
});

export const InviteButton = styled(ButtonBase)({
  padding: "6px 14px",
  borderRadius: 6,
  backgroundColor: "rgba(87, 222, 160, 0.1)",
  border: `1px solid rgba(87, 222, 160, 0.2)`,
  color: palette.primary.main,
  fontFamily: "'Inter', sans-serif",
  fontSize: 13,
  fontWeight: 500,
  transition: "background-color 0.2s ease, border-color 0.2s ease",
  flexShrink: 0,
  "&:hover": {
    backgroundColor: "rgba(87, 222, 160, 0.18)",
    borderColor: "rgba(87, 222, 160, 0.35)",
  },
});

export const EmptyText = styled(Typography)({
  fontFamily: "'Inter', sans-serif",
  fontSize: 13,
  color: palette.neutral.onSurfaceVariant,
  padding: "8px 0",
  textAlign: "center",
});
