// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   Image,
//   TouchableOpacity,
//   ScrollView,
//   ActivityIndicator,
// } from "react-native";
// import * as ImagePicker from "expo-image-picker";
// import * as ImageManipulator from "expo-image-manipulator";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import tw from "tailwind-react-native-classnames";
// import { Plus, X, Scan } from "lucide-react-native";
// import { API_BASE_URL } from "../util/config";

// const MAX_IMAGES = 20;

// export default function InspectionScreen({ route }) {
//   const { vehicleId, image } = route.params;
//   const [images, setImages] = useState([]);
//   const [inspectionId, setInspectionId] = useState(null);

//   const pickImage = async () => {
//     if (images.length >= MAX_IMAGES) {
//       alert(`Maximum ${MAX_IMAGES} images allowed`);
//       return;
//     }

//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       quality: 0.8,
//     });

//     if (!result.canceled) {
//       const manipulated = await ImageManipulator.manipulateAsync(
//         result.assets[0].uri,
//         [{ resize: { width: 1400 } }],
//         {
//           compress: 0.8,
//           format: ImageManipulator.SaveFormat.JPEG,
//         }
//       );

//       uploadOriginalImage(manipulated.uri);
//     }
//   };

//   const getPresignedOriginalUrl = async () => {
//     const res = await fetch(`${API_BASE_URL}/inspection/presigned/original`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${await AsyncStorage.getItem("access_token")}`,
//       },
//       body: JSON.stringify({ fileType: "image/jpeg" }),
//     });
//     console.log("Presign response:", res);
//     if (!res.ok) throw new Error("Presign failed");
//     return res.json();
//   };

//   const getSignedGetUrl = async (key) => {
//     const res = await fetch(`${API_BASE_URL}/aws/signed-url`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${await AsyncStorage.getItem("access_token")}`,
//       },
//       body: JSON.stringify({ key }),
//     });

//     const data = await res.json();
//     console.log("Signed Image", data);
//     return data.url;
//   };

//   const uploadOriginalImage = async (uri) => {
//     try {
//       const { url, key } = await getPresignedOriginalUrl();
//       const blob = await (await fetch(uri)).blob();

//       await fetch(url, {
//         method: "PUT",
//         headers: { "Content-Type": "image/jpeg" },
//         body: blob,
//       });

//       const signedUrl = await getSignedGetUrl(key);

//       setImages((prev) => [
//         ...prev,
//         {
//           localUri: uri,
//           key,
//           signedUrl,
//           analysing: false,
//         },
//       ]);
//     } catch (e) {
//       alert("Upload failed");
//     }
//   };

//   const analyzeImage = async (index) => {
//     try {
//       setImages((prev) =>
//         prev.map((img, i) => (i === index ? { ...img, analysing: true } : img))
//       );

//       const image = images[index];

//       // 1️⃣ AI ANALYZE
//       const res = await fetch(
//         "https://www.dealer-microservice.omnisuiteai.com/analyze",
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ image_url: image.signedUrl }),
//         }
//       );

//       if (!res.ok) throw new Error("Analysis failed");

//       const data = await res.json();
//       console.log("Analysis data:", data);

//       const analysedSignedUrl = await getSignedGetUrl(data.analysedImageKey);

//       // 2️⃣ UPDATE IMAGE STATE
//       setImages((prev) =>
//         prev.map((img, i) =>
//           i === index
//             ? {
//                 ...img,
//                 analysing: false,
//                 analysedKey: data.analysedImageKey,
//                 analysedUrl: analysedSignedUrl,
//                 damages: data.damages,
//               }
//             : img
//         )
//       );

//       // 3️⃣ AUTO-SAVE INSPECTION
//       await upsertInspection({
//         analysedImageKey: data.analysedImageKey,
//         damages: data.damages,
//       });
//     } catch (e) {
//       alert("Analysis failed");
//       setImages((prev) =>
//         prev.map((img, i) => (i === index ? { ...img, analysing: false } : img))
//       );
//     }
//   };

//   const removeImage = (index) => {
//     setImages((prev) => prev.filter((_, i) => i !== index));
//   };

