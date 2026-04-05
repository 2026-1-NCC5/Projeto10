import { palette } from "../theme/palette";


export const globalStyles = {
  "*": {
    margin: 0,
    padding: 0,
    boxSizing: "border-box",
  },
  "html, body, #root": {
    minHeight: "100vh",
    backgroundColor: palette.neutral.background,
    color: palette.neutral.onSurface,
  },
  body: {
    fontFamily: "'Inter', sans-serif",
    WebkitFontSmoothing: "antialiased",
    MozOsxFontSmoothing: "grayscale",
  },
  "::selection": {
    backgroundColor: palette.primary.container,
    color: palette.primary.onContainer,
  },
  "input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button": {
    WebkitAppearance: "none",
    margin: 0,
  },
  "input[type=number]": {
    MozAppearance: "textfield",
  },
} as const;
