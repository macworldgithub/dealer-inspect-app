import "react-native-gesture-handler";

import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import Splash from "./src/app/Screens/Splash";
// import SignUp from "./src/app/Screens/Signup";
import Onboarding from "./src/app/Screens/Onboarding";
import ChooseWorkFlow from "./src/app/Screens/ChooseWorkFlow";
import ServiceIntake from "./src/app/Screens/ServiceIntake";
import Merchandising from "./src/app/Screens/Merchandising";
import BottomTabNavigator from "./src/app/navigation/createBottomTabNavigator";
import Profile from "./src/app/Screens/Profile";
import CarDetails from "./src/app/Screens/CarDetails";
import ServiceProtectionScreen1 from "./src/app/Screens/ServiceProtectionScreen1";
import SignIn from "./src/app/Screens/Signin";
import SignUp from "./src/app/Screens/Signup";
import InspectionScreen from "./src/app/Screens/InspectionScreen";
const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="Splash" component={Splash} />
        <Stack.Screen name="SignIn" component={SignIn} />
        <Stack.Screen name="SignUp" component={SignUp} />
        <Stack.Screen name="Onboarding" component={Onboarding} />
        <Stack.Screen name="ChooseWorkFlow" component={ChooseWorkFlow} />
        <Stack.Screen name="ServiceIntake" component={ServiceIntake} />
        <Stack.Screen name="Merchandising" component={Merchandising} />
        <Stack.Screen
          name="BottomTabNavigator"
          component={BottomTabNavigator}
        />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="CarDetails" component={CarDetails} />
        <Stack.Screen name="HomeTabs" component={BottomTabNavigator} />
        <Stack.Screen name="InspectionScreen" component={InspectionScreen} />
        <Stack.Screen
          name="ServiceProtectionScreen1"
          component={ServiceProtectionScreen1}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
