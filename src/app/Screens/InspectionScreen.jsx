import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import AsyncStorage from "@react-native-async-storage/async-storage";
import tw from "tailwind-react-native-classnames";
import { Plus, X } from "lucide-react-native";
import { API_BASE_URL } from "../util/config";

const MAX_IMAGES = 25;

export default function InspectionScreen({ route }) {
  const [images, setImages] = useState([]); // { localUri, key, signedUrl }
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    if (images.length >= MAX_IMAGES) {
      alert(`You can upload up to ${MAX_IMAGES} images`);
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
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      uploadImage(manipulated.uri);
    }
  };

  const getPresignedPutUrl = async () => {
    const res = await fetch(`${API_BASE_URL}/inspection/presigned/original`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await AsyncStorage.getItem("access_token")}`,
      },
      body: JSON.stringify({ fileType: "image/jpeg" }),
    });
    console.log("Response for original",res)
    if (!res.ok) throw new Error("Failed to get presigned URL");
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
    console.log("Signed Url", data)
    return data.url;
  };

  const uploadImage = async (uri) => {
    try {
      setUploading(true);

      const { url, key } = await getPresignedPutUrl();
      const response = await fetch(uri);
      const blob = await response.blob();

      const uploadRes = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "image/jpeg" },
        body: blob,
      });
      console.log("Upload Res", uploadRes)
      if (!uploadRes.ok) throw new Error("Upload failed");

      const signedUrl = await getSignedGetUrl(key);
      console.log("Signed URL.....", signedUrl)
      setImages((prev) => [...prev, { localUri: uri, key, signedUrl }]);
    } catch (err) {
      console.error(err);
      alert("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <ScrollView style={tw`flex-1 bg-black`}>
      <View style={tw`px-6 pt-12 pb-6`}>
        <Text style={tw`text-white text-2xl font-bold`}>Inspection Images</Text>
        <Text style={tw`text-gray-400 mt-1`}>
          Upload clear images of the vehicle (max {MAX_IMAGES})
        </Text>
      </View>

      <View style={tw`mx-5 bg-white rounded-3xl p-5 shadow-2xl`}>
        <View style={tw`flex-row flex-wrap gap-4`}>
          {images.map((img, index) => (
            <View key={index} style={tw`relative`}>
              <Image
                source={{ uri: img.signedUrl || img.localUri }}
                style={tw`w-28 h-28 rounded-xl`}
              />
              <TouchableOpacity
                onPress={() => removeImage(index)}
                style={tw`absolute -top-2 -right-2 bg-black rounded-full p-1`}
              >
                <X size={14} color="white" />
              </TouchableOpacity>
            </View>
          ))}

          {images.length < MAX_IMAGES && (
            <TouchableOpacity
              onPress={pickImage}
              style={tw`w-28 h-28 rounded-xl border-2 border-dashed border-gray-400 justify-center items-center`}
            >
              {uploading ? (
                <ActivityIndicator />
              ) : (
                <Plus size={32} color="#9CA3AF" />
              )}
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={tw`bg-black rounded-full py-4 mt-8`}
          onPress={() => {
            /* Submit inspection with image keys */
            console.log(images.map((i) => i.key));
          }}
        >
          <Text style={tw`text-white text-center text-lg font-semibold`}>
            Continue Inspection
          </Text>
        </TouchableOpacity>
      </View>

      <View style={tw`h-24`} />
    </ScrollView>
  );
}
