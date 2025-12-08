import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import tw from "tailwind-react-native-classnames"; // YE IMPORT ZAROORI HAI
import { Camera, Check, ChevronLeft } from "lucide-react-native";

export default function ServiceProtectionScreen1({ navigation }) {
  const [selectedStep, setSelectedStep] = useState("Exterior Front");

  const steps = [
    "Exterior Front",
    "Exterior Left",
    "Exterior Right",
    "Interior Front",
    "Interior Back",
  ];

  return (
    <ScrollView style={tw`flex-1 bg-black`}>
      {/* White Card (Rounded Top) */}
      <View style={tw`mt-6 bg-white px-6 pt-6 pb-12`}>
        {/* Back Button + Title */}
        <View style={tw`flex-row items-center mb-5`}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ChevronLeft size={28} color="#000" />
          </TouchableOpacity>
          <Text style={tw`ml-3 text-xl font-bold text-black`}>
            Service Protection Inspection
          </Text>
        </View>

        {/* Current Step */}
        <Text style={tw`text-gray-700 text-base`}>
          Current Step:{" "}
          <Text style={tw`font-bold`}>{selectedStep}</Text>
        </Text>

        {/* Green Dot Indicator */}
        <View style={tw`flex-row items-center mt-2`}>
          <View style={tw`w-3 h-3 rounded-full bg-green-500 mr-2`} />
          <Text style={tw`text-green-600 font-medium`}>Active</Text>
        </View>

        {/* Instruction */}
        <Text style={tw`text-gray-600 text-sm mt-4 leading-5`}>
          Position your camera to capture the {selectedStep.toLowerCase()}
        </Text>

        {/* Camera Preview Box */}
        <View
          style={tw`mt-6 w-full h-64 bg-gray-100 rounded-2xl items-center justify-center border-2 border-dashed border-gray-300`}
        >
          <Camera size={48} color="#9CA3AF" />
          <Text style={tw`text-gray-500 mt-3 text-center`}>
            Camera view will appear here
          </Text>
        </View>

        {/* Loading Text */}
        <Text style={tw`text-gray-500 text-xs mt-4`}>Loading Inspection...</Text>
        <View style={tw`h-px bg-gray-200 mt-3 mb-6`} />

        {/* Steps List */}
        <View style={tw`space-y-3`}>
          {steps.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setSelectedStep(item)}
              style={tw`flex-row items-center justify-between p-5 rounded-2xl ${
                selectedStep === item ? "bg-black" : "bg-gray-100"
              }`}
              activeOpacity={0.8}
            >
              <Text
                style={tw`text-base font-medium ${
                  selectedStep === item ? "text-white" : "text-gray-800"
                }`}
              >
                {item}
              </Text>

              {/* Custom Checkbox */}
              <View
                style={tw`w-7 h-7 rounded-lg items-center justify-center border-2 ${
                  selectedStep === item
                    ? "bg-blue-600 border-blue-600"
                    : "bg-white border-gray-400"
                }`}
              >
                {selectedStep === item && <Check size={18} color="white" />}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}