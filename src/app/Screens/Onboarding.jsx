import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import tw from "tailwind-react-native-classnames";
import { useNavigation } from "@react-navigation/native";

export default function WelcomeScreen() {
  const navigation = useNavigation();

  return (
    <View style={tw`flex-1 bg-white relative`}>
      {/* Top Background Shape */}
      <View
        style={[
          tw`absolute top-0 left-0 w-full h-1/2 bg-gray-200`,
          { borderBottomRightRadius: 200 }, // custom radius (Tailwind can't generate this)
        ]}
      />

      {/* Main Content */}
      <View style={tw`flex-1 justify-between`}>
        {/* Title */}
        <View style={tw`mt-24 px-8`}>
          <Text style={tw`text-4xl font-bold text-black leading-tight`}>
            Your <Text style={tw`text-blue-600`}>Premium</Text>
          </Text>
          <Text style={tw`text-4xl font-bold text-black leading-tight`}>
            Ride Begins
          </Text>
          <Text style={tw`text-4xl font-bold text-black leading-tight`}>
            Here
          </Text>
        </View>

        {/* Car Image */}
        <Image
          source={require("../../../assets/Car.png")}
          style={tw`absolute right-0 top-2 w-66 h-94`}
          resizeMode="contain"
        />

        {/* Button */}
        <View style={tw`px-8 mb-12`}>
          <TouchableOpacity
            onPress={() => navigation.replace("SignIn")}
            style={tw`bg-black py-3 rounded-full items-center`}
          >
            <Text style={tw`text-white text-lg font-semibold`}>
              Get Started
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
