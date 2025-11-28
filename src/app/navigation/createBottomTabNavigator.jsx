import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text, Pressable } from "react-native";
import tw from "tailwind-react-native-classnames";

import Home from "../Screens/Home";
import Profile from "../Screens/Profile";
import InspectionList from "../Screens/InspectionList";

// ✅ CHANGED: Using AppIcon instead of Ionicons
import AppIcon from "../components/AppIcon";

const Tab = createBottomTabNavigator();

// ✅ UPDATED: TabBarIcon now uses AppIcon instead of Ionicons
const TabBarIcon = ({ focused, color, size, iconName }) => (
  <View style={tw`items-center justify-center`}>
    <AppIcon name={iconName} size={size} color="#FFC302" />
  </View>
);

const TabBarLabel = ({ color, children }) => (
  <Text style={[tw`text-xs font-medium -mb-2`, { color }]}>{children}</Text>
);

const CustomTabBarButton = ({ children, onPress }) => (
  <Pressable
    onPress={onPress}
    style={tw`flex-1 items-center justify-center`}
    android_ripple={{ color: "transparent" }}
  >
    {children}
  </Pressable>
);

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarButton: (props) => <CustomTabBarButton {...props} />,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          // ✅ These names will work across both Android & iOS
          if (route.name === "Home") iconName = "home";
          else if (route.name === "Inspect") iconName = "camera";
          else if (route.name === "Profile") iconName = "user";

          return (
            <TabBarIcon
              focused={focused}
              color={color}
              size={size}
              iconName={iconName}
            />
          );
        },
        tabBarLabel: ({ color, children }) => (
          <TabBarLabel color={color}>{children}</TabBarLabel>
        ),
        tabBarStyle: [
          tw`bg-white border-t border-gray-200 pb-2`,
          {
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 10,
          },
        ],
        tabBarActiveTintColor: "#2f855a",
        tabBarInactiveTintColor: "#8E8E93",
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={Home} options={{ title: "Home" }} />
      <Tab.Screen
        name="Inspect"
        component={InspectionList}
        options={{ title: "Inspect" }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{ title: "Profile" }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
