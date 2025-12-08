// import React from "react";
// import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
// import { View, Text, TouchableOpacity } from "react-native";

// import { Home, Camera, User } from "lucide-react-native";

// import ChooseWorkFlow from "../Screens/ChooseWorkFlow";
// import CarDetails from "../Screens/CarDetails";
// import Profile from "../Screens/Profile";

// const Tab = createBottomTabNavigator();

// export default function BottomTabNavigator() {
//   return (
//     <Tab.Navigator
//       screenOptions={{
//         headerShown: false,
//         tabBarShowLabel: true,
//         tabBarActiveTintColor: "#007AFF",
//         tabBarInactiveTintColor: "#6B7280",
//         tabBarStyle: {
//           position: "absolute",
//           backgroundColor: "white",
//           borderTopWidth: 1,
//           borderTopColor: "#e5e7eb",
//           height: 90,
//           paddingBottom: 36,
//           paddingTop: 12,
//           elevation: 20,
//           shadowColor: "#000",
//           shadowOpacity: 0.08,
//           shadowOffset: { width: 0, height: -4 },
//           shadowRadius: 12,
//         },
//       }}
//     >
//       {/* HOME */}
//       <Tab.Screen
//         name="Home"
//         component={ChooseWorkFlow}
//         options={{
//           tabBarLabel: "Home",
//           tabBarIcon: ({ focused }) => (
//             <Home
//               size={26}
//               strokeWidth={2.3}
//               color={focused ? "#007AFF" : "#6B7280"}
//             />
//           ),
//           tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
//         }}
//       />

//       <Tab.Screen
//         name="CarDetails"
//         component={CarDetails}
//         options={{
//           tabBarLabel: "Inspect",
//           tabBarIcon: () => (
//             <View className="-top-6">
//               <View className="bg-blue-500 w-16 h-16 rounded-full items-center justify-center shadow-2xl border-4 border-white">
//                 <Camera size={32} color="white" strokeWidth={2.5} />
//               </View>
//             </View>
//           ),
//           tabBarLabelStyle: {
//             color: "#007AFF",
//             fontWeight: "bold",
//             fontSize: 12,
//           },
//           // Custom button to fix ripple & press area
//           tabBarButton: (props) => (
//             <TouchableOpacity
//               {...props}
//               className="flex-1 justify-center items-center"
//               activeOpacity={0.7}
//             />
//           ),
//         }}
//       />

//       <Tab.Screen
//         name="Profile"
//         component={Profile}
//         options={{
//           tabBarLabel: "Profile",
//           tabBarIcon: ({ focused }) => (
//             <User
//               size={32}
//               strokeWidth={2.3}
//               color={focused ? "#007AFF" : "#6B7280"}
//             />
//           ),
//           tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
//         }}
//       />
//     </Tab.Navigator>
//   );
// }
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Pressable, Text, View } from "react-native";
import tw from "tailwind-react-native-classnames";

import ChooseWorkFlow from "../Screens/ChooseWorkFlow";
import CarDetails from "../Screens/CarDetails";
import Profile from "../Screens/Profile";
import AppIcon from "../components/AppIcon";

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "white",
          borderTopWidth: 1,
          borderTopColor: "#e5e7eb",
          paddingBottom: 4,
          height: 95,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.1,
          shadowRadius: 5,
          elevation: 10,
        },
        tabBarItemStyle: {
          padding: 2,
        },
        tabBarActiveTintColor: "#2563eb", // Blue color jab active ho
        tabBarInactiveTintColor: "#6b7280", // Gray when inactive
      }}
    >
      <Tab.Screen
        name="ChooseWorkFlow"
        component={ChooseWorkFlow}
        options={{
          tabBarLabel: ({ focused }) => (
            <Text
              style={{
                color: focused ? "#2563eb" : "black",
                fontSize: 12,
                fontWeight: focused ? "600" : "500",
              }}
            >
              Home
            </Text>
          ),
          tabBarIcon: ({ focused }) => (
            <AppIcon
              name="home"
              size={24}
              color={focused ? "#2563eb" : "black"}
            />
          ),
        }}
      />

      <Tab.Screen
        name="CarDetails"
        component={CarDetails}
        options={{
          tabBarLabel: ({ focused }) => (
            <Text
              style={{
                color: focused ? "#2563eb" : "black",
                fontSize: 12,
                fontWeight: focused ? "600" : "500",
              }}
            >
              Inspect
            </Text>
          ),
          tabBarIcon: ({ focused }) => (
            <AppIcon
              name="camera"
              size={24}
              color={focused ? "#2563eb" : "black"}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarLabel: ({ focused }) => (
            <Text
              style={{
                color: focused ? "#2563eb" : "black",
                fontSize: 12,
                fontWeight: focused ? "600" : "500",
              }}
            >
              Profile
            </Text>
          ),
          tabBarIcon: ({ focused }) => (
            <AppIcon
              name="user"
              size={24}
              color={focused ? "#2563eb" : "black"}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
