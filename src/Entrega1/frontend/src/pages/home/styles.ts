import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";

import { palette } from "../../theme/palette";


export const PageContainer = styled(Box)({
  minHeight: "100vh",
  backgroundColor: palette.neutral.background,
  position: "relative",
  overflow: "hidden",
});
