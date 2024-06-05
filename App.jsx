/* eslint-disable prettier/prettier */
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import SignInScreen from './screens/SignInScreen';
import SignUpScreen from './screens/SignUpScreen';
import HomeScreen from './screens/HomeScreen';
import {UserProvider} from './UserContext';

const Stack = createStackNavigator();

const App = () => {
  return (
    <UserProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="SignInScreen">
          <Stack.Screen
            name="SignIn"
            component={SignInScreen}
            options={{title: 'Login', headerShown: false}}
          />
          <Stack.Screen
            name="SignUp"
            component={SignUpScreen}
            options={{title: 'Sign Up'}}
          />
          {/* Add a nested stack navigator for HomeScreen */}
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{title: 'Home', headerShown: false}}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
};

export default App;