//   const createInspection = async () => {
//     try {
//       const payload = {
//         vehicleId,
//         status: "DRAFT",
//         images: images
//           .filter((img) => img.analysedKey)
//           .map((img) => ({
//             originalImageKey: img.key,
//             analysedImageKey: img.analysedKey,
//             aiRaw: {
//               damages: img.damages,
//             },
//             damages: img.damages,
//           })),
//       };

//       console.log("Inspection payload:", payload);

//       const res = await fetch(`${API_BASE_URL}/inspection`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${await AsyncStorage.getItem("access_token")}`,
//         },
//         body: JSON.stringify(payload),
//       });
//       console.log("Inspection", res);

//       if (!res.ok) {
//         const err = await res.json();
//         throw new Error(err.message || "Inspection creation failed");
//       }

//       const inspection = await res.json();
//       console.log("Inspection created:", inspection);
//     } catch (err) {
//       console.error(err);
//       alert("Failed to create inspection");
//     }
//   };

//   return (
//     <ScrollView style={tw`flex-1 bg-black`}>
//       {/* Heading */}
//       <View style={tw`px-6 pt-12 pb-4`}>
//         <Text style={tw`text-white text-2xl font-bold`}>Inspection Images</Text>
//         <Text style={tw`text-gray-400 mt-1`}>
//           Upload, analyze and review damages
//         </Text>
//       </View>

//       {/* Image Upload Button */}
//       {images.length < MAX_IMAGES && (
//         <TouchableOpacity
//           onPress={pickImage}
//           style={tw`mx-6 my-4 h-28 rounded-xl border-2 border-dashed border-gray-400 justify-center items-center`}
//         >
//           <Plus size={32} color="#9CA3AF" />
//           <Text style={tw`text-gray-400 mt-1`}>Upload Image</Text>
//         </TouchableOpacity>
//       )}

//       {/* Uploaded Images */}
//       {images.map((img, index) => (
//         <View
//           key={index}
//           style={tw`mx-6 my-4 bg-white rounded-2xl p-4 shadow-md`}
//         >
//           {/* Images Row */}
//           <View style={tw`flex-row`}>
//             {/* Original Image */}
//             <View style={tw`flex-1 mr-2 items-center`}>
//               <Image
//                 source={{ uri: img.localUri }}
//                 style={tw`w-full h-40 rounded-xl`}
//                 resizeMode="cover"
//               />
//               <TouchableOpacity
//                 onPress={() => removeImage(index)}
//                 style={tw`mt-2 bg-red-500 py-1 px-3 rounded-full`}
//               >
//                 <Text style={tw`text-white font-semibold text-sm`}>Delete</Text>
//               </TouchableOpacity>
//             </View>

//             {/* Analyzed Image */}
//             <View style={tw`flex-1 ml-2 items-center`}>
//               {img.analysedUrl ? (
//                 <Image
//                   source={{ uri: img.analysedUrl }}
//                   style={tw`w-full h-40 rounded-xl`}
//                   resizeMode="cover"
//                 />
//               ) : (
//                 <TouchableOpacity
//                   onPress={() => analyzeImage(index)}
//                   disabled={img.analysing}
//                   style={tw`mt-16 bg-black rounded-full py-2 px-4 flex-row items-center`}
//                 >
//                   {img.analysing ? (
//                     <ActivityIndicator color="#fff" size="small" />
//                   ) : (
//                     <>
//                       <Scan size={16} color="white" />
//                       <Text style={tw`text-white text-sm ml-2`}>Analyze</Text>
//                     </>
//                   )}
//                 </TouchableOpacity>
//               )}
//             </View>
//           </View>

//           {img.analysedUrl && img.damages?.length > 0 && (
//             <View style={tw`mt-4 bg-gray-100 rounded-xl p-3`}>
//               <Text style={tw`text-gray-800 font-bold text-sm mb-2`}>
//                 Detected Damages
//               </Text>

//               {img.damages.map((dmg, i) => (
//                 <View
//                   key={i}
//                   style={tw`mb-2 bg-white rounded-lg p-2 border border-gray-200`}
//                 >
//                   <Text style={tw`text-black font-semibold text-sm`}>
//                     {dmg.type || "Unknown Damage"}
//                   </Text>

