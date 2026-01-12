import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  Switch,
  TouchableOpacity,
  ScrollView,
  Modal,
} from "react-native";
import tw from "tailwind-react-native-classnames";
import {
  User,
  Globe,
  Shield,
  Settings,
  Bell,
  HelpCircle,
  LogOut,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

export default function Profile() {
  const navigation = useNavigation();

  const [pushNotifications, setPushNotifications] = useState(true);
  const [promoNotifications, setPromoNotifications] = useState(false);
  const [user, setUser] = useState(null);
  const [logoutVisible, setLogoutVisible] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error("Failed to load user", error);
      }
    };

    loadUser();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("access_token");
      await AsyncStorage.removeItem("user");
      setLogoutVisible(false);
      navigation.reset({
        index: 0,
        routes: [{ name: "SignIn" }],
      });
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <>
      <ScrollView style={tw`flex-1 mt-6`}>
        {/* Header */}
        <View style={tw`items-center py-4`}>
          <Text style={tw`text-xl font-bold`}>Profile</Text>
        </View>

        {/* Profile Avatar & Info */}
        <View style={tw`items-center mt-2`}>
          <Image
            source={require("../../../assets/avatar.png")}
            style={tw`w-11 h-11 rounded-full border-2 border-gray-700`}
          />
          <Text style={tw`text-2xl font-bold mt-4`}>
            {user?.name || "User"}
          </Text>
          <Text style={tw`text-gray-500 mt-1`}>{user?.email || ""}</Text>
        </View>

        {/* My Account Card */}
        <View
          style={tw`mx-5 mt-8 bg-white rounded-2xl shadow-sm border border-gray-100`}
        >
          <Text style={tw`text-yellow-500 font-bold text-lg px-5 pt-4`}>
            My Account
          </Text>

          <TouchableOpacity
            style={tw`flex-row justify-between items-center py-4 px-5`}
          >
            <View style={tw`flex-row items-center`}>
              <User size={22} color="#1f2937" />
              <Text style={tw`ml-4 text-gray-800`}>Personal Information</Text>
            </View>
            <Text style={tw`text-gray-400`}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={tw`flex-row justify-between items-center py-4 px-5`}
          >
            <View style={tw`flex-row items-center`}>
              <Globe size={22} color="#1f2937" />
              <Text style={tw`ml-4 text-gray-800`}>Language</Text>
            </View>
            <Text style={tw`text-gray-500`}>English (US)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={tw`flex-row items-center py-4 px-5`}>
            <Shield size={22} color="#1f2937" />
            <Text style={tw`ml-4 text-gray-800`}>Privacy Policy</Text>
          </TouchableOpacity>

          <TouchableOpacity style={tw`flex-row items-center py-4 px-5`}>
            <Settings size={22} color="#1f2937" />
            <Text style={tw`ml-4 text-gray-800`}>Settings</Text>
          </TouchableOpacity>
        </View>

        {/* Notifications Card */}
        <View
          style={tw`mx-5 mt-6 bg-white rounded-2xl shadow-sm border border-gray-100`}
        >
          <Text style={tw`text-yellow-500 font-bold text-lg px-5 pt-4`}>
            Notifications
          </Text>

          <View style={tw`flex-row justify-between items-center py-4 px-5`}>
            <View style={tw`flex-row items-center`}>
              <Bell size={22} color="#1f2937" />
              <Text style={tw`ml-4 text-gray-800`}>Push Notifications</Text>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={setPushNotifications}
              trackColor={{ true: "#10b981", false: "#d1d5db" }}
              thumbColor="white"
              ios_backgroundColor="#d1d5db"
            />
          </View>

          <View style={tw`flex-row justify-between items-center py-4 px-5`}>
            <View style={tw`flex-row items-center`}>
              <Bell size={22} color="#1f2937" />
              <Text style={tw`ml-4 text-gray-800`}>
                Promotional Notifications
              </Text>
            </View>
            <Switch
              value={promoNotifications}
              onValueChange={setPromoNotifications}
              trackColor={{ true: "#10b981", false: "#d1d5db" }}
              thumbColor="white"
              ios_backgroundColor="#d1d5db"
            />
          </View>
        </View>

        {/* More Card */}
        <View
          style={tw`mx-5 mt-6 mb-10 bg-white rounded-2xl shadow-sm border border-gray-100`}
        >
          <Text style={tw`text-yellow-500 font-bold text-lg px-5 pt-4`}>
            More
          </Text>

          <TouchableOpacity style={tw`flex-row items-center py-4 px-5`}>
            <HelpCircle size={22} color="#1f2937" />
            <Text style={tw`ml-4 text-gray-800`}>Help Center</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setLogoutVisible(true)}
            style={tw`flex-row items-center py-4 px-5`}
          >
            <LogOut size={22} color="#ef4444" />
            <Text style={tw`ml-4 text-red-600 font-semibold`}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Modal
        transparent
        visible={logoutVisible}
        animationType="fade"
        onRequestClose={() => setLogoutVisible(false)}
      >
        <View
          style={tw`flex-1 bg-black bg-opacity-50 justify-center items-center`}
        >
          <View style={tw`bg-white w-4/5 rounded-2xl p-6`}>
            <Text style={tw`text-lg font-bold mb-3`}>Confirm Logout</Text>

            <Text style={tw`text-gray-600 mb-6`}>
              Are you sure you want to log out?
            </Text>

            <View style={tw`flex-row justify-end`}>
              <TouchableOpacity
                onPress={() => setLogoutVisible(false)}
                style={tw`mr-6`}
              >
                <Text style={tw`text-gray-500 font-semibold`}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleLogout}>
                <Text style={tw`text-red-600 font-semibold`}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
