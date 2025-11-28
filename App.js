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
        {/* <Stack.Screen name="SignUp" component={SignUp} /> */}
        <Stack.Screen name="Onboarding" component={Onboarding} />
        <Stack.Screen name="ChooseWorkFlow" component={ChooseWorkFlow} />
        <Stack.Screen name="ServiceIntake" component={ServiceIntake} />
        <Stack.Screen name="Merchandising" component={Merchandising} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
