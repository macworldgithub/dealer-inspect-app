// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   Image,
//   ActivityIndicator,
//   TouchableOpacity,
// } from "react-native";
// import tw from "tailwind-react-native-classnames";
// import { getAccessToken } from "../util/storage";
// import { API_BASE_URL } from "../util/config";
// import { User, Camera, AlertCircle, DollarSign } from "lucide-react-native";

// export default function InspectionDetails({ route, navigation }) {
//   const { vehicleId } = route.params;
//   const [inspection, setInspection] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchInspection = async () => {
//       try {
//         const token = await getAccessToken();
//         const res = await fetch(
//           `${API_BASE_URL}/inspection/vehicle/${vehicleId}`,
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           },
//         );
//         console.log(res, "RES");
//         if (!res.ok) throw new Error(`API error ${res.status}`);
//         const data = await res.json();
//         console.log(data, "DATA");
//         if (data.items?.length > 0) {
//           setInspection(data.items[0]);
//         }
//       } catch (err) {
//         console.error("Failed to fetch inspection:", err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchInspection();
//   }, [vehicleId]);

//   if (loading)
//     return <ActivityIndicator style={tw`flex-1`} size="large" color="#fff" />;

//   if (!inspection)
//     return (
//       <View style={tw`flex-1 justify-center items-center bg-gray-900`}>
//         <Text style={tw`text-white text-lg`}>No inspection found</Text>
//       </View>
//     );

//   const vehicle = inspection.vehicleId;
//   const inspector = inspection.inspectedBy;

//   return (
//     <ScrollView
//       style={tw`flex-1 bg-gray-900`}
//       contentContainerStyle={tw`pb-10`}
//     >
//       {/* Vehicle Info */}
//       <View style={tw`bg-gray-800 mx-4 mt-6 p-6 rounded-2xl shadow-lg`}>
//         <Text style={tw`text-2xl font-bold text-white mb-1`}>
//           {vehicle.make} {vehicle.model}{" "}
//           {vehicle.variant ? `(${vehicle.variant})` : ""}
//         </Text>
//         <Text style={tw`text-gray-400 mb-2`}>
//           Year: {vehicle.yearOfManufacture} | Reg: {vehicle.registrationNumber}
//         </Text>
//         <Text style={tw`text-gray-400 mb-2`}>
//           Chassis: {vehicle.chassisNumber} | Transmission:{" "}
//           {vehicle.transmission}
//         </Text>
//       </View>

//       {/* Inspector Info */}
//       <View style={tw`bg-gray-800 mx-4 mt-6 p-6 rounded-2xl shadow-lg`}>
//         <Text style={tw`text-xl font-semibold text-white mb-3`}>Inspector</Text>
//         <View style={tw`flex-row items-center mb-1`}>
//           <User size={20} color="#9CA3AF" />
//           <Text style={tw`text-gray-300 ml-2`}>{inspector.name}</Text>
//         </View>
//         <View style={tw`flex-row items-center mb-1`}>
//           <Camera size={20} color="#9CA3AF" />
//           <Text style={tw`text-gray-300 ml-2`}>{inspector.role}</Text>
//         </View>
//         <View style={tw`flex-row items-center`}>
//           <AlertCircle size={20} color="#9CA3AF" />
//           <Text style={tw`text-gray-300 ml-2`}>{inspector.email}</Text>
//         </View>
//       </View>

//       {/* Inspection Status */}
//       <View style={tw`bg-gray-800 mx-4 mt-6 p-6 rounded-2xl shadow-lg`}>
//         <Text style={tw`text-xl font-semibold text-white mb-3`}>Status</Text>
//         <Text style={tw`text-gray-300`}>{inspection.status}</Text>
//       </View>

//       {/* Inspection Images */}
//       <View style={tw`bg-gray-800 mx-4 mt-6 p-6 rounded-2xl shadow-lg`}>
//         <Text style={tw`text-xl font-semibold text-white mb-3`}>
//           Images & Analysis
//         </Text>
//         {inspection.images.map((img) => (
//           <View key={img._id} style={tw`mb-6`}>
//             <Text style={tw`text-gray-300 mb-2`}>Original Image</Text>
//             <Image
//               source={{ uri: img.originalImageUrl }}
//               style={tw`w-full h-48 rounded-2xl bg-gray-700 mb-2`}
//               resizeMode="cover"
//             />
//             <Text style={tw`text-gray-300 mb-2`}>Analysed Image</Text>
//             <Image
//               source={{ uri: img.analysedImageUrl }}
//               style={tw`w-full h-48 rounded-2xl bg-gray-700 mb-2`}
//               resizeMode="cover"
//             />

//             {/* Damages */}
//             {img.damages.length > 0 ? (
//               <View style={tw`mt-2`}>
//                 <Text style={tw`text-white font-semibold mb-2`}>Damages</Text>
//                 {img.damages.map((d) => (
//                   <View key={d._id} style={tw`bg-gray-700 rounded-xl p-4 mb-2`}>
//                     <Text style={tw`text-red-400 font-semibold mb-1`}>
//                       {d.type.toUpperCase()} ({d.severity})
//                     </Text>
//                     <Text style={tw`text-gray-300 mb-1`}>{d.description}</Text>
//                     <View style={tw`flex-row items-center`}>
//                       <DollarSign size={16} color="#9CA3AF" />
//                       <Text style={tw`text-gray-300 ml-2`}>
//                         ${d.repair_cost_estimate.min} - $
//                         {d.repair_cost_estimate.max}{" "}
//                         {d.repair_cost_estimate.currency}
//                       </Text>
//                     </View>
//                   </View>
//                 ))}
//               </View>
//             ) : (
//               <Text style={tw`text-gray-400 mt-2`}>No damages found</Text>
//             )}
//           </View>
//         ))}
//       </View>
//     </ScrollView>
//   );
// }
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import tw from "tailwind-react-native-classnames";
import { getAccessToken } from "../util/storage";
import { API_BASE_URL } from "../util/config";
import { User, Camera, AlertCircle, DollarSign } from "lucide-react-native";

