import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";


export const GlowContainer = styled(Box)({
  position: "fixed",
  inset: 0,
  overflow: "hidden",
  pointerEvents: "none",
  zIndex: 0,
});

export const GlowOrb = styled(Box)<{ placement: "top-left" | "bottom-right" }>(
  ({ placement }) => ({
    position: "absolute",
    borderRadius: "50%",
    filter: "blur(120px)",
    ...(placement === "top-left" && {
      top: "-10%",
      left: "-10%",
      width: "40%",
      height: "40%",
      backgroundColor: "rgba(87, 222, 160, 0.1)",
    }),
    ...(placement === "bottom-right" && {
      bottom: "-10%",
      right: "-10%",
      width: "40%",
      height: "40%",
      backgroundColor: "rgba(0, 171, 114, 0.05)",
    }),
  })
);
