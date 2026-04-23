import React from 'react';
import { Image, StyleSheet, Text, View, type ViewStyle, type StyleProp } from 'react-native';
import { COLORS } from '../theme';

const uvLogo = require('../assets/uv_logo.png');

type BrandHeaderProps = {
  subtitle?: string;
  style?: StyleProp<ViewStyle>;
};

const BrandHeader: React.FC<BrandHeaderProps> = ({ subtitle, style }) => (
  <View style={[styles.container, style]}>
    <View style={styles.row}>
      <Image source={uvLogo} style={styles.logo} resizeMode="contain" />
      <Text style={styles.title}>Unify Voice</Text>
    </View>
    {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
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
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },
});

export default BrandHeader;