//                   {dmg.description && (
//                     <Text style={tw`text-gray-600 text-xs mt-1`}>
//                       {dmg.description}
//                     </Text>
//                   )}

//                   <View style={tw`flex-row justify-between mt-1`}>
//                     <Text style={tw`text-xs text-gray-500`}>
//                       Severity: {dmg.severity ?? "N/A"}
//                     </Text>
//                     <Text style={tw`text-xs text-gray-500`}>
//                       Confidence: {dmg.confidence ?? "N/A"}
//                     </Text>
//                   </View>

//                   {dmg.repair_cost_estimate && (
//                     <Text style={tw`text-xs text-red-600 mt-1`}>
//                       Est. Cost: {dmg.repair_cost_estimate.currency}{" "}
//                       {dmg.repair_cost_estimate.min} -{" "}
//                       {dmg.repair_cost_estimate.max}
//                     </Text>
//                   )}
//                 </View>
//               ))}
//             </View>
//           )}
//         </View>
//       ))}

//       {/* Create Inspection Button */}
//       {images.some((img) => img.analysedKey) && (
//         <TouchableOpacity
//           onPress={createInspection}
//           style={tw`mx-6 my-6 bg-black py-4 rounded-xl`}
//         >
//           <Text style={tw`text-white text-center font-semibold text-lg`}>
//             Create Inspection
//           </Text>
//         </TouchableOpacity>
//       )}

//       <View style={tw`h-24`} />
//     </ScrollView>
//   );
// }

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
  const [images, setImages] = useState(Array(TOTAL_STEPS).fill(null));

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

  const img = images[currentStep];

  const renderPagination = () => {
    const pages = [];
    const total = TOTAL_STEPS;

    const addPage = (page) => {
      pages.push(
        <TouchableOpacity
          key={page}
          onPress={() => setCurrentStep(page)}
          style={tw`px-3 py-1 rounded-md ${
            currentStep === page ? "bg-black" : "bg-gray-200"
          }`}
        >
          <Text
            style={tw`text-sm ${
              currentStep === page ? "text-white" : "text-black"
            }`}
          >
            {page + 1}
          </Text>
        </TouchableOpacity>
      );
    };

    pages.push(
      <TouchableOpacity
        key="prev"
        disabled={currentStep === 0}
        onPress={() => setCurrentStep((p) => Math.max(p - 1, 0))}
      >
        <Text style={tw`text-xl px-2`}>&lt;</Text>
      </TouchableOpacity>
    );

    for (let i = 0; i < total; i++) {
      if (
        i === 0 ||
        i === total - 1 ||
        (i >= currentStep - 2 && i <= currentStep + 2)
      ) {
        addPage(i);
      } else if (
        (i === currentStep - 3 && i > 1) ||
        (i === currentStep + 3 && i < total - 2)
      ) {
        pages.push(
          <Text key={`dots-${i}`} style={tw`px-2`}>
            ...
          </Text>
        );
      }
    }

    // >
    pages.push(
      <TouchableOpacity
        key="next"
        disabled={currentStep === total - 1}
        onPress={() => setCurrentStep((p) => Math.min(p + 1, total - 1))}
      >
        <Text style={tw`text-xl px-2`}>&gt;</Text>
      </TouchableOpacity>
    );

    return pages;
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
      {!img && (
        <TouchableOpacity
          onPress={pickImage}
          style={tw`mx-6 my-6 h-28 rounded-xl border-2 border-dashed border-gray-400 justify-center items-center`}
        >
          <Plus size={28} color="#9CA3AF" />
          <Text style={tw`text-gray-400 mt-1`}>
            Upload {INSPECTION_STEPS[currentStep]} Image
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
                  source={{ uri: img.localUri }}
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

      {currentStep === TOTAL_STEPS - 1 && (
        <TouchableOpacity
          onPress={createInspection}
          style={tw`mx-6 my-6 bg-green-600 py-4 rounded-xl`}
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
