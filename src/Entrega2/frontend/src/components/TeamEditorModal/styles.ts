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
    background:
      "linear-gradient(135deg, rgba(0, 31, 39, 0.97) 0%, rgba(1, 35, 44, 0.99) 100%)",
    backdropFilter: "blur(20px)",
    borderRadius: 12,
    border: `1px solid rgba(61, 74, 65, 0.25)`,
    boxShadow: "0 24px 64px rgba(0, 16, 22, 0.6)",
    padding: 0,
    minWidth: 560,
    maxWidth: 640,
    maxHeight: "85vh",
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
  "&:hover": { backgroundColor: palette.neutral.surfaceContainerHigh },
  "& .material-symbols-outlined": { fontSize: 20 },
});

export const ModalContent = styled(DialogContent)({
  padding: "16px 28px 20px",
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  gap: 16,
  "&::-webkit-scrollbar": { width: 4 },
  "&::-webkit-scrollbar-thumb": {
    background: palette.neutral.outlineVariant,
    borderRadius: 2,
  },
});

export const ModalFooter = styled(Box)({
  display: "flex",
  justifyContent: "flex-end",
  gap: 12,
  padding: "16px 28px 24px",
  borderTop: `1px solid rgba(61, 74, 65, 0.2)`,
});

export const SectionLabel = styled(Typography)({
  fontFamily: "'Inter', sans-serif",
  fontWeight: 600,
  fontSize: 11,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: palette.neutral.onSurfaceVariant,
});

export const UserList = styled(Box)({
  display: "flex",
  flexDirection: "column",
  maxHeight: 240,
  overflowY: "auto",
  border: `1px solid rgba(61, 74, 65, 0.2)`,
  borderRadius: 8,
  "&::-webkit-scrollbar": { width: 4 },
  "&::-webkit-scrollbar-thumb": {
    background: palette.neutral.outlineVariant,
    borderRadius: 2,
  },
});

export const UserRow = styled(Box)<{ selected?: boolean }>(({ selected }) => ({
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "10px 14px",
  cursor: "pointer",
  borderBottom: `1px solid rgba(61, 74, 65, 0.12)`,
  backgroundColor: selected ? "rgba(87, 222, 160, 0.1)" : "transparent",
  transition: "background-color 0.15s ease",
  "&:hover": {
    backgroundColor: selected
      ? "rgba(87, 222, 160, 0.16)"
      : palette.neutral.surfaceContainerHigh,
  },
  "&:last-child": { borderBottom: "none" },
}));

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

export const UserRoleBadge = styled(Typography)({
  fontFamily: "'Inter', sans-serif",
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: palette.neutral.onSurfaceVariant,
  padding: "3px 8px",
  borderRadius: 4,
  backgroundColor: palette.neutral.surfaceContainerHigh,
});

export const ValidationBanner = styled(Box)<{ valid: boolean }>(({ valid }) => ({
  padding: "12px 14px",
  borderRadius: 8,
  fontFamily: "'Inter', sans-serif",
  fontSize: 13,
  color: valid ? palette.primary.main : palette.tertiary.main,
  backgroundColor: valid
    ? "rgba(87, 222, 160, 0.08)"
    : "rgba(235, 112, 111, 0.1)",
  border: `1px solid ${
    valid ? "rgba(87, 222, 160, 0.2)" : "rgba(235, 112, 111, 0.25)"
  }`,
}));

export const EmptyText = styled(Typography)({
  fontFamily: "'Inter', sans-serif",
  fontSize: 13,
  color: palette.neutral.onSurfaceVariant,
  padding: "16px",
  textAlign: "center",
});
