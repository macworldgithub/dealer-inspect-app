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

  useEffect(() => {
    const fetchInspection = async () => {
      try {
        const token = await getAccessToken();
        const res = await fetch(`${API_BASE_URL}/inspection/vehicle/${vehicleId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(res, "RES")
        if (!res.ok) throw new Error(`API error ${res.status}`);
        const data = await res.json();
        console.log(data, "DATA")
        if (data.items?.length > 0) {
          setInspection(data.items[0]); // take the first inspection for now
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
    return <ActivityIndicator style={tw`flex-1`} size="large" color="#fff" />;

  if (!inspection)
    return (
      <View style={tw`flex-1 justify-center items-center bg-gray-900`}>
        <Text style={tw`text-white text-lg`}>No inspection found</Text>
      </View>
    );

  const vehicle = inspection.vehicleId;
  const inspector = inspection.inspectedBy;

  return (
    <ScrollView style={tw`flex-1 bg-gray-900`} contentContainerStyle={tw`pb-10`}>
      {/* Vehicle Info */}
      <View style={tw`bg-gray-800 mx-4 mt-6 p-6 rounded-2xl shadow-lg`}>
        <Text style={tw`text-2xl font-bold text-white mb-1`}>
          {vehicle.make} {vehicle.model} {vehicle.variant ? `(${vehicle.variant})` : ""}
        </Text>
        <Text style={tw`text-gray-400 mb-2`}>
          Year: {vehicle.yearOfManufacture} | Reg: {vehicle.registrationNumber}
        </Text>
        <Text style={tw`text-gray-400 mb-2`}>
          Chassis: {vehicle.chassisNumber} | Transmission: {vehicle.transmission}
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
        <Text style={tw`text-xl font-semibold text-white mb-3`}>Images & Analysis</Text>
        {inspection.images.map((img) => (
          <View key={img._id} style={tw`mb-6`}>
            <Text style={tw`text-gray-300 mb-2`}>Original Image</Text>
            <Image
              source={{ uri: img.originalImageUrl }}
              style={tw`w-full h-48 rounded-2xl bg-gray-700 mb-2`}
              resizeMode="cover"
            />
            <Text style={tw`text-gray-300 mb-2`}>Analysed Image</Text>
            <Image
              source={{ uri: img.analysedImageUrl }}
              style={tw`w-full h-48 rounded-2xl bg-gray-700 mb-2`}
              resizeMode="cover"
            />

            {/* Damages */}
            {img.damages.length > 0 ? (
              <View style={tw`mt-2`}>
                <Text style={tw`text-white font-semibold mb-2`}>Damages</Text>
                {img.damages.map((d) => (
                  <View
                    key={d._id}
                    style={tw`bg-gray-700 rounded-xl p-4 mb-2`}
                  >
                    <Text style={tw`text-red-400 font-semibold mb-1`}>
                      {d.type.toUpperCase()} ({d.severity})
                    </Text>
                    <Text style={tw`text-gray-300 mb-1`}>{d.description}</Text>
                    <View style={tw`flex-row items-center`}>
                      <DollarSign size={16} color="#9CA3AF" />
                      <Text style={tw`text-gray-300 ml-2`}>
                        ${d.repair_cost_estimate.min} - ${d.repair_cost_estimate.max} {d.repair_cost_estimate.currency}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={tw`text-gray-400 mt-2`}>No damages found</Text>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
