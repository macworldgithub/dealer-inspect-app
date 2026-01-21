import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
} from "react-native";
import tw from "tailwind-react-native-classnames";
import { ChevronDown, Trash } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { API_BASE_URL } from "../util/config";
import { ActivityIndicator } from "react-native";
import { ArrowLeft } from "lucide-react-native";

const TRANSMISSIONS = ["MANUAL", "AUTOMATIC", "CVT", "DCT", "AMT", "OTHER"];

export default function CarDetailsScreen({ navigation, route }) {
  const { vehicle, isUpdate } = route.params || {};

  const [user, setUser] = useState(null);
  const [transmission, setTransmission] = useState(vehicle?.transmission || "");
  const [transmissionVisible, setTransmissionVisible] = useState(false);
  const [image, setImage] = useState(
    vehicle?.carImageUrl
      ? { uploadedKey: vehicle.carImageKey, localUri: vehicle.carImageUrl }
      : null,
  );
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    make: vehicle?.make || "",
    model: vehicle?.model || "",
    variant: vehicle?.variant || "",
    yearOfManufacture: vehicle?.yearOfManufacture?.toString() || "",
    registrationNumber: vehicle?.registrationNumber || "",
    chassisNumber: vehicle?.chassisNumber || "",
  });
  const [loadingAction, setLoadingAction] = useState(false);

  // Load user
  useEffect(() => {
    (async () => {
      const userData = await AsyncStorage.getItem("user");
      if (userData) setUser(JSON.parse(userData));
    })();
  }, []);

  // Request image permissions
  useEffect(() => {
    (async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert("Media library permissions are required to upload images.");
      }
    })();
  }, []);

  const pickImage = async () => {
    if (image) {
      return alert("Only one image is allowed");
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const manipulated = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 1200 } }],
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
        },
      );

      uploadImage(manipulated.uri);
    }
  };

  const uploadImage = async (uri) => {
    try {
      setUploading(true);
      const fileType = "image/jpeg";

      const presignRes = await fetch(
        `${API_BASE_URL}/vehicle/presigned/car-image`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await AsyncStorage.getItem(
              "access_token",
            )}`,
          },
          body: JSON.stringify({ fileType }),
        },
      );

      if (!presignRes.ok) throw new Error("Presigned url fetch failed");

      const { url, key } = await presignRes.json();
      console.log("Presigned URL:", url);
      console.log("Key:", key);

      // ─── Now the actual upload ───
      const response = await fetch(uri);
      console.log("response", response);
      const blob = await response.blob();
      console.log("blob", blob);
      const uploadResponse = await fetch(url, {
        method: "PUT",
        body: blob,
        headers: {
          "Content-Type": "image/jpeg",
        },
      });
      console.log("Upload Response", uploadResponse);
      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.log("S3 error response:", errorText);
        throw new Error(`Upload failed: ${uploadResponse.status} ${errorText}`);
      }

      console.log("Upload success!");
      setImage({ localUri: uri, uploadedKey: key });
    } catch (err) {
      console.error("Full upload error:", err);
      alert("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  // Create or update vehicle
  const handleSubmit = async () => {
    if (!transmission) {
      alert("Please select transmission");
      return;
    }

    if (!image) {
      alert("Please upload an image");
      return;
    }

    const payload = {
      make: form.make,
      model: form.model,
      variant: form.variant,
      yearOfManufacture: Number(form.yearOfManufacture),
      registrationNumber: form.registrationNumber,
      chassisNumber: form.chassisNumber,
      transmission,
      carImageKey: image.uploadedKey,
    };
    console.log(payload, "PAYLOAD");
    try {
      setLoadingAction(true);
      const token = await AsyncStorage.getItem("access_token");
      const url = isUpdate
        ? `${API_BASE_URL}/vehicle/${vehicle._id}`
        : `${API_BASE_URL}/vehicle`;
      const method = isUpdate ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      console.log(res, "RESPONSE");
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Operation failed");
      }

      const data = await res.json();
      if (isUpdate) {
        Alert.alert("Success", "Vehicle updated successfully", [
          { text: "OK", onPress: () => navigation.navigate("ChooseWorkFlow") },
        ]);
      } else {
        Alert.alert("Success", "Vehicle created successfully");
        navigation.navigate("InspectionScreen", { vehicleId: data._id, image });
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", err.message);
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <ScrollView
      style={tw`flex-1 bg-gray-900 pt-12 px-2`}
      contentContainerStyle={tw`pb-10`}
    >
      <View style={tw`flex-row items-center mb-6`}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={tw`mr-4 p-2 rounded-full bg-gray-900 border border-gray-800`}
        >
          <ArrowLeft size={22} color="#fff" />
        </TouchableOpacity>

        <Text style={tw`text-white text-2xl font-bold`}>
          Hi, {user?.name || "User"}!
        </Text>
      </View>

      <View style={tw`mx-5 bg-white rounded-3xl p-6 pb-10 shadow-2xl`}>
        <Text style={tw`text-lg font-bold text-black mt-4`}>
          Fill Car Details
        </Text>
        <Text style={tw`text-gray-800 text-sm mt-1`}>
          Enter vehicle information to start inspection
        </Text>

        <Image
          source={require("../../../assets/audi.png")}
          style={tw`w-42 h-32 absolute -top-10 right-4`}
          resizeMode="contain"
        />

        <View style={tw`mt-6`}>
          <FormField
            label="Make"
            value={form.make}
            onChange={(v) => setForm({ ...form, make: v })}
          />
          <FormField
            label="Model"
            value={form.model}
            onChange={(v) => setForm({ ...form, model: v })}
          />
          <FormField
            label="Variant"
            value={form.variant}
            onChange={(v) => setForm({ ...form, variant: v })}
          />
          <FormField
            label="Year of Manufacture"
            keyboardType="numeric"
            value={form.yearOfManufacture}
            onChange={(v) => setForm({ ...form, yearOfManufacture: v })}
          />
          <FormField
            label="Registration Number"
            value={form.registrationNumber}
            onChange={(v) => setForm({ ...form, registrationNumber: v })}
          />
          <FormField
            label="Chassis Number"
            value={form.chassisNumber}
            onChange={(v) => setForm({ ...form, chassisNumber: v })}
          />

          <TransmissionField
            value={transmission}
            onPress={() => setTransmissionVisible(true)}
          />

          <SingleImageUploadField
            image={image}
            onAddImage={pickImage}
            onDeleteImage={() => setImage(null)}
            uploading={uploading}
          />
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          style={tw`bg-black rounded-full py-3 mt-4 ${loadingAction ? "opacity-50" : ""}`}
          disabled={loadingAction}
        >
          <Text style={tw`text-white text-center text-lg font-semibold`}>
            {isUpdate ? "Update Vehicle" : "Start Inspection"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={tw`h-24`} />

      {/* Transmission Modal */}
      <Modal transparent visible={transmissionVisible} animationType="fade">
        <View
          style={tw`flex-1 bg-black bg-opacity-50 justify-center items-center`}
        >
          <View style={tw`bg-white w-4/5 rounded-2xl p-4`}>
            {TRANSMISSIONS.map((item) => (
              <TouchableOpacity
                key={item}
                onPress={() => {
                  setTransmission(item);
                  setTransmissionVisible(false);
                }}
                style={tw`py-3`}
              >
                <Text style={tw`text-lg text-center`}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const FormField = ({ label, value, onChange, keyboardType = "default" }) => (
  <View style={tw`mb-6`}>
    <Text style={tw`text-gray-600 text-sm font-medium mb-2 ml-1`}>{label}</Text>
    <View style={tw`bg-gray-100 rounded-2xl px-5 py-4`}>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={`Enter ${label.toLowerCase()}`}
        placeholderTextColor="#9CA3AF"
        keyboardType={keyboardType}
        style={tw`text-black text-base`}
      />
    </View>
  </View>
);

const TransmissionField = ({ value, onPress }) => (
  <View style={tw`mb-6`}>
    <Text style={tw`text-gray-600 text-sm font-medium mb-2 ml-1`}>
      Transmission
    </Text>
    <TouchableOpacity
      onPress={onPress}
      style={tw`bg-gray-100 rounded-2xl px-5 py-4 flex-row justify-between items-center`}
    >
      <Text style={tw`${value ? "text-black" : "text-gray-400"}`}>
        {value || "Select transmission"}
      </Text>
      <ChevronDown size={22} color="#6B7280" />
    </TouchableOpacity>
  </View>
);

const SingleImageUploadField = ({
  image,
  onAddImage,
  onDeleteImage,
  uploading,
}) => (
  <View style={tw`mb-6`}>
    <Text style={tw`text-gray-600 text-sm font-medium mb-2 ml-1`}>
      Car Image
    </Text>
    {uploading ? (
      <View
        style={tw`w-32 h-32 rounded-xl bg-gray-100 justify-center items-center`}
      >
        <ActivityIndicator size="large" color="#000" />
        <Text style={tw`text-xs text-gray-500 mt-2`}>Uploading...</Text>
      </View>
    ) : image ? (
      <View style={tw`relative`}>
        <Image
          source={{ uri: image.localUri }}
          style={tw`w-32 h-32 rounded-xl`}
        />
        <TouchableOpacity
          onPress={onDeleteImage}
          style={tw`absolute top-0 right-0 bg-red-600 rounded-full p-1 mr-36`}
        >
          <Trash size={16} color="white" />
        </TouchableOpacity>
      </View>
    ) : (
      <TouchableOpacity
        onPress={onAddImage}
        style={tw`w-32 h-32 rounded-xl border-2 border-dashed border-gray-400 justify-center items-center`}
      >
        <Text style={tw`text-gray-400 text-3xl`}>+</Text>
      </TouchableOpacity>
    )}
  </View>
);
