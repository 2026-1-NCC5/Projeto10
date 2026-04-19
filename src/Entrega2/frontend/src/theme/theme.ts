import { createTheme } from "@mui/material/styles";

import { palette, getPalette } from "./palette";


export function createAppTheme(mode: "dark" | "light" = "dark") {
  const p = getPalette(mode);
  return createTheme({
    palette: {
      mode,
      primary: {
        main: p.primary.main,
        dark: p.primary.container,
        contrastText: p.primary.onPrimary,
      },
      secondary: {
        main: p.secondary.main,
        dark: p.secondary.container,
        contrastText: p.secondary.onSecondary,
      },
      error: {
        main: p.error.main,
        dark: p.error.container,
        contrastText: p.error.onError,
      },
      background: {
        default: p.neutral.background,
        paper: p.neutral.surfaceContainer,
      },
      text: {
        primary: p.neutral.onSurface,
        secondary: p.neutral.onSurfaceVariant,
      },
    },
    typography: {
      fontFamily: "'Inter', sans-serif",
      h1: { fontFamily: "'Manrope', sans-serif", fontWeight: 800, letterSpacing: "-0.02em" },
      h2: { fontFamily: "'Manrope', sans-serif", fontWeight: 800, letterSpacing: "-0.02em" },
      h3: { fontFamily: "'Manrope', sans-serif", fontWeight: 700 },
      h4: { fontFamily: "'Manrope', sans-serif", fontWeight: 700 },
      h5: { fontFamily: "'Manrope', sans-serif", fontWeight: 700 },
      h6: { fontFamily: "'Manrope', sans-serif", fontWeight: 700 },
      button: { fontFamily: "'Manrope', sans-serif", fontWeight: 700, textTransform: "none" },
      body1: { fontFamily: "'Inter', sans-serif" },
      body2: { fontFamily: "'Inter', sans-serif" },
      caption: { fontFamily: "'Inter', sans-serif" },
      overline: { fontFamily: "'Inter', sans-serif", fontWeight: 600, letterSpacing: "0.1em" },
    },
    shape: { borderRadius: 8 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: p.neutral.background,
            color: p.neutral.onSurface,
          },
        },
      },
    },
  });
}


const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: palette.primary.main,
      dark: palette.primary.container,
      contrastText: palette.primary.onPrimary,
    },
    secondary: {
      main: palette.secondary.main,
      dark: palette.secondary.container,
      contrastText: palette.secondary.onSecondary,
    },
    error: {
      main: palette.error.main,
      dark: palette.error.container,
      contrastText: palette.error.onError,
    },
    background: {
      default: palette.neutral.background,
      paper: palette.neutral.surfaceContainer,
    },
    text: {
      primary: palette.neutral.onSurface,
      secondary: palette.neutral.onSurfaceVariant,
    },
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    h1: {
      fontFamily: "'Manrope', sans-serif",
      fontWeight: 800,
      letterSpacing: "-0.02em",
    },
    h2: {
      fontFamily: "'Manrope', sans-serif",
      fontWeight: 800,
      letterSpacing: "-0.02em",
    },
    h3: {
      fontFamily: "'Manrope', sans-serif",
      fontWeight: 700,
    },
    h4: {
      fontFamily: "'Manrope', sans-serif",
      fontWeight: 700,
    },
    h5: {
      fontFamily: "'Manrope', sans-serif",
      fontWeight: 700,
    },
    h6: {
      fontFamily: "'Manrope', sans-serif",
      fontWeight: 700,
    },
    button: {
      fontFamily: "'Manrope', sans-serif",
      fontWeight: 700,
      textTransform: "none",
    },
    body1: {
      fontFamily: "'Inter', sans-serif",
    },
    body2: {
      fontFamily: "'Inter', sans-serif",
    },
    caption: {
      fontFamily: "'Inter', sans-serif",
    },
    overline: {
      fontFamily: "'Inter', sans-serif",
      fontWeight: 600,
      letterSpacing: "0.1em",
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: palette.neutral.background,
          color: palette.neutral.onSurface,
        },
      },
    },
  },
});

export default theme;
