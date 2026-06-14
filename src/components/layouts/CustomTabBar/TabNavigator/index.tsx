import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import type { ParamListBase } from '@react-navigation/native'

import CustomTabBar from '..'
import HomeScreen from '../../../../screens/Home'
import ProfileScreen from '../../../../screens/Home/components/Profile'
import Header from '../../Header'
import Screen from '../../Screen'

const Tab = createBottomTabNavigator<ParamListBase>()

const TabNavigator = ({ navigation }: { navigation: any }) => {
  return (
    <Screen padded={false}>
      <Header
        onProfilePress={() =>
          navigation.replace('MainTabs', {
            screen: 'ProfileScreen',
          })
        }
      />
      <Tab.Navigator tabBar={(props) => <CustomTabBar {...props} />}>
        <Tab.Screen name='HomeScreen' options={{ headerShown: false }} component={HomeScreen as React.ComponentType<any>} />
        <Tab.Screen name='ProfileScreen' options={{ headerShown: false }} component={ProfileScreen as React.ComponentType<any>} />
      </Tab.Navigator>
    </Screen>
  )
}

export default TabNavigator
