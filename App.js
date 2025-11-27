import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Splash from "./src/Screens/Splash";
import SignUp from "./src/Screens/SignUp";
import Onboarding from "./src/Screens/Onboarding";
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Initial Route is Splash */}
        <Stack.Screen name="Splash" component={Splash} />
        <Stack.Screen name= "SignUp" component={SignUp} />
        <Stack.Screen name="Onboarding" component={Onboarding} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
