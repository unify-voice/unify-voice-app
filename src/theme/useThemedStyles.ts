import { useMemo } from 'react'

import { useAppTheme } from '../context/Theme'

import type { ThemeColors } from './colors'

/**
 * Memoized themed StyleSheet factory. Pass a module-level createStyles(colors) function.
 */
export function useThemedStyles<T>(factory: (colors: ThemeColors) => T): T {
  const { colors } = useAppTheme()
  return useMemo(() => factory(colors), [colors, factory])
}
