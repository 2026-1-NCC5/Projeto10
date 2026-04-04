import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";

import { palette } from "../../theme/palette";
import { SIDEBAR_WIDTH } from "../Sidebar/styles";


export const LayoutRoot = styled(Box)({
  display: "flex",
  minHeight: "100vh",
  backgroundColor: palette.neutral.background,
  position: "relative",
  overflow: "hidden",
});

export const MainContent = styled(Box)({
  flex: 1,
  marginLeft: SIDEBAR_WIDTH,
  padding: 32,
  position: "relative",
  zIndex: 1,
  overflowY: "auto",
  minHeight: "100vh",
});
