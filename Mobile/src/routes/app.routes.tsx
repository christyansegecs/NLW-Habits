
import { createNativeStackNavigator } from '@react-navigation/native-stack'

const { Navigator, Screen } = createNativeStackNavigator()

import { Home } from '../screens/Home'
import { New } from '../screens/New'
import { NewSingleTask } from '../screens/NewSingleTask' // Import the new screen
import { Habit } from '../screens/Habit'

export function AppRoutes() {

    return (
        <Navigator screenOptions={{ headerShown: false }}>
            <Screen
                name='home'
                component={Home}
            />
            <Screen
                name='new'
                component={New}
            />
            <Screen
                name='single' // Add the new screen name
                component={NewSingleTask} // Add the new screen component
            />
            <Screen
                name='habit'
                component={Habit}
            />
        </Navigator>
    )
}
