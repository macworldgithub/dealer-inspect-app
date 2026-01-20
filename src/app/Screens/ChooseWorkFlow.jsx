import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import tw from "tailwind-react-native-classnames";
import { Truck, Camera } from "lucide-react-native";

const workflows = [
  {
    id: 1,
    title: "Vehicles",
    subtitle: "Service protection, reconditioning, and trade-in valuation",
    icon: Truck,
    screen: "AllVehicles",
  },
  {
    id: 2,
    title: "Merchandising Assets",
    subtitle: "Professional photos, videos, and digital asset creation",
    icon: Camera,
    screen: "Merchandising",
  },
];

const features = [
  { title: "AI Detection", desc: "Automatic damage detection" },
  { title: "Reports", desc: "Instant PDF generation" },
  { title: "Cloud Sync", desc: "Real-time data sync" },
  { title: "Mobile First", desc: "Works offline" },
];

export default function ChooseWorkFlow({ navigation }) {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        if (userData) {
          const user = JSON.parse(userData);
          setUserName(user.name);
        }
      } catch (error) {
        console.error("Failed to load user", error);
      }
    };

    loadUser();
  }, []);

  return (
    <View style={tw`flex-1 bg-black`}>
      {/* Header */}
      <View style={tw`flex-row justify-between items-center px-6 pt-16 pb-6`}>
        <Text style={tw`text-3xl font-bold text-white`}>
          Hi{userName ? `, ${userName}` : ""}!
        </Text>

        {/* <View style={tw`flex-row items-center`}>
          <Image
            source={require("../../../assets/bell.png")}
            style={[tw`w-6 h-6 mr-4`, { tintColor: "white" }]}
          />
          <Image
            source={require("../../../assets/avatar.png")}
            style={tw`w-11 h-11 rounded-full border-2 border-gray-700`}
          />
        </View> */}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={tw`flex-1`}>
        {/* Hero Card */}
        <View style={tw`mx-6 mb-6 bg-white rounded-3xl p-6 shadow-lg`}>
          <Text style={tw`text-lg font-bold text-black`}>
            Choose Your Workflow
          </Text>

          <Text style={tw`text-gray-600 text-base mt-2`}>
            Select the inspection workflow that fits your needs
          </Text>

          <View style={tw`items-center -mb-12 mt-6`}>
            <Image
              source={require("../../../assets/audi.png")}
              style={tw`w-full h-48 rounded-2xl`}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Workflow Cards */}
        <View style={tw`bg-white`}>
          <View style={tw`px-6`}>
            {workflows.map((workflow) => (
              <TouchableOpacity
                key={workflow.id}
                onPress={() => navigation.navigate(workflow.screen)}
                style={tw`bg-gray-900 rounded-3xl p-4 flex-row items-center justify-between border border-gray-800 mb-4 mt-2`}
              >
                <View style={tw`flex-row items-center flex-1`}>
                  <View style={tw`bg-gray-800 p-4 rounded-2xl mr-4`}>
                    <workflow.icon size={18} color="#fff" />
                  </View>

                  <View style={tw`flex-1`}>
                    <Text style={tw`text-white font-semibold`}>
                      {workflow.title}
                    </Text>
                    <Text style={tw`text-gray-400 text-xs mt-1`}>
                      {workflow.subtitle}
                    </Text>
                  </View>
                </View>

                <Text style={tw`text-white text-4xl font-thin`}>›</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Features Section */}
          <View style={tw`px-6 mt-4 pb-24`}>
            <Text style={tw`text-2xl font-bold text-black mb-6`}>Features</Text>

            {features.map((f, i) => (
              <View key={i} style={tw`flex-row items-start mb-5`}>
                <View style={tw`w-2 h-2 bg-black rounded-full mt-2 mr-4`} />

                <View style={tw`flex-1`}>
                  <Text style={tw`text-black font-semibold text-base`}>
                    {f.title}
                  </Text>
                  <Text style={tw`text-gray-400 text-sm`}>{f.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
