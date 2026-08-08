import { config } from '@tamagui/config/v3'
import { createTamagui } from 'tamagui'

import { darkColors, lightColors } from './src/theme'

const customConfig = createTamagui({
  ...config,

  themes: {
    ...config.themes,

    dark: {
      ...config.themes.dark,
      background: darkColors.background,
      color: darkColors.textPrimary,
      primary: darkColors.background,
      secondary: darkColors.successBright,
      green: darkColors.primary,
    },

    light: {
      ...config.themes.light,
      background: lightColors.background,
      color: lightColors.textPrimary,
      primary: lightColors.background,
      secondary: lightColors.primaryDark,
      green: lightColors.primary,
    },
  },
})

export type AppConfig = typeof customConfig

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default customConfig
