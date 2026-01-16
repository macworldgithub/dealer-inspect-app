import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import AsyncStorage from "@react-native-async-storage/async-storage";
import tw from "tailwind-react-native-classnames";
import { Plus, X, Scan } from "lucide-react-native";
import { API_BASE_URL } from "../util/config";

const MAX_IMAGES = 20;

export default function InspectionScreen({ route }) {
  const { vehicleId, image } = route.params;
  const [images, setImages] = useState([]);
  const [inspectionId, setInspectionId] = useState(null);

  const pickImage = async () => {
    if (images.length >= MAX_IMAGES) {
      alert(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      const manipulated = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 1400 } }],
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
        }
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
    console.log("Presign response:", res);
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
    console.log("Signed Image", data);
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

      setImages((prev) => [
        ...prev,
        {
          localUri: uri,
          key,
          signedUrl,
          analysing: false,
        },
      ]);
    } catch (e) {
      alert("Upload failed");
    }
  };

  const analyzeImage = async (index) => {
    try {
      setImages((prev) =>
        prev.map((img, i) => (i === index ? { ...img, analysing: true } : img))
      );

      const image = images[index];

      // 1️⃣ AI ANALYZE
      const res = await fetch(
        "https://www.dealer-microservice.omnisuiteai.com/analyze",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image_url: image.signedUrl }),
        }
      );

      if (!res.ok) throw new Error("Analysis failed");

      const data = await res.json();
      console.log("Analysis data:", data);

      const analysedSignedUrl = await getSignedGetUrl(data.analysedImageKey);

      // 2️⃣ UPDATE IMAGE STATE
      setImages((prev) =>
        prev.map((img, i) =>
          i === index
            ? {
                ...img,
                analysing: false,
                analysedKey: data.analysedImageKey,
                analysedUrl: analysedSignedUrl,
                damages: data.damages,
              }
            : img
        )
      );

      // 3️⃣ AUTO-SAVE INSPECTION
      await upsertInspection({
        analysedImageKey: data.analysedImageKey,
        damages: data.damages,
      });
    } catch (e) {
      alert("Analysis failed");
      setImages((prev) =>
        prev.map((img, i) => (i === index ? { ...img, analysing: false } : img))
      );
    }
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const createInspection = async () => {
    try {
      const payload = {
        vehicleId,
        status: "DRAFT",
        images: images
          .filter((img) => img.analysedKey)
          .map((img) => ({
            originalImageKey: img.key,
            analysedImageKey: img.analysedKey,
            aiRaw: {
              damages: img.damages,
            },
            damages: img.damages,
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
      console.log("Inspection", res);

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Inspection creation failed");
      }

      const inspection = await res.json();
      console.log("Inspection created:", inspection);
    } catch (err) {
      console.error(err);
      alert("Failed to create inspection");
    }
  };

  return (
    // <ScrollView style={tw`flex-1 bg-black`}>
    //   <View style={tw`px-6 pt-12 pb-6`}>
    //     <Text style={tw`text-white text-2xl font-bold`}>Inspection Images</Text>
    //     <Text style={tw`text-gray-400 mt-1`}>
    //       Upload, Analyze and Review damages
    //     </Text>
    //   </View>

    //   <View style={tw`mx-5 bg-white rounded-3xl p-5 shadow-2xl`}>
    //     <View style={tw`flex-row flex-wrap gap-4`}>
    //       {images.map((img, index) => (
    //         <View key={index} style={tw`relative w-28`}>
    //           <Image
    //             source={{ uri: img.analysedUrl || img.signedUrl }}
    //             style={tw`w-28 h-28 rounded-xl`}
    //           />

    //           <TouchableOpacity
    //             onPress={() => removeImage(index)}
    //             style={tw`absolute -top-2 -right-2 bg-black rounded-full p-1`}
    //           >
    //             <X size={14} color="white" />
    //           </TouchableOpacity>

    //           <TouchableOpacity
    //             onPress={() => analyzeImage(index)}
    //             disabled={img.analysing}
    //             style={tw`mt-2 bg-black rounded-full py-1 flex-row justify-center items-center`}
    //           >
    //             {img.analysing ? (
    //               <ActivityIndicator color="#fff" size="small" />
    //             ) : (
    //               <>
    //                 <Scan size={14} color="white" />
    //                 <Text style={tw`text-white text-xs ml-1`}>Analyze</Text>
    //               </>
    //             )}
    //           </TouchableOpacity>
    //           <TouchableOpacity
    //             onPress={createInspection}
    //             disabled={!images.some((img) => img.analysedKey)}
    //             style={tw`mt-6 bg-black py-3 rounded-xl`}
    //           >
    //             <Text style={tw`text-white text-center font-semibold`}>
    //               Save Inspection
    //             </Text>
    //           </TouchableOpacity>
    //         </View>
    //       ))}

    //       {images.length < MAX_IMAGES && (
    //         <TouchableOpacity
    //           onPress={pickImage}
    //           style={tw`w-28 h-28 rounded-xl border-2 border-dashed border-gray-400 justify-center items-center`}
    //         >
    //           <Plus size={32} color="#9CA3AF" />
    //         </TouchableOpacity>
    //       )}
    //     </View>
    //   </View>

    //   <View style={tw`h-24`} />
    // </ScrollView>
    <ScrollView style={tw`flex-1 bg-black`}>
      {/* Heading */}
      <View style={tw`px-6 pt-12 pb-4`}>
        <Text style={tw`text-white text-2xl font-bold`}>Inspection Images</Text>
        <Text style={tw`text-gray-400 mt-1`}>
          Upload, analyze and review damages
        </Text>
      </View>

      {/* Image Upload Button */}
      {images.length < MAX_IMAGES && (
        <TouchableOpacity
          onPress={pickImage}
          style={tw`mx-6 my-4 h-28 rounded-xl border-2 border-dashed border-gray-400 justify-center items-center`}
        >
          <Plus size={32} color="#9CA3AF" />
          <Text style={tw`text-gray-400 mt-1`}>Upload Image</Text>
        </TouchableOpacity>
      )}

      {/* Uploaded Images */}
      {images.map((img, index) => (
        <View
          key={index}
          style={tw`mx-6 my-4 bg-white rounded-2xl p-4 shadow-md`}
        >
          {/* Images Row */}
          <View style={tw`flex-row`}>
            {/* Original Image */}
            <View style={tw`flex-1 mr-2 items-center`}>
              <Image
                source={{ uri: img.localUri }}
                style={tw`w-full h-40 rounded-xl`}
                resizeMode="cover"
              />
              <TouchableOpacity
                onPress={() => removeImage(index)}
                style={tw`mt-2 bg-red-500 py-1 px-3 rounded-full`}
              >
                <Text style={tw`text-white font-semibold text-sm`}>Delete</Text>
              </TouchableOpacity>
            </View>

            {/* Analyzed Image */}
            <View style={tw`flex-1 ml-2 items-center`}>
              {img.analysedUrl ? (
                <Image
                  source={{ uri: img.analysedUrl }}
                  style={tw`w-full h-40 rounded-xl`}
                  resizeMode="cover"
                />
              ) : (
                <TouchableOpacity
                  onPress={() => analyzeImage(index)}
                  disabled={img.analysing}
                  style={tw`mt-16 bg-black rounded-full py-2 px-4 flex-row items-center`}
                >
                  {img.analysing ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <Scan size={16} color="white" />
                      <Text style={tw`text-white text-sm ml-2`}>Analyze</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>

          {img.analysedUrl && img.damages?.length > 0 && (
            <View style={tw`mt-4 bg-gray-100 rounded-xl p-3`}>
              <Text style={tw`text-gray-800 font-bold text-sm mb-2`}>
                Detected Damages
              </Text>

              {img.damages.map((dmg, i) => (
                <View
                  key={i}
                  style={tw`mb-2 bg-white rounded-lg p-2 border border-gray-200`}
                >
                  <Text style={tw`text-black font-semibold text-sm`}>
                    {dmg.type || "Unknown Damage"}
                  </Text>

                  {dmg.description && (
                    <Text style={tw`text-gray-600 text-xs mt-1`}>
                      {dmg.description}
                    </Text>
                  )}

                  <View style={tw`flex-row justify-between mt-1`}>
                    <Text style={tw`text-xs text-gray-500`}>
                      Severity: {dmg.severity ?? "N/A"}
                    </Text>
                    <Text style={tw`text-xs text-gray-500`}>
                      Confidence: {dmg.confidence ?? "N/A"}
                    </Text>
                  </View>

                  {dmg.repair_cost_estimate && (
                    <Text style={tw`text-xs text-red-600 mt-1`}>
                      Est. Cost: {dmg.repair_cost_estimate.currency}{" "}
                      {dmg.repair_cost_estimate.min} -{" "}
                      {dmg.repair_cost_estimate.max}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      ))}

      {/* Create Inspection Button */}
      {images.some((img) => img.analysedKey) && (
        <TouchableOpacity
          onPress={createInspection}
          style={tw`mx-6 my-6 bg-black py-4 rounded-xl`}
        >
          <Text style={tw`text-white text-center font-semibold text-lg`}>
            Create Inspection
          </Text>
        </TouchableOpacity>
      )}

      <View style={tw`h-24`} />
    </ScrollView>
  );
}
