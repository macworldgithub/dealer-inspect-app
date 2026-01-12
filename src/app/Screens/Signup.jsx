import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import tw from "tailwind-react-native-classnames";
import { useNavigation } from "@react-navigation/native";
import { API_BASE_URL } from "../util/config";

export default function SignUp() {
  const navigation = useNavigation();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "PORTER_DETAILER",
  });
  const [loading, setLoading] = useState(false);

  const roles = [
    "PORTER_DETAILER",
    "SERVICE_ADVISOR",
    "SALES_INVENTORY_MANAGER",
    "ADMIN",
  ];

  const handleChange = (key, value) => setForm({ ...form, [key]: value });

  const handleSignUp = async () => {
    const { name, email, phoneNumber, password, role } = form;

    if (!name || !email || !phoneNumber || !password) {
      Alert.alert("Validation Error", "All fields are required.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phoneNumber,
          password,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      Alert.alert("Success", "Account created successfully");
      navigation.replace("SignIn");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={tw`flex-1 bg-white px-8 justify-center`}
    >
      <Text style={tw`text-3xl font-bold text-center mb-6`}>
        Create Account
      </Text>

      <TextInput
        placeholder="Full name"
        placeholderTextColor="#9CA3AF"
        style={tw`border border-gray-300 text-black rounded-lg px-4 py-3 mb-3`}
        onChangeText={(v) => handleChange("name", v)}
      />

      <TextInput
        placeholder="Email address"
        placeholderTextColor="#9CA3AF"
        keyboardType="email-address"
        autoCapitalize="none"
        style={tw`border border-gray-300 text-black rounded-lg px-4 py-3 mb-3`}
        onChangeText={(v) => handleChange("email", v)}
      />

      <TextInput
        placeholder="Phone number"
        placeholderTextColor="#9CA3AF"
        keyboardType="phone-pad"
        style={tw`border border-gray-300 text-black rounded-lg px-4 py-3 mb-3`}
        onChangeText={(v) => handleChange("phoneNumber", v)}
      />

      <TextInput
        placeholder="Create password"
        placeholderTextColor="#9CA3AF"
        secureTextEntry
        style={tw`border text-black border-gray-300 rounded-lg px-4 py-3 mb-4`}
        onChangeText={(v) => handleChange("password", v)}
      />

      <Text style={tw`text-lg font-semibold mb-2`}>Select Role</Text>

      {roles.map((r) => (
        <TouchableOpacity
          key={r}
          onPress={() => handleChange("role", r)}
          style={tw`flex-row items-center mb-2`}
        >
          <View
            style={tw`w-5 h-5 rounded-full border border-gray-400 mr-3 items-center justify-center`}
          >
            {form.role === r && (
              <View style={tw`w-3 h-3 bg-blue-600 rounded-full`} />
            )}
          </View>
          <Text>{r}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        onPress={handleSignUp}
        disabled={loading}
        style={tw`bg-black py-3 rounded-full items-center mt-4`}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={tw`text-white text-lg font-semibold`}>Sign Up</Text>
        )}
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}
