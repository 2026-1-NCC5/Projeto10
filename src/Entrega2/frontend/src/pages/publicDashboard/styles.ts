import { styled } from "@mui/material/styles"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"


export const PageRoot = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  width: "100%",
  backgroundColor: theme.palette.background.default,
  color: theme.palette.text.primary,
  padding: "28px 36px 48px",
  display: "flex",
  flexDirection: "column",
  gap: 24,
  boxSizing: "border-box",
}))


export const HeaderBar = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  padding: "18px 24px",
  borderRadius: 16,
  backgroundColor: theme.palette.mode === "dark" ? "#00232E" : "#0B2530",
  color: "#FFFFFF",
  boxShadow: theme.palette.mode === "dark" ? "0 4px 20px rgba(0,0,0,.35)" : "0 4px 20px rgba(11,37,48,.18)",
}))


export const Brand = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 14,
})


export const BrandBadge = styled(Box)(({ theme }) => ({
  width: 52,
  height: 52,
  borderRadius: "50%",
  backgroundColor: theme.palette.primary.main,
  color: "#FFFFFF",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "'Manrope', sans-serif",
  fontWeight: 800,
  fontSize: 14,
  letterSpacing: "0.04em",
  textAlign: "center",
  lineHeight: 1.1,
  padding: 4,
  boxSizing: "border-box",
}))


export const BrandText = styled(Box)({
  display: "flex",
  flexDirection: "column",
})


export const BrandTitle = styled(Typography)({
  fontFamily: "'Manrope', sans-serif",
  fontWeight: 800,
  fontSize: 20,
  color: "#FFFFFF",
  lineHeight: 1.1,
})


export const BrandSubtitle = styled(Typography)({
  fontFamily: "'Inter', sans-serif",
  fontSize: 12,
  color: "rgba(255,255,255,0.72)",
})


export const HeaderActions = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 10,
})


export const IconButton = styled("button")({
  background: "rgba(255,255,255,0.12)",
  color: "#FFFFFF",
  border: "1px solid rgba(255,255,255,0.18)",
  borderRadius: 10,
  width: 40,
  height: 40,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "background 160ms",
  "&:hover": { background: "rgba(255,255,255,0.2)" },
})


export const LoginLink = styled("a")(({ theme }) => ({
  background: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  textDecoration: "none",
  fontFamily: "'Manrope', sans-serif",
  fontWeight: 700,
  fontSize: 13,
  padding: "9px 16px",
  borderRadius: 10,
  cursor: "pointer",
  transition: "transform 160ms",
  "&:hover": { transform: "translateY(-1px)" },
}))


export const FiltersBar = styled(Box)(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  gap: 16,
  padding: 16,
  backgroundColor: theme.palette.background.paper,
  borderRadius: 14,
  border: `1px solid ${theme.palette.divider}`,
}))


export const FilterField = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: 6,
  minWidth: 180,
  flex: 1,
})


export const FilterLabel = styled(Typography)(({ theme }) => ({
  fontFamily: "'Inter', sans-serif",
  fontSize: 11,
  color: theme.palette.text.secondary,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
}))


export const FilterInput = styled("input")(({ theme }) => ({
  fontFamily: "'Inter', sans-serif",
  fontSize: 14,
  color: theme.palette.text.primary,
  backgroundColor: theme.palette.background.default,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 10,
  padding: "10px 12px",
  outline: "none",
  "&:focus": { borderColor: theme.palette.primary.main },
}))


export const ResetButton = styled("button")(({ theme }) => ({
  alignSelf: "flex-end",
  background: "transparent",
  color: theme.palette.primary.main,
  border: `1px solid ${theme.palette.primary.main}`,
  borderRadius: 10,
  padding: "9px 14px",
  fontFamily: "'Manrope', sans-serif",
  fontWeight: 700,
  fontSize: 13,
  cursor: "pointer",
  "&:hover": { background: theme.palette.primary.main + "14" },
}))


export const MetricsGrid = styled(Box)({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 16,
})


export const MetricCard = styled(Box)(({ theme }) => ({
  padding: "20px 22px",
  borderRadius: 16,
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  display: "flex",
  flexDirection: "column",
  gap: 6,
}))


export const MetricLabel = styled(Typography)(({ theme }) => ({
  fontFamily: "'Inter', sans-serif",
  fontSize: 12,
  color: theme.palette.text.secondary,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
}))


export const MetricValue = styled(Typography)({
  fontFamily: "'Manrope', sans-serif",
  fontWeight: 800,
  fontSize: 30,
  lineHeight: 1.1,
})


export const MetricHint = styled(Typography)(({ theme }) => ({
  fontFamily: "'Inter', sans-serif",
  fontSize: 12,
  color: theme.palette.text.secondary,
}))


export const ChartsGrid = styled(Box)({
  display: "grid",
  gridTemplateColumns: "2fr 1fr",
  gap: 16,
  "@media (max-width: 1100px)": {
    gridTemplateColumns: "1fr",
  },
})


export const ChartPanel = styled(Box)(({ theme }) => ({
  padding: 20,
  borderRadius: 16,
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  display: "flex",
  flexDirection: "column",
  gap: 12,
  minHeight: 360,
}))


export const ChartTitle = styled(Typography)({
  fontFamily: "'Manrope', sans-serif",
  fontWeight: 700,
  fontSize: 16,
})


export const TablePanel = styled(Box)(({ theme }) => ({
  padding: 0,
  borderRadius: 16,
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  overflow: "hidden",
}))


export const Table = styled("table")({
  width: "100%",
  borderCollapse: "collapse",
  fontFamily: "'Inter', sans-serif",
  fontSize: 14,
})


export const Th = styled("th")(({ theme }) => ({
  padding: "14px 18px",
  textAlign: "left",
  fontWeight: 700,
  fontSize: 12,
  color: theme.palette.text.secondary,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  borderBottom: `1px solid ${theme.palette.divider}`,
}))


export const Td = styled("td")(({ theme }) => ({
  padding: "12px 18px",
  borderBottom: `1px solid ${theme.palette.divider}`,
  color: theme.palette.text.primary,
}))


export const TableTitle = styled(Typography)({
  padding: "16px 20px 8px",
  fontFamily: "'Manrope', sans-serif",
  fontWeight: 700,
  fontSize: 15,
})


export const LoadingBox = styled(Box)(({ theme }) => ({
  padding: 48,
  textAlign: "center",
  color: theme.palette.text.secondary,
  fontFamily: "'Inter', sans-serif",
}))