export default function InspectionDetails({ route, navigation }) {
  const { vehicleId } = route.params;
  const [inspection, setInspection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
          setInspection(data.items[0]);
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
  const currentPage = currentImageIndex + 1;

  const goToImagePage = (targetIndex) => {
    if (targetIndex < 0 || targetIndex >= totalImages) return;
    setCurrentImageIndex(targetIndex);
  };

  const renderPagination = () => {
    if (totalImages <= 1) return null;

    return (
      <View style={tw`mx-6 mb-8 pb-4 border-t border-gray-800 pt-2`}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={tw`py-2`}
        >
          <View style={tw`flex-row items-center space-x-2.5`}>
            {/* Previous */}
            {currentPage > 1 && (
              <TouchableOpacity
                onPress={() => goToImagePage(currentImageIndex - 1)}
                style={tw`w-10 h-10 items-center justify-center rounded-full bg-gray-800 border border-gray-700`}
              >
                <Text style={tw`text-gray-300 text-lg font-bold`}>‹</Text>
              </TouchableOpacity>
            )}

            {/* Page numbers with ellipsis logic */}
            {Array.from({ length: totalImages }).map((_, i) => {
              const pageNum = i + 1;
              const isActive = pageNum === currentPage;
              const isNearCurrent =
                Math.abs(pageNum - currentPage) <= 2 ||
                pageNum === 1 ||
                pageNum === totalImages;

              if (!isNearCurrent && pageNum !== 1 && pageNum !== totalImages) {
                if (
                  pageNum === currentPage - 3 ||
                  pageNum === currentPage + 3
                ) {
                  return (
                    <Text
                      key={pageNum}
                      style={tw`text-gray-500 w-10 text-center text-base`}
                    >
                      ...
                    </Text>
                  );
                }
                return null;
              }

              return (
                <TouchableOpacity
                  key={pageNum}
                  onPress={() => goToImagePage(i)}
                  style={tw.style(
                    `w-10 h-10 items-center justify-center rounded-lg border`,
                    isActive
                      ? `bg-green-600 border-green-500 shadow-md`
                      : `bg-gray-800 border-gray-700`,
                  )}
                >
                  <Text
                    style={tw.style(
                      `text-base font-medium`,
                      isActive ? `text-white font-bold` : `text-gray-300`,
                    )}
                  >
                    {pageNum}
                  </Text>
                </TouchableOpacity>
              );
            })}

            {/* Next */}
            {currentPage < totalImages && (
              <TouchableOpacity
                onPress={() => goToImagePage(currentImageIndex + 1)}
                style={tw`w-10 h-10 items-center justify-center rounded-full bg-gray-800 border border-gray-700`}
              >
                <Text style={tw`text-gray-300 text-lg font-bold`}>›</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>

        <Text style={tw`text-center text-gray-500 text-xs mt-3`}>
          Image {currentPage} of {totalImages}
        </Text>
      </View>
    );
  };

  const currentImg = images[currentImageIndex];

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

      {/* Inspection Images - Paginated */}
      <View style={tw`bg-gray-800 mx-4 mt-6 p-6 rounded-2xl shadow-lg`}>
        <Text style={tw`text-xl font-semibold text-white mb-4`}>
          Images & Analysis
        </Text>

        {images.length === 0 ? (
          <Text style={tw`text-gray-400 text-center py-6`}>
            No images in this inspection
          </Text>
        ) : (
          <>
            {/* Current Image Content */}
            <View>
              <Text style={tw`text-gray-300 mb-2 font-medium`}>
                {currentImg.stepName || `Image ${currentPage}`}
              </Text>

              <Text style={tw`text-gray-400 mb-1`}>Original Image</Text>
              <Image
                source={{ uri: currentImg.originalImageUrl }}
                style={tw`w-full h-56 rounded-2xl bg-gray-700 mb-4`}
                resizeMode="cover"
              />

              <Text style={tw`text-gray-400 mb-1`}>Analysed Image</Text>
              <Image
                source={{ uri: currentImg.analysedImageUrl }}
                style={tw`w-full h-56 rounded-2xl bg-gray-700 mb-4`}
                resizeMode="cover"
              />

              {/* Damages */}
              {currentImg.damages?.length > 0 ? (
                <View style={tw`mt-3`}>
                  <Text style={tw`text-white font-semibold mb-2`}>Damages</Text>
                  {currentImg.damages.map((d) => (
                    <View
                      key={d._id || `${currentImageIndex}-${d.type}`}
                      style={tw`bg-gray-700 rounded-xl p-4 mb-3`}
                    >
                      <Text style={tw`text-red-400 font-semibold mb-1`}>
                        {d.type.toUpperCase()} ({d.severity || "N/A"})
                      </Text>
                      <Text style={tw`text-gray-300 mb-1`}>
                        {d.description}
                      </Text>
                      <View style={tw`flex-row items-center`}>
                        <DollarSign size={16} color="#9CA3AF" />
                        <Text style={tw`text-gray-300 ml-2`}>
                          ${d.repair_cost_estimate?.min || "?"} - $
                          {d.repair_cost_estimate?.max || "?"}{" "}
                          {d.repair_cost_estimate?.currency || ""}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={tw`text-gray-400 mt-3`}>No damages found</Text>
              )}
            </View>

            {renderPagination()}
          </>
        )}
      </View>

      <View style={tw`h-10`} />
    </ScrollView>
  );
}
