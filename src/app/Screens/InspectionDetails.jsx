import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  TextInput,
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
  Pencil,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Modal from "react-native-modal";
import { Picker } from "@react-native-picker/picker";

export default function InspectionDetails({ route }) {
  const { vehicleId } = route.params;
  const [inspection, setInspection] = useState(null);
  console.log(inspection);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [uploading, setUploading] = useState(false);

  const [isDamageModalVisible, setDamageModalVisible] = useState(false);
  const [selectedDamage, setSelectedDamage] = useState(null);
  const [formData, setFormData] = useState({
    type: "",
    severity: "moderate",
    description: "",
    confidence: "0.9",
    minCost: "",
    maxCost: "",
  });
  const [updatingDamage, setUpdatingDamage] = useState(false);

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
      console.log(res, "RES");
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

  const deleteInspection = async () => {
    Alert.alert(
      "Delete Inspection",
      "Are you sure you want to delete the entire inspection of this vehicle? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("access_token");

              const res = await fetch(
                `${API_BASE_URL}/inspection/${inspection._id}`,
                {
                  method: "DELETE",
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                },
              );

              if (!res.ok) {
                const err = await res.text();
                throw new Error(err || "Failed to delete inspection");
              }

              Alert.alert("Success", "Inspection deleted successfully");

              route?.params?.navigation?.goBack?.();
            } catch (err) {
              console.error(err);
              Alert.alert("Delete failed", err.message);
            }
          },
        },
      ],
    );
  };
  const openUpdateDamageModal = (damage) => {
    console.log("Opening modal for damage:", damage?._id, damage?.type); // ← debug 2

    if (!damage) {
      console.log("No damage object received");
      return;
    }

    setSelectedDamage(damage);
    setFormData({
      type: damage.type || "dent",
      severity: damage.severity || "moderate",
      description: damage.description || "",
      confidence: damage.confidence?.toString() || "0.9",
      minCost: damage.repair_cost_estimate?.min?.toString() || "",
      maxCost: damage.repair_cost_estimate?.max?.toString() || "",
    });

    console.log("Setting modal visible to true"); // ← debug 3
    setDamageModalVisible(true);
  };

  const handleUpdateDamage = async () => {
    if (!selectedDamage) return;

    const damageId = selectedDamage._id;

    const payload = {
      type: formData.type,
      severity: formData.severity,
      confidence: parseFloat(formData.confidence) || 0.9,
      bbox: selectedDamage.bbox || [0, 0, 1, 1],
      description: formData.description.trim(),
      repair_cost_estimate: {
        currency: "USD",
        min: parseInt(formData.minCost) || 0,
        max: parseInt(formData.maxCost) || 0,
      },
    };

    try {
      setUpdatingDamage(true);

      const token = await AsyncStorage.getItem("access_token");

      const res = await fetch(
        `${API_BASE_URL}/inspection/${inspection._id}/images/${currentImg._id}/damages/${damageId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "*/*",
          },
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Update failed");
      }

      // Update local state optimistically
      const updatedImages = [...inspection.images];
      const imgIdx = updatedImages.findIndex(
        (img) => img._id === currentImg._id,
      );

      if (imgIdx !== -1) {
        updatedImages[imgIdx].damages = updatedImages[imgIdx].damages.map(
          (d) => (d._id === damageId ? { ...d, ...payload } : d),
        );
        setInspection({ ...inspection, images: updatedImages });
      }

      Alert.alert("Success", "Damage updated!");
      setDamageModalVisible(false);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", err.message || "Failed to update damage");
    } finally {
      setUpdatingDamage(false);
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
                {/* Damages section */}
                {currentImg.damages?.length > 0 ? (
                  <View>
                    <Text style={tw`text-white font-semibold mb-2`}>
                      Damages
                    </Text>

                    {currentImg.damages.map((d, i) => (
                      <View
                        key={d._id}
                        style={tw`bg-gray-700 p-4 rounded-xl mb-3 relative`}
                      >
                        {/* Edit icon – top right corner */}
                        <TouchableOpacity
                          style={tw`absolute top-2 right-2 p-3 bg-gray-800 rounded-full z-10`} // ← bigger touch area + z-index
                          onPress={() => {
                            console.log(
                              "Edit icon clicked for damage:",
                              d._id,
                              d.type,
                            ); // ← debug 1
                            openUpdateDamageModal(d);
                          }}
                        >
                          <Pencil size={14} color="#60A5FA" />
                        </TouchableOpacity>

                        <Text style={tw`text-red-400 font-semibold text-base`}>
                          {d.type.toUpperCase()} ({d.severity})
                        </Text>
                        <Text style={tw`text-gray-300 mt-1`}>
                          {d.description}
                        </Text>
                        <View style={tw`flex-row items-center mt-2`}>
                          <DollarSign size={16} color="#9CA3AF" />
                          <Text style={tw`text-gray-300 ml-2`}>
                            ${d.repair_cost_estimate?.min || "?"} - $
                            {d.repair_cost_estimate?.max || "?"}{" "}
                            {d.repair_cost_estimate?.currency || "USD"}
                          </Text>
                        </View>
                      </View>
                    ))}
                    <TouchableOpacity
                      style={tw`mt-4 bg-red-600 py-3 rounded-full items-center flex-row justify-center`}
                      onPress={deleteInspection}
                    >
                      <Trash size={18} color="#fff" />
                      <Text style={tw`text-white ml-2 font-semibold`}>
                        Delete Inspection
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View>
                    <Text style={tw`text-gray-400 mb-4`}>No damages found</Text>

                    {/* DELETE EVEN IF NO DAMAGES */}
                    <TouchableOpacity
                      style={tw`bg-red-600 py-3 rounded-full items-center flex-row justify-center`}
                      onPress={deleteInspection}
                    >
                      <Trash size={18} color="#fff" />
                      <Text style={tw`text-white ml-2 font-semibold`}>
                        Delete Inspection
                      </Text>
                    </TouchableOpacity>
                  </View>
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

      <Modal
        isVisible={isDamageModalVisible}
        onBackdropPress={() => setDamageModalVisible(false)}
        avoidKeyboard={true}
        backdropOpacity={0.5}
        animationIn="fadeIn"
        animationOut="fadeOut"
        style={{ justifyContent: "center", margin: 0 }}
      >
        <View style={tw`mx-6 mb-18`}>
          <ScrollView
            style={tw`bg-gray-800 rounded-2xl`}
            contentContainerStyle={tw`p-6`}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={tw`text-white text-xl font-bold mb-4 text-center`}>
              Update Damage
            </Text>

            {/* Type */}
            <Text style={tw`text-gray-300 mb-1`}>Type</Text>
            <TextInput
              style={tw`bg-gray-700 text-white p-3 rounded mb-3`}
              value={formData.type}
              onChangeText={(text) => setFormData({ ...formData, type: text })}
              placeholder="dent, scratch, crack..."
              placeholderTextColor="#9CA3AF"
            />

            {/* Severity */}
            <Text style={tw`text-gray-300 mb-1`}>Severity</Text>
            <Picker
              selectedValue={formData.severity}
              onValueChange={(value) =>
                setFormData({ ...formData, severity: value })
              }
              style={tw`bg-gray-700 text-white mb-3 rounded`}
              dropdownIconColor="#fff"
            >
              <Picker.Item label="Minor" value="minor" />
              <Picker.Item label="Moderate" value="moderate" />
              <Picker.Item label="Severe" value="severe" />
            </Picker>

            {/* Description */}
            <Text style={tw`text-gray-300 mb-1`}>Description</Text>
            <TextInput
              style={tw`bg-gray-700 text-white p-3 rounded mb-3 h-24`}
              value={formData.description}
              onChangeText={(text) =>
                setFormData({ ...formData, description: text })
              }
              multiline
              placeholder="Enter damage description..."
              placeholderTextColor="#9CA3AF"
            />

            {/* Confidence */}
            <Text style={tw`text-gray-300 mb-1`}>Confidence (0-1)</Text>
            <TextInput
              style={tw`bg-gray-700 text-white p-3 rounded mb-3`}
              value={formData.confidence}
              onChangeText={(text) =>
                setFormData({ ...formData, confidence: text })
              }
              keyboardType="numeric"
              placeholder="0.9"
              placeholderTextColor="#9CA3AF"
            />

            {/* Cost Range */}
            <Text style={tw`text-gray-300 mb-1`}>
              Repair Cost Estimate (USD)
            </Text>
            <View style={tw`flex-row justify-between mb-4`}>
              <TextInput
                style={tw`bg-gray-700 text-white p-3 rounded flex-1 mr-2`}
                value={formData.minCost}
                onChangeText={(text) =>
                  setFormData({ ...formData, minCost: text })
                }
                keyboardType="numeric"
                placeholder="Min"
                placeholderTextColor="#9CA3AF"
              />
              <TextInput
                style={tw`bg-gray-700 text-white p-3 rounded flex-1`}
                value={formData.maxCost}
                onChangeText={(text) =>
                  setFormData({ ...formData, maxCost: text })
                }
                keyboardType="numeric"
                placeholder="Max"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Buttons */}
            <View style={tw`flex-row justify-between mt-4 mb-14`}>
              <TouchableOpacity
                style={tw`bg-gray-600 flex-1 py-3 rounded-lg mr-2 items-center`}
                onPress={() => setDamageModalVisible(false)}
              >
                <Text style={tw`text-white font-medium`}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={tw`bg-green-600 flex-1 py-3 rounded-lg items-center`}
                onPress={handleUpdateDamage}
                disabled={updatingDamage}
              >
                {updatingDamage ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={tw`text-white font-medium`}>Update</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      <View style={tw`h-20`} />
    </ScrollView>
  );
}
