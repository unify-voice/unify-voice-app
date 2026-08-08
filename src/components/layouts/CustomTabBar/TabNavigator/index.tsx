import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import type { ParamListBase } from '@react-navigation/native'
import React from 'react'

import CustomTabBar from '..'
import { useAppTheme } from '../../../../context/Theme'
import HomeScreen from '../../../../screens/Home'
import ProfileScreen from '../../../../screens/Home/components/Profile'
import Header from '../../Header'
import Screen from '../../Screen'

const Tab = createBottomTabNavigator<ParamListBase>()

const TabNavigator = () => {
  const { colors } = useAppTheme()

  return (
    <Screen padded={false}>
      <Tab.Navigator
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={({ navigation }) => ({
          headerShown: true,
          header: () => <Header onProfilePress={() => navigation.navigate('ProfileScreen')} />,
          freezeOnBlur: true,
          sceneStyle: { backgroundColor: colors.background },
        })}
      >
        <Tab.Screen name='HomeScreen' component={HomeScreen as React.ComponentType<any>} />
        <Tab.Screen name='ProfileScreen' component={ProfileScreen as React.ComponentType<any>} />
      </Tab.Navigator>
    </Screen>
  )
}

export default TabNavigator
