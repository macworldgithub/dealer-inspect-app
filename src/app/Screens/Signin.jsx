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
import { storeAuthData } from "../util/storage";

export default function SignIn() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Validation Error", "Email and password are required.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/auth/sign-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log(data, "DATA")
      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }
      await storeAuthData(data.access_token, data.user);
      Alert.alert("Success", "Signed in successfully");
      navigation.replace("HomeTabs");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={tw`flex-1 bg-white justify-center px-8`}
    >
      <Text style={tw`text-3xl font-bold text-center mb-8`}>
        Sign In to Your Account
      </Text>

      <TextInput
        placeholder="Enter your email address"
        placeholderTextColor="#9CA3AF"
        value={email}
        onChangeText={setEmail}
        style={tw`border text-black border-gray-300 rounded-lg px-4 py-3 mb-4`}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Enter your password"
        placeholderTextColor="#9CA3AF"
        value={password}
        onChangeText={setPassword}
        style={tw`border text-black border-gray-300 rounded-lg px-4 py-3 mb-6`}
        secureTextEntry
      />

      <TouchableOpacity
        onPress={handleSignIn}
        disabled={loading}
        style={tw`bg-black py-3 rounded-full items-center`}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={tw`text-white text-lg font-semibold`}>Sign In</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate("SignUp")}
        style={tw`mt-6 items-center`}
      >
        <Text style={tw`text-blue-600`}>Don’t have an account? Sign Up</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}
