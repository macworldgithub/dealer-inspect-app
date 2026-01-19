import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import AsyncStorage from "@react-native-async-storage/async-storage";
import tw from "tailwind-react-native-classnames";
import { Plus, Scan } from "lucide-react-native";
import { API_BASE_URL } from "../util/config";
import { Trash } from "lucide-react-native";

// const TOTAL_STEPS = 20;

const INSPECTION_STEPS = [
  "Exterior Front",
  "Exterior Rear",
  "Exterior Left",
  "Exterior Right",
  "Exterior Roof",

  "Interior Front",
  "Interior Rear",
  "Interior Dashboard",
  "Interior Seats",
  "Interior Floor",

  "Engine Bay",
  "Engine Fluids",
  "Battery Condition",

  "Brakes Front",
  "Brakes Rear",

  "Suspension Front",
  "Suspension Rear",

  "Tyres Front",
  "Tyres Rear",
  "Spare Tyre",
];
const TOTAL_STEPS = INSPECTION_STEPS.length;

export default function InspectionScreen({ route, navigation }) {
  const { vehicleId } = route.params;

  const [currentStep, setCurrentStep] = useState(0);
  const [images, setImages] = useState([]); 

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      const manipulated = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 1400 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      uploadOriginalImage(manipulated.uri);
    }
  };

  const getPresignedOriginalUrl = async () => {
    const res = await fetch(`${API_BASE_URL}/inspection/presigned/original`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await AsyncStorage.getItem("access_token")}`,
      },
      body: JSON.stringify({ fileType: "image/jpeg" }),
    });
    if (!res.ok) throw new Error("Presign failed");
    return res.json();
  };

  const getSignedGetUrl = async (key) => {
    const res = await fetch(`${API_BASE_URL}/aws/signed-url`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await AsyncStorage.getItem("access_token")}`,
      },
      body: JSON.stringify({ key }),
    });
    const data = await res.json();
    return data.url;
  };

  const uploadOriginalImage = async (uri) => {
    try {
      const { url, key } = await getPresignedOriginalUrl();
      const blob = await (await fetch(uri)).blob();

      await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "image/jpeg" },
        body: blob,
      });

      const signedUrl = await getSignedGetUrl(key);

      setImages((prev) => {
        const updated = [...prev];
        updated[currentStep] = {
          localUri: uri,
          key,
          signedUrl,
          analysing: false,
        };
        return updated;
      });
    } catch {
      Alert.alert("Upload failed");
    }
  };
  const analyzeImage = async () => {
    try {
      setImages((prev) =>
        prev.map((img, i) =>
          i === currentStep ? { ...img, analysing: true } : img
        )
      );

      const image = images[currentStep];

      const res = await fetch(
        "https://www.dealer-microservice.omnisuiteai.com/analyze",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image_url: image.signedUrl }),
        }
      );

      if (!res.ok) throw new Error("Analyze failed");

      const data = await res.json();
      const analysedUrl = await getSignedGetUrl(data.analysedImageKey);

      setImages((prev) =>
        prev.map((img, i) =>
          i === currentStep
            ? {
                ...img,
                analysing: false,
                analysedKey: data.analysedImageKey,
                analysedUrl,
                damages: data.damages,
              }
            : img
        )
      );
    } catch {
      Alert.alert("Analysis failed");
      setImages((prev) =>
        prev.map((img, i) =>
          i === currentStep ? { ...img, analysing: false } : img
        )
      );
    }
  };

  const createInspection = async () => {
    try {
      const validImages = images.filter((img) => img && img.analysedKey);

      if (validImages.length === 0) {
        alert("Please analyze at least one image");
        return;
      }

      const payload = {
        vehicleId,
        status: "DRAFT",
        images: validImages.map((img, index) => ({
          stepIndex: index,
          stepName: INSPECTION_STEPS[index],
          originalImageKey: img.key,
          analysedImageKey: img.analysedKey,
          aiRaw: {
            damages: img.damages ?? [],
          },
          damages: img.damages ?? [],
        })),
      };

      console.log("Inspection payload:", payload);

      const res = await fetch(`${API_BASE_URL}/inspection`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await AsyncStorage.getItem("access_token")}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Inspection creation failed");
      }

      const inspection = await res.json();
      console.log("Inspection created:", inspection);

      // ✅ SUCCESS → HOME
      navigation.reset({
        index: 0,
        routes: [{ name: "HomeTabs" }],
      });
    } catch (err) {
      console.error(err);
      alert("Failed to create inspection");
    }
  };

  const img = images[currentStep] ?? null;

  const renderPagination = () => {
    const totalPages = images.length + (images.length < 20 ? 1 : 0);

    return (
      <>
        {Array.from({ length: totalPages }).map((_, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => setCurrentStep(i)}
            style={tw`px-3 py-1 rounded-md ${
              currentStep === i ? "bg-black" : "bg-gray-200"
            }`}
          >
            <Text
              style={tw`text-sm ${
                currentStep === i ? "text-white" : "text-black"
              }`}
            >
              {i + 1}
            </Text>
          </TouchableOpacity>
        ))}
      </>
    );
  };

  const deleteImage = (stepIndex) => {
    Alert.alert("Delete Image", "Are you sure you want to remove this image?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setImages((prev) => {
            const updated = [...prev];
            updated[stepIndex] = null; // 🔥 REMOVE IMAGE
            return updated;
          });
        },
      },
    ]);
  };

  return (
    <ScrollView style={tw`flex-1 bg-black`}>
      {/* Header */}
      <View style={tw`px-6 pt-12 pb-4`}>
        <Text style={tw`text-white text-2xl font-bold`}>
          {INSPECTION_STEPS[currentStep]}
        </Text>

        <Text style={tw`text-gray-400`}>
          Inspection Image {currentStep + 1} • Step {currentStep + 1} of{" "}
          {TOTAL_STEPS}
        </Text>
      </View>

      {/* Upload */}
      {!img && currentStep < 20 && (
        <TouchableOpacity
          onPress={pickImage}
          style={tw`mx-6 my-8 bg-gray-900 rounded-2xl p-6 items-center border border-gray-700`}
        >
          <Plus size={30} color="#22C55E" />
          <Text style={tw`text-white mt-3 font-semibold`}>
            Add Inspection Image
          </Text>
          <Text style={tw`text-gray-400 text-sm mt-1 text-center`}>
            {INSPECTION_STEPS[currentStep] || "Additional Inspection"}
          </Text>
        </TouchableOpacity>
      )}

      {/* Image + Analysis */}
      {img && (
        <View style={tw`mx-6 bg-white rounded-2xl p-4`}>
          <Image
            source={{ uri: img.localUri }}
            style={tw`w-full h-48 rounded-xl`}
          />

          {!img.analysedUrl ? (
            <TouchableOpacity
              onPress={analyzeImage}
              disabled={img.analysing}
              style={tw`mt-4 bg-black py-3 rounded-full flex-row justify-center`}
            >
              {img.analysing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Scan size={18} color="white" />
                  <Text style={tw`text-white ml-2`}>Analyze</Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <>
              {/* <Image
                source={{ uri: img.analysedUrl }}
                style={tw`w-full h-48 rounded-xl mt-4`}
              /> */}

              <View style={tw`relative`}>
                <Image
                  source={{ uri: img.analysedUrl }}
                  style={tw`w-full h-48 rounded-xl`}
                />

                {/* Trash Button */}
                <TouchableOpacity
                  onPress={() => deleteImage(currentStep)}
                  style={tw`absolute top-1 right-2 bg-red-600 p-2 rounded-full`}
                >
                  <Trash size={18} color="white" />
                </TouchableOpacity>
              </View>

              {/* DAMAGES */}
              <View style={tw`mt-4 bg-gray-100 rounded-xl p-3`}>
                <Text style={tw`font-bold mb-2`}>Detected Damages</Text>

                {img.damages?.map((dmg, i) => (
                  <View key={i} style={tw`mb-2 bg-white p-2 rounded-lg`}>
                    <Text style={tw`font-semibold`}>{dmg.type}</Text>
                    <Text style={tw`text-xs text-gray-600`}>
                      {dmg.description}
                    </Text>
                    <Text style={tw`text-xs text-red-600 mt-1`}>
                      Est. Cost: {dmg.repair_cost_estimate?.currency}{" "}
                      {dmg.repair_cost_estimate?.min} -{" "}
                      {dmg.repair_cost_estimate?.max}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>
      )}

      {/* Pagination Buttons */}
      {currentStep < TOTAL_STEPS - 1 && (
        <TouchableOpacity
          onPress={() => setCurrentStep((p) => p + 1)}
          disabled={!img?.analysedKey}
          style={tw`mx-6 my-6 py-4 rounded-xl ${
            img?.analysedKey ? "bg-green-600" : "bg-green-600"
          }`}
        >
          <Text style={tw`text-white text-center font-semibold`}>Next</Text>
        </TouchableOpacity>
      )}
      <View style={tw`mx-6 mt-6`}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={tw`flex-row items-center space-x-1`}>
            {renderPagination()}
          </View>
        </ScrollView>
      </View>

      {currentStep === images.length - 1 && images.length >= 2 && (
        <TouchableOpacity
          onPress={createInspection}
          style={tw`mx-6 my-8 bg-green-600 py-4 rounded-xl shadow-lg`}
        >
          <Text style={tw`text-white text-center font-bold text-lg`}>
            Create Inspection
          </Text>
          <Text style={tw`text-green-100 text-center text-xs mt-1`}>
            {images.length} images added
          </Text>
        </TouchableOpacity>
      )}

      <View style={tw`h-24`} />
    </ScrollView>
  );
}
