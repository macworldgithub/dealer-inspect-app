import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import tw from "tailwind-react-native-classnames";

export default function WelcomeScreen() {
  return (
    <View style={tw`flex-1 bg-white`}>
      
      {/* Background top shape */}
      <View
        style={[
          tw`absolute top-0 left-0 w-full h-1/2`,
          { backgroundColor: "#F2F0F4", borderBottomRightRadius: 200 },
        ]}
      />

      {/* Text Section */}
      <View style={tw`mt-24 px-6`}>
        <Text style={tw`text-3xl font-bold text-black`}>
          Your <Text style={tw`text-blue-600`}>Premium</Text>
        </Text>
        <Text style={tw`text-3xl font-bold text-black`}>Ride Begins</Text>
        <Text style={tw`text-3xl font-bold text-black`}>Here</Text>
      </View>

      {/* Car Image */}
      <Image
        source={require("../../../assets/Car.png")} 
        style={[
          tw`absolute right-0`,
          { width: 260, height: 420, resizeMode: "contain", top: 130 },
        ]}
      />

      {/* Button */}
      <View style={tw`absolute bottom-10 w-full px-6`}>
        <TouchableOpacity
          style={tw`bg-black py-4 rounded-full items-center`}
          onPress={() => { navigation.replace("ChooseWorkFlow"); }}
        >
          <Text style={tw`text-white font-semibold`}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
