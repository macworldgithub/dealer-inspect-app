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
  FlatList,
} from "react-native";
import tw from "tailwind-react-native-classnames";
import { launchCamera } from "react-native-image-picker";
import {
  Camera as CameraIcon,
  Check,
  ChevronLeft,
  X,
} from "lucide-react-native";

export default function ServiceProtectionScreen1({ navigation }) {
  const [selectedStep, setSelectedStep] = useState("Exterior Front");
  const [capturedImage, setCapturedImage] = useState(null);
  const [uploadedImages, setUploadedImages] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const steps = [
    "Exterior Front",
    "Exterior Left",
    "Exterior Right",
    "Interior Front",
    "Interior Back",
    "Engine Bay",
    "Trunk Area",
  ];

  const requestCameraPermission = async () => {
    if (Platform.OS === "ios") return true;

    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      ]);

      return (
        granted["android.permission.CAMERA"] ===
        PermissionsAndroid.RESULTS.GRANTED
      );
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const openCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert("Permission Denied", "Camera access is required.");
      return;
    }

    const options = {
      mediaType: "photo",
      quality: 0.8,
      maxWidth: 1024,
      maxHeight: 1024,
    };

    launchCamera(options, (response) => {
      if (response.didCancel || response.errorCode) return;

      if (response.assets && response.assets[0]?.uri) {
        setCapturedImage(response.assets[0].uri);
        setModalVisible(true);
      }
    });
  };

  const analyzeImage = async () => {
    setIsAnalyzing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setUploadedImages((prev) => ({
      ...prev,
      [selectedStep]: capturedImage,
    }));

    setIsAnalyzing(false);
    setCapturedImage(null);
    setModalVisible(false);

    Alert.alert("Success", `${selectedStep} photo analyzed and saved!`);
  };

  const canProceed = Object.keys(uploadedImages).length > 0;

  const analyzedPhotoList = Object.keys(uploadedImages).map((step) => ({
    step,
    uri: uploadedImages[step],
  }));

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
        <Text style={tw`text-gray-600 text-sm mt-4`}>
          Capture a clear photo of {selectedStep.toLowerCase()}
        </Text>

        {/* Camera Area */}
        <TouchableOpacity
          onPress={openCamera}
          style={tw`mt-6 w-full h-80 bg-gray-100 rounded-2xl overflow-hidden border-2 border-dashed border-gray-300 relative`}
        >
          {uploadedImages[selectedStep] ? (
            <>
              <Image
                source={{ uri: uploadedImages[selectedStep] }}
                style={tw`w-full h-full`}
                resizeMode="cover"
              />

              <View
                style={tw`absolute inset-0 bg-black/40 items-center justify-center`}
              >
                <CameraIcon size={50} color="white" />
                <Text style={tw`text-white text-lg font-medium mt-3`}>
                  Tap to retake photo
                </Text>
              </View>
            </>
          ) : (
            <View style={tw`flex-1 items-center justify-center`}>
              <CameraIcon size={60} color="#9CA3AF" />
              <Text
                style={tw`text-gray-500 mt-4 text-center px-6 text-lg font-medium`}
              >
                Tap to capture photo
              </Text>
              <Text style={tw`text-gray-400 text-sm mt-2`}>{selectedStep}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Steps List */}
        <View style={tw`mt-10 space-y-3`}>
          {steps.map((item) => {
            const isDone = !!uploadedImages[item];
            const isActive = selectedStep === item;

            return (
              <TouchableOpacity
                key={item}
                onPress={() => setSelectedStep(item)}
                style={tw`flex-row items-center justify-between p-5 rounded-2xl gap-4 ${
                  isActive ? "bg-black" : "bg-gray-100"
                }`}
              >
                <Text
                  style={tw`text-base font-medium ${
                    isActive ? "text-white" : "text-gray-800"
                  }`}
                >
                  {item} {isDone && "(Done)"}
                </Text>
                <View
                  style={tw`w-7 h-7 rounded-lg items-center justify-center border-2 ${
                    isDone
                      ? "bg-green-600 border-green-600"
                      : isActive
                      ? "bg-blue-600 border-blue-600"
                      : "bg-white border-gray-400"
                  }`}
                >
                  {isDone || isActive ? (
                    <Check size={18} color="white" />
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Horizontal Scrollable Analyzed Photos */}
        {analyzedPhotoList.length > 0 && (
          <View style={tw`mt-10`}>
            <Text style={tw`text-lg font-semibold text-gray-800 mb-4`}>
              Analyzed Photos ({analyzedPhotoList.length})
            </Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <View style={tw`flex-row space-x-4 pb-4`}>
                {analyzedPhotoList.map(({ step, uri }) => (
                  <View
                    key={step}
                    style={tw`w-48 rounded-xl overflow-hidden border border-gray-300 shadow-md`}
                  >
                    <Image
                      source={{ uri }}
                      style={tw`w-full h-48`}
                      resizeMode="cover"
                    />
                    <View style={tw`p-3 bg-gray-50`}>
                      <Text
                        style={tw`text-xs text-gray-600 text-center font-medium`}
                      >
                        {step}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Proceed Button */}
        <TouchableOpacity
          onPress={() => {
            if (canProceed) {
              navigation.navigate("NextScreen");
            } else {
              Alert.alert("Incomplete", "Please analyze at least one photo.");
            }
          }}
          style={tw`mt-10 bg-blue-600 py-4 rounded-xl items-center ${
            !canProceed ? "opacity-50" : ""
          }`}
          disabled={!canProceed}
        >
          <Text style={tw`text-white font-bold text-lg`}>Proceed</Text>
        </TouchableOpacity>
      </View>

      {/* Modal: Only Analyze Button */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={tw`flex-1 bg-black/90 justify-end`}>
          <View style={tw`bg-white rounded-t-3xl p-6`}>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={tw`absolute top-4 right-4 z-10`}
            >
              <X size={28} color="#000" />
            </TouchableOpacity>

            <Text
              style={tw`text-center text-lg font-semibold text-gray-800 mt-6`}
            >
              Review Photo - {selectedStep}
            </Text>

            {capturedImage && (
              <Image
                source={{ uri: capturedImage }}
                style={tw`w-full h-96 rounded-2xl mt-6`}
                resizeMode="contain"
              />
            )}

            <TouchableOpacity
              onPress={analyzeImage}
              disabled={isAnalyzing}
              style={tw`mt-10 bg-green-600 py-5 rounded-xl items-center`}
            >
              {isAnalyzing ? (
                <ActivityIndicator size="large" color="#fff" />
              ) : (
                <Text style={tw`text-white font-bold text-xl`}>
                  Analyze Photo
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={tw`mt-4 py-3 items-center`}
            >
              <Text style={tw`text-gray-600 font-medium`}>Cancel & Retake</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
