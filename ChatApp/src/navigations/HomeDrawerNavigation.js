import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import ProfileScreen from '../screens/ProfileScreen';
import HomeScreen from '../screens/HomeScreen';

const Drawer = createDrawerNavigator();

const HomeDrawerNavigation = () => {
    return (
        <Drawer.Navigator initialRouteName="HomeStack">
            <Drawer.Screen name="HomeStack" component={HomeScreen} options={{ title: 'Home' }} />
            {/* <Drawer.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} /> */}
            <Drawer.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />

        </Drawer.Navigator>
    );
};

export default HomeDrawerNavigation;