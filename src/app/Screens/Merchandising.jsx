import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import tw from "tailwind-react-native-classnames";

export default function ServiceIntake({ navigation }) {
  const workflows = [
    {
      id: 1,
      title: "Vehicle Photo Shoot",
      subtitle: "Capture professional vehicle photos",
      screen: "ServiceProtection", // ← navigation screen name
    },
    {
      id: 2,
      title: "Vehicle Video ",
      subtitle: "Create engaging vehicle walk-around videos",
      screen: "Reconditioning",
    },
    {
      id: 3,
      title: "Digital Assets",
      subtitle: "Manage and export all vehicle media",
      screen: "TradeInValuation",
    },
  ];

  return (
    <View style={tw`flex-1 bg-black`}>
      {/* Header */}
      <View style={tw`flex-row justify-between items-center px-6 pt-16 pb-6`}>
        <Text style={tw`text-3xl font-bold text-white`}>Hi!</Text>

        <View style={tw`flex-row items-center`}>
          <Image
            source={require("../../../assets/bell.png")}
            style={[tw`w-6 h-6 mr-4`, { tintColor: "white" }]}
          />
          <Image
            source={require("../../../assets/avatar.png")}
            style={tw`w-11 h-11 rounded-full border-2 border-gray-700`}
          />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* White Hero Card */}
        <View style={tw`mx-6 mb-6 bg-white rounded-3xl p-6 shadow-lg`}>
          <Text style={tw`text-xl font-bold text-black`}>
            Merchandising & Assets{" "}
          </Text>
          <Text style={tw`text-gray-600 text-base mt-2`}>
            Create professional digital content for your vehicle listings{" "}
          </Text>

          <View style={tw`items-center -mb-12 mt-6`}>
            <Image
              source={require("../../../assets/audi.png")}
              style={tw`w-full h-48 rounded-2xl`}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Workflow Cards - No Icons */}
        <View style={tw`bg-white`}>
          <View style={tw`px-6 space-y-5`}>
            {workflows.map((workflow) => (
              <TouchableOpacity
                key={workflow.id}
                onPress={() => navigation.navigate(workflow.screen)}
                style={tw`bg-gray-900 rounded-3xl p-4 flex-row items-center justify-between border border-gray-800 mb-4 mt-2`}
              >
                <View style={tw`flex-1 pr-6`}>
                  <Text style={tw`text-white font-semibold`}>
                    {workflow.title}
                  </Text>
                  <Text style={tw`text-gray-400 text-xs mt-1`}>
                    {workflow.subtitle}
                  </Text>
                </View>

                {/* Right Arrow */}
                <View
                  style={tw`w-12 h-12 bg-gray-800 rounded-full items-center justify-center`}
                >
                  <Text style={tw`text-white text-3xl font-thin`}>›</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* AI Powered Section */}
          <View
            style={tw`mx-6 mt-4 mb-32 rounded-3xl p-4 border border-gray-400`}
          >
            <Text style={tw`text-xl font-bold text-black mb-3`}>
              AI-Powered Inspection
            </Text>
            <Text style={tw`text-gray-400 text-base leading-6`}>
              Our AI automatically detects damage, evaluates condition, and
              generates comprehensive reports with photos.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
