import { palette } from "../theme/palette";


export const globalStyles = {
  "*": {
    margin: 0,
    padding: 0,
    boxSizing: "border-box",
    scrollbarWidth: "thin" as const,
    scrollbarColor: `${palette.primary.main} ${palette.neutral.background}`,
  },
  "::-webkit-scrollbar": {
    width: 8,
    height: 8,
  },
  "::-webkit-scrollbar-track": {
    background: palette.neutral.background,
  },
  "::-webkit-scrollbar-thumb": {
    backgroundColor: palette.primary.main,
    borderRadius: 4,
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
