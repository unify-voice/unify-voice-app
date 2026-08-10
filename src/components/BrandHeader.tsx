import React, { useMemo } from 'react'
import { Image, StyleSheet, Text, View, type ViewStyle, type StyleProp } from 'react-native'

import uvLogo from '../assets/logo.png'
import { useAppTheme } from '../context/Theme'

type BrandHeaderProps = {
  subtitle?: string
  style?: StyleProp<ViewStyle>
}

const BrandHeader: React.FC<BrandHeaderProps> = ({ subtitle, style }) => {
  const { colors } = useAppTheme()
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          width: '100%',
          marginBottom: 12,
        },
        row: {
          flexDirection: 'row',
          alignItems: 'center',
        },
        logo: {
          width: 38,
          height: 38,
          borderRadius: 10,
          marginRight: 12,
        },
        title: {
          color: colors.textPrimary,
          fontSize: 22,
          fontWeight: '800',
          letterSpacing: 0.3,
        },
        subtitle: {
          color: colors.textSecondary,
          fontSize: 14,
          marginTop: 4,
          lineHeight: 20,
        },
      }),
    [colors],
  )

  return (
    <View style={[styles.container, style]}>
      <View style={styles.row}>
        <Image source={uvLogo} style={styles.logo} resizeMode='contain' />
        <Text style={styles.title}>Unify Voice</Text>
      </View>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  )
}

export default BrandHeader
