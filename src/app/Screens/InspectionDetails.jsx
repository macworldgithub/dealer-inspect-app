import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import tw from "tailwind-react-native-classnames";
import { getAccessToken } from "../util/storage";
import { API_BASE_URL } from "../util/config";
import {
  User,
  Camera,
  AlertCircle,
  DollarSign,
  Scan,
  Trash,
  Plus,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function InspectionDetails({ route }) {
  const { vehicleId } = route.params;
  const [inspection, setInspection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [uploading, setUploading] = useState(false);

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

  useEffect(() => {
    const fetchInspection = async () => {
      try {
        const token = await getAccessToken();
        const res = await fetch(
          `${API_BASE_URL}/inspection/vehicle/${vehicleId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (!res.ok) throw new Error(`API error ${res.status}`);
        const data = await res.json();

        if (data.items?.length > 0) {
          const inspectionData = data.items[0];

          const imagesWithUrls = await Promise.all(
            (inspectionData.images || []).map(async (img) => ({
              ...img,
              analysedImageUrl: img.analysedImageKey
                ? await getSignedGetUrl(img.analysedImageKey)
                : null,
            })),
          );

          setInspection({ ...inspectionData, images: imagesWithUrls });
        }
      } catch (err) {
        console.error("Failed to fetch inspection:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchInspection();
  }, [vehicleId]);

  if (loading)
    return (
      <View style={tw`flex-1 justify-center items-center bg-gray-900`}>
        <ActivityIndicator size="large" color="#22C55E" />
      </View>
    );

  if (!inspection)
    return (
      <View style={tw`flex-1 justify-center items-center bg-gray-900`}>
        <Text style={tw`text-white text-lg`}>No inspection found</Text>
      </View>
    );

  const vehicle = inspection.vehicleId;
  const inspector = inspection.inspectedBy;
  const images = inspection.images || [];
  const totalImages = images.length;
  const currentImg = images[currentImageIndex] || null;

 

  // Upload / Replace image
  const updateImage = async (imageIndex) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });
      if (result.canceled) return;

      setUploading(true);
      const manipulated = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 1400 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG },
      );

      // Presigned URL
      const presignRes = await fetch(
        `${API_BASE_URL}/inspection/presigned/original`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await AsyncStorage.getItem("access_token")}`,
          },
          body: JSON.stringify({ fileType: "image/jpeg" }),
        },
      );
      const { url, key } = await presignRes.json();
      const blob = await (await fetch(manipulated.uri)).blob();
      await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "image/jpeg" },
        body: blob,
      });

      // PATCH backend
      const imageToUpdate = inspection.images[currentImageIndex]; // from state
      console.log(imageToUpdate, "IMAGE");
      const imageId = imageToUpdate._id;

      // Build body using existing fields
      const bodyPayload = {
        originalImageKey: key,

        analysedImageKey: null,
        aiRaw: {},
        damages: [],
      };

      console.log(bodyPayload, "Payload");
      // If you just uploaded a new image, replace originalImageKey
      //   bodyPayload.originalImageKey = key;

      const token = await AsyncStorage.getItem("access_token");

      const res = await fetch(
        `${API_BASE_URL}/inspection/${inspection._id}/images/${imageId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(bodyPayload),
        },
      );
      console.log(res, "RES");
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Failed to update inspection image");
      }

      console.log(await res.json(), "PATCH response successful");
      const signedUrl = await getSignedGetUrl(key);
      const updatedImages = [...inspection.images];
      updatedImages[imageIndex] = {
        ...updatedImages[imageIndex],
        originalImageKey: key,
        originalImageUrl: signedUrl,

        analysedImageKey: null,
        analysedImageUrl: null,
        aiRaw: {},
        damages: [],
        analysing: false,
      };

      setInspection({ ...inspection, images: updatedImages });
    } catch (err) {
      console.error(err);
      Alert.alert("Image update failed", err.message);
    } finally {
      setUploading(false);
    }
  };

  // Analyze image
  const analyzeImage = async (imageIndex) => {
    try {
      const img = inspection.images[imageIndex];
      const updatedImages = [...inspection.images];
      updatedImages[imageIndex].analysing = true;
      setInspection({ ...inspection, images: updatedImages });

      const res = await fetch(
        "https://www.dealer-microservice.omnisuiteai.com/analyze",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image_url: img.originalImageUrl }),
        },
      );
      console.log(res, "RES")
      if (!res.ok) throw new Error("Analysis failed");
      const data = await res.json();

      // PATCH analyzed image
      await fetch(
        `${API_BASE_URL}/inspection/${inspection._id}/images/${img._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await AsyncStorage.getItem("access_token")}`,
          },
          body: JSON.stringify({
            analysedImageKey: data.analysedImageKey,
            aiRaw: data.aiRaw || {},
            damages: data.damages || [],
          }),
        },
      );

      const signedUrl = await getSignedGetUrl(data.analysedImageKey);
      updatedImages[imageIndex] = {
        ...updatedImages[imageIndex],
        analysedImageKey: data.analysedImageKey,
        analysedImageUrl: signedUrl,
        aiRaw: data.aiRaw || {},
        damages: data.damages || [],
        analysing: false,
      };

      setInspection({ ...inspection, images: updatedImages });
    } catch (err) {
      console.error(err);
      Alert.alert("Analysis failed", err.message);
      const updatedImages = [...inspection.images];
      updatedImages[imageIndex].analysing = false;
      setInspection({ ...inspection, images: updatedImages });
    }
  };

  return (
    <ScrollView
      style={tw`flex-1 bg-gray-900`}
      contentContainerStyle={tw`pb-10`}
    >
      {/* Vehicle Info */}
      <View style={tw`bg-gray-800 mx-4 mt-6 p-6 rounded-2xl shadow-lg`}>
        <Text style={tw`text-2xl font-bold text-white mb-1`}>
          {vehicle.make} {vehicle.model}{" "}
          {vehicle.variant ? `(${vehicle.variant})` : ""}
        </Text>
        <Text style={tw`text-gray-400 mb-2`}>
          Year: {vehicle.yearOfManufacture} | Reg: {vehicle.registrationNumber}
        </Text>
        <Text style={tw`text-gray-400 mb-2`}>
          Chassis: {vehicle.chassisNumber} | Transmission:{" "}
          {vehicle.transmission}
        </Text>
      </View>

      {/* Inspector Info */}
      <View style={tw`bg-gray-800 mx-4 mt-6 p-6 rounded-2xl shadow-lg`}>
        <Text style={tw`text-xl font-semibold text-white mb-3`}>Inspector</Text>
        <View style={tw`flex-row items-center mb-1`}>
          <User size={20} color="#9CA3AF" />
          <Text style={tw`text-gray-300 ml-2`}>{inspector.name}</Text>
        </View>
        <View style={tw`flex-row items-center mb-1`}>
          <Camera size={20} color="#9CA3AF" />
          <Text style={tw`text-gray-300 ml-2`}>{inspector.role}</Text>
        </View>
        <View style={tw`flex-row items-center`}>
          <AlertCircle size={20} color="#9CA3AF" />
          <Text style={tw`text-gray-300 ml-2`}>{inspector.email}</Text>
        </View>
      </View>

      {/* Inspection Status */}
      <View style={tw`bg-gray-800 mx-4 mt-6 p-6 rounded-2xl shadow-lg`}>
        <Text style={tw`text-xl font-semibold text-white mb-3`}>Status</Text>
        <Text style={tw`text-gray-300`}>{inspection.status}</Text>
      </View>

      {/* Inspection Images */}
      <View style={tw`bg-gray-800 mx-4 mt-6 p-6 rounded-2xl shadow-lg`}>
        <Text style={tw`text-xl font-semibold text-white mb-4`}>
          Images & Analysis
        </Text>

        {currentImg ? (
          <>
            {/* Original Image */}
            <Text style={tw`text-gray-400 mb-1`}>Original Image</Text>
            <Image
              source={{ uri: currentImg.originalImageUrl }}
              style={tw`w-full h-56 rounded-2xl bg-gray-700 mb-4`}
              resizeMode="cover"
            />

            <TouchableOpacity
              style={tw`mb-4 bg-green-600 py-3 rounded-full items-center`}
              onPress={() => updateImage(currentImageIndex)}
              disabled={uploading}
            >
              <Text style={tw`text-white ml-2 mt-1`}>Update Image</Text>
            </TouchableOpacity>

            {/* Analysed Image */}
            {currentImg.analysedImageUrl ? (
              <View>
                <Text style={tw`text-gray-400 mb-1`}>Analysed Image</Text>
                <Image
                  source={{ uri: currentImg.analysedImageUrl }}
                  style={tw`w-full h-56 rounded-2xl bg-gray-700 mb-4`}
                />
                {/* Damages */}
                {currentImg.damages?.length > 0 ? (
                  <View>
                    <Text style={tw`text-white font-semibold mb-2`}>
                      Damages
                    </Text>
                    {currentImg.damages.map((d, i) => (
                      <View key={i} style={tw`bg-gray-700 p-3 rounded-xl mb-2`}>
                        <Text style={tw`text-red-400 font-semibold`}>
                          {d.type.toUpperCase()} ({d.severity})
                        </Text>
                        <Text style={tw`text-gray-300`}>{d.description}</Text>
                        <View style={tw`flex-row items-center`}>
                          <DollarSign size={16} color="#9CA3AF" />
                          <Text style={tw`text-gray-300 ml-2`}>
                            ${d.repair_cost_estimate?.min} - $
                            {d.repair_cost_estimate?.max}{" "}
                            {d.repair_cost_estimate?.currency}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={tw`text-gray-400`}>No damages found</Text>
                )}
              </View>
            ) : (
              <TouchableOpacity
                style={tw`mb-4 bg-black py-3 rounded-full items-center flex-row justify-center`}
                onPress={() => analyzeImage(currentImageIndex)}
                disabled={currentImg.analysing}
              >
                {currentImg.analysing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Scan size={18} color="#fff" />
                    <Text style={tw`text-white ml-2`}>Analyze</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </>
        ) : (
          <Text style={tw`text-gray-400 text-center py-6`}>
            No images available
          </Text>
        )}
      </View>

      {/* Pagination */}
      {totalImages > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={tw`mx-6 mt-4`}
        >
          <View style={tw`flex-row space-x-2`}>
            {images.map((_, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setCurrentImageIndex(i)}
                style={tw`px-3 py-1 rounded-md ${i === currentImageIndex ? "bg-green-600" : "bg-gray-800"}`}
              >
                <Text style={tw`text-white`}>{i + 1}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      <View style={tw`h-20`} />
    </ScrollView>
  );
}
