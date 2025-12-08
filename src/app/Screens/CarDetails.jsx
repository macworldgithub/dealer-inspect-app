import React from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import tw from "tailwind-react-native-classnames";
import { ChevronDown } from "lucide-react-native";

export default function CarDetailsScreen({ navigation }) {
  return (
    <ScrollView style={tw`flex-1 bg-black`}>
      {/* Header */}
      <View style={tw`px-6 pt-12 pb-6`}>
        <Text style={tw`text-white text-2xl font-bold`}>Hi, Martin!</Text>
      </View>

      {/* Main White Card */}
      <View style={tw`mx-5 bg-white rounded-3xl p-6 pb-10 shadow-2xl relative`}>
        {/* Title */}
        <Text style={tw`text-lg font-bold text-black mt-4`}>
          Fill Car Details
        </Text>
        <Text style={tw`text-gray-800 text-sm mt-1`}>
          Enter vehicle information {"\n"} to start inspection
        </Text>

        {/* Car Image - Top Right */}
        <Image
          source={require("../../../assets/audi.png")}
          style={tw`w-42 h-32 absolute -top-10 right-4`}
          resizeMode="contain"
        />

        {/* Form Fields */}
        <View style={tw`mt-6`}>
          <FormField label="Make" />
          <FormField label="Model" />
          <FormField label="Variant" />
          <FormField label="Year of Manufacture" dropdown />
          <FormField label="Registration Number" />
          <FormField label="Chassis Number" />
          <FormField label="Transmission" dropdown />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={() => navigation.navigate("ServiceProtectionScreen1")}
          style={tw`bg-black rounded-full py-2 mt-2`}
        >
          <Text style={tw`text-white text-center text-lg font-semibold`}>
            Start Inspection
          </Text>
        </TouchableOpacity>
      </View>

      <View style={tw`h-24`} />
    </ScrollView>
  );
}

// Reusable Form Field with Yellow Info Icon
const FormField = ({ label, dropdown = false }) => {
  return (
    <View style={tw`mb-6 relative`}>
      {/* Label */}
      <Text style={tw`text-gray-600 text-sm font-medium mb-2 ml-1`}>
        {label}
      </Text>

      {/* Input Field */}
      <View
        style={tw`bg-gray-100 rounded-2xl px-5 py-4 flex-row items-center justify-between`}
      >
        <TextInput
          placeholder={`Enter ${label.toLowerCase()}`}
          placeholderTextColor="#9CA3AF"
          style={tw`flex-1 text-black text-base`}
        />
        {dropdown && <ChevronDown size={22} color="#6B7280" />}
      </View>
    </View>
  );
};
