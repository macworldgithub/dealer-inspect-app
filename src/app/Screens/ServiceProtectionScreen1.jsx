import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Alert,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
} from "react-native";
import tw from "tailwind-react-native-classnames";
import { launchCamera } from "react-native-image-picker"; // Correct import
import { Camera as CameraIcon, Check, ChevronLeft, X } from "lucide-react-native";

export default function ServiceProtectionScreen1({ navigation }) {
  const [selectedStep, setSelectedStep] = useState("Exterior Front");
  const [capturedImage, setCapturedImage] = useState(null); // Current photo URI
  const [uploadedImages, setUploadedImages] = useState({}); // Done steps
  const [modalVisible, setModalVisible] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const steps = [
    "Exterior Front",
    "Exterior Left",
    "Exterior Right",
    "Interior Front",
    "Interior Back",
    // Add more steps up to 25 if needed
  ];

  // Runtime permission request for Android
  const requestCameraPermission = async () => {
    if (Platform.OS === "ios") return true;

    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      ]);

      const cameraGranted =
        granted["android.permission.CAMERA"] ===
        PermissionsAndroid.RESULTS.GRANTED;

      if (!cameraGranted) {
        Alert.alert(
          "Permission Required",
          "Camera access is needed to take photos."
        );
      }
      return cameraGranted;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const openCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    const options = {
      mediaType: "photo",
      quality: 0.8,
      maxWidth: 1024,
      maxHeight: 1024,
    };

    launchCamera(options, (response) => {
      if (response.didCancel) {
        console.log("User cancelled");
        return;
      }
      if (response.errorCode) {
        Alert.alert("Error", response.errorMessage || "Failed to open camera");
        return;
      }
      if (response.assets && response.assets[0]?.uri) {
        setCapturedImage(response.assets[0].uri);
        setModalVisible(true);
      }
    });
  };

  const analyzeImage = async () => {
    setIsAnalyzing(true);
    // Fake analysis – replace with real API call later
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setUploadedImages((prev) => ({
      ...prev,
      [selectedStep]: capturedImage,
    }));

    setIsAnalyzing(false);
    setCapturedImage(null);
    setModalVisible(false);
    Alert.alert("Success", `${selectedStep} analyzed successfully!`);
  };

  const skipStep = () => {
    Alert.alert("Skip", "Are you sure you want to skip this step?", [
      { text: "Cancel" },
      {
        text: "Skip",
        onPress: () => {
          setCapturedImage(null);
          setModalVisible(false);
        },
      },
    ]);
  };

  const canProceed = Object.keys(uploadedImages).length > 0;

  return (
    <ScrollView style={tw`flex-1 bg-black`}>
      <View style={tw`mt-6 bg-white px-6 pt-6 pb-20 rounded-t-3xl`}>
        {/* Header */}
        <View style={tw`flex-row items-center mb-5`}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ChevronLeft size={28} color="#000" />
          </TouchableOpacity>
          <Text style={tw`ml-3 text-xl font-bold text-black`}>
            Service Protection Inspection
          </Text>
        </View>

        {/* Current Step Info */}
        <Text style={tw`text-gray-700 text-base`}>
          Current Step: <Text style={tw`font-bold`}>{selectedStep}</Text>
        </Text>
        <View style={tw`flex-row items-center mt-2`}>
          <View style={tw`w-3 h-3 rounded-full bg-green-500 mr-2`} />
          <Text style={tw`text-green-600 font-medium`}>Active</Text>
        </View>

        <Text style={tw`text-gray-600 text-sm mt-4`}>
          Tap below to open camera and capture {selectedStep.toLowerCase()}
        </Text>

        {/* Camera / Photo Preview Box */}
        <TouchableOpacity
          onPress={openCamera}
          style={tw`mt-6 w-full h-80 bg-gray-100 rounded-2xl overflow-hidden border-2 border-dashed border-gray-300`}
        >
          {uploadedImages[selectedStep] ? (
            <Image
              source={{ uri: uploadedImages[selectedStep] }}
              style={tw`w-full h-full`}
              resizeMode="cover"
            />
          ) : (
            <View style={tw`flex-1 items-center justify-center`}>
              <CameraIcon size={60} color="#9CA3AF" />
              <Text style={tw`text-gray-500 mt-4 text-center px-6`}>
                Tap here to open camera
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Steps List */}
        <View style={tw`mt-10 space-y-3`}>
          {steps.map((item) => {
            const isDone = !!uploadedImages[item];
            return (
              <TouchableOpacity
                key={item}
                onPress={() => setSelectedStep(item)}
                style={tw`flex-row items-center justify-between p-5 rounded-2xl ${
                  selectedStep === item ? "bg-black" : "bg-gray-100"
                }`}
              >
                <Text
                  style={tw`text-base font-medium ${
                    selectedStep === item ? "text-white" : "text-gray-800"
                  }`}
                >
                  {item} {isDone && "(Done)"}
                </Text>
                <View
                  style={tw`w-7 h-7 rounded-lg items-center justify-center border-2 ${
                    selectedStep === item
                      ? "bg-blue-600 border-blue-600"
                      : isDone
                      ? "bg-green-600 border-green-600"
                      : "bg-white border-gray-400"
                  }`}
                >
                  {(isDone || selectedStep === item) && (
                    <Check size={18} color="white" />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Proceed Button */}
        <TouchableOpacity
          onPress={() => {
            if (canProceed) {
              navigation.navigate("NextScreen"); // Change to your next screen name
            } else {
              Alert.alert("Incomplete", "Please analyze at least one photo.");
            }
          }}
          style={tw`mt-10 bg-blue-600 py-4 rounded-xl items-center`}
        >
          <Text style={tw`text-white font-bold text-lg`}>Proceed</Text>
        </TouchableOpacity>
      </View>

      {/* Photo Preview & Action Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={tw`flex-1 bg-black justify-end`}>
          <View style={tw`bg-white rounded-t-3xl p-6`}>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={tw`absolute top-4 right-4 z-10`}
            >
              <X size={28} color="#000" />
            </TouchableOpacity>

            {capturedImage && (
              <Image
                source={{ uri: capturedImage }}
                style={tw`w-full h-96 rounded-2xl mt-8`}
                resizeMode="contain"
              />
            )}

            <View style={tw`flex-row justify-center mt-8`}>
              <TouchableOpacity
                onPress={analyzeImage}
                disabled={isAnalyzing}
                style={tw`bg-green-600 px-12 py-4 rounded-xl mr-6`}
              >
                {isAnalyzing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={tw`text-white font-bold text-lg`}>Analyze</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={skipStep}
                style={tw`bg-gray-600 px-12 py-4 rounded-xl`}
              >
                <Text style={tw`text-white font-bold text-lg`}>Skip</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}