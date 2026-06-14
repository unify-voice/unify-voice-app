import { config } from '@tamagui/config/v3'
import { createTamagui } from 'tamagui'

import { colors } from './src/theme'

const customConfig = createTamagui({
  ...config,

  themes: {
    ...config.themes, // ✅ keep defaults

    dark: {
      ...config.themes.dark, // ✅ extend existing dark theme
      background: colors.background,
      color: '#ECFDF5',
      primary: '#0d0d0d',
      secondary: '#4ADE80',
      green: colors.primary,
    },
  },
})

export type AppConfig = typeof customConfig

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default customConfig
