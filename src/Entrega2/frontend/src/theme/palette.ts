export const lightPalette = {
  primary: {
    main: "#00AB72",
    container: "#76FBBA",
    fixed: "#76FBBA",
    fixedDim: "#57DEA0",
    onPrimary: "#FFFFFF",
    onContainer: "#003823",
    onFixed: "#002112",
    onFixedVariant: "#005234",
    inverse: "#57DEA0",
  },
  secondary: {
    main: "#454747",
    container: "#E2E2E2",
    fixed: "#E2E2E2",
    fixedDim: "#C6C6C7",
    onSecondary: "#FFFFFF",
    onContainer: "#1A1C1C",
    onFixed: "#1A1C1C",
    onFixedVariant: "#454747",
  },
  tertiary: {
    main: "#EB706F",
    container: "#FFDAD8",
    fixed: "#FFDAD8",
    fixedDim: "#FFB3B0",
    onTertiary: "#FFFFFF",
    onContainer: "#410006",
    onFixed: "#410006",
    onFixedVariant: "#842327",
  },
  error: {
    main: "#BA1A1A",
    container: "#FFDAD6",
    onError: "#FFFFFF",
    onContainer: "#410002",
  },
  neutral: {
    background: "#F7FAFB",
    surface: "#FFFFFF",
    surfaceDim: "#E8EEF0",
    surfaceBright: "#FFFFFF",
    surfaceContainerLowest: "#FFFFFF",
    surfaceContainerLow: "#F1F6F8",
    surfaceContainer: "#EAF2F4",
    surfaceContainerHigh: "#E2ECEE",
    surfaceContainerHighest: "#D9E6E9",
    surfaceVariant: "#DEE5E3",
    surfaceTint: "#00AB72",
    onSurface: "#0B2530",
    onSurfaceVariant: "#3D4A41",
    onBackground: "#0B2530",
    outline: "#6F7B72",
    outlineVariant: "#BECABD",
    inverseSurface: "#15343E",
    inverseOnSurface: "#E6F3F9",
  },
} as const;


export type AppPalette = typeof lightPalette;


export const palette = {
  primary: {
    main: "#57DEA0",
    container: "#00AB72",
    fixed: "#76FBBA",
    fixedDim: "#57DEA0",
    onPrimary: "#003823",
    onContainer: "#003621",
    onFixed: "#002112",
    onFixedVariant: "#005234",
    inverse: "#006C47",
  },
  secondary: {
    main: "#C6C6C7",
    container: "#454747",
    fixed: "#E2E2E2",
    fixedDim: "#C6C6C7",
    onSecondary: "#2F3131",
    onContainer: "#B4B5B5",
    onFixed: "#1A1C1C",
    onFixedVariant: "#454747",
  },
  tertiary: {
    main: "#FFB3B0",
    container: "#EB706F",
    fixed: "#FFDAD8",
    fixedDim: "#FFB3B0",
    onTertiary: "#640A13",
    onContainer: "#620712",
    onFixed: "#410006",
    onFixedVariant: "#842327",
  },
  error: {
    main: "#FFB4AB",
    container: "#93000A",
    onError: "#690005",
    onContainer: "#FFDAD6",
  },
  neutral: {
    background: "#00161D",
    surface: "#00161D",
    surfaceDim: "#00161D",
    surfaceBright: "#1F3D47",
    surfaceContainerLowest: "#001016",
    surfaceContainerLow: "#001F27",
    surfaceContainer: "#01232C",
    surfaceContainerHigh: "#0D2E37",
    surfaceContainerHighest: "#1A3942",
    surfaceVariant: "#1A3942",
    surfaceTint: "#57DEA0",
    onSurface: "#C8E8F4",
    onSurfaceVariant: "#BCCABF",
    onBackground: "#C8E8F4",
    outline: "#86948A",
    outlineVariant: "#3D4A41",
    inverseSurface: "#C8E8F4",
    inverseOnSurface: "#15343E",
  },
} as const;


export const darkPalette = palette;


export function getPalette(mode: "dark" | "light"): AppPalette {
  return mode === "dark" ? (darkPalette as unknown as AppPalette) : lightPalette;
}
