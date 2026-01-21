import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import tw from "tailwind-react-native-classnames";
import { getAccessToken } from "../util/storage";
import { API_BASE_URL } from "../util/config";
import {
  Car,
  Calendar,
  Clipboard,
  Settings,
  FileText,
  Trash2,
  Edit3,
} from "lucide-react-native";
import { ArrowLeft } from "lucide-react-native";

export default function VehicleDetails({ route, navigation }) {
  const { vehicleId } = route.params;
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const token = await getAccessToken();
        const res = await fetch(`${API_BASE_URL}/vehicle/${vehicleId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error(`API error ${res.status}`);

        const data = await res.json();
        setVehicle(data);
      } catch (err) {
        console.error("Failed to fetch vehicle:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [vehicleId]);

  const handleDelete = () => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this vehicle?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setActionLoading(true);
              const token = await getAccessToken();
              const res = await fetch(`${API_BASE_URL}/vehicle/${vehicleId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
              });

              if (!res.ok) {
                const err = await res.text();
                throw new Error(err || "Delete failed");
              }

              Alert.alert("Success", "Vehicle deleted successfully");
              navigation.replace("AllVehicles");
            } catch (err) {
              console.error(err);
              Alert.alert("Error", err.message);
            } finally {
              setActionLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleUpdate = () => {
    // Navigate to CarDetailsScreen for editing, pass vehicle data as params
    navigation.navigate("CarDetails", { vehicle, isUpdate: true });
  };

  if (loading)
    return <ActivityIndicator style={tw`flex-1`} size="large" color="#fff" />;

  if (!vehicle)
    return (
      <View style={tw`flex-1 justify-center items-center bg-black`}>
        <Text style={tw`text-white text-lg`}>Vehicle not found</Text>
      </View>
    );

  return (
    <ScrollView
      style={tw`flex-1 bg-gray-900 pt-14 px-6`}
      contentContainerStyle={tw`pb-10`}
    >
      <View style={tw`flex-row items-center mb-6`}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={tw`mr-4 p-2 rounded-full bg-gray-900 border border-gray-800`}
        >
          <ArrowLeft size={22} color="#fff" />
        </TouchableOpacity>

        <Text style={tw`text-xl font-bold text-white`}>Vehicles Detail</Text>
      </View>

      {/* Vehicle Image */}
      <Image
        source={
          vehicle.carImageUrl
            ? { uri: vehicle.carImageUrl }
            : require("../../../assets/car-placeholder.png")
        }
        style={tw`w-full h-56 bg-gray-800`}
        resizeMode="cover"
      />

      {/* Vehicle Info */}
      <View style={tw`bg-gray-800 mx-4 mt-2 p-6 rounded-2xl shadow-lg`}>
        <Text style={tw`text-3xl font-bold text-white mb-1`}>
          {vehicle.make} {vehicle.model}
        </Text>
        {vehicle.variant && (
          <Text style={tw`text-gray-400 mb-4 text-lg`}>{vehicle.variant}</Text>
        )}

        <View style={tw`flex-row items-center mb-2`}>
          <Calendar size={20} color="#9CA3AF" />
          <Text style={tw`text-gray-300 ml-2`}>
            Year: {vehicle.yearOfManufacture}
          </Text>
        </View>

        <View style={tw`flex-row items-center mb-2`}>
          <Clipboard size={20} color="#9CA3AF" />
          <Text style={tw`text-gray-300 ml-2`}>
            Reg: {vehicle.registrationNumber}
          </Text>
        </View>

        <View style={tw`flex-row items-center mb-2`}>
          <Car size={20} color="#9CA3AF" />
          <Text style={tw`text-gray-300 ml-2`}>
            Chassis: {vehicle.chassisNumber}
          </Text>
        </View>

        <View style={tw`flex-row items-center mb-2`}>
          <Settings size={20} color="#9CA3AF" />
          <Text style={tw`text-gray-300 ml-2`}>
            Transmission: {vehicle.transmission}
          </Text>
        </View>
      </View>

      {/* Inspections */}
      <View style={tw`bg-gray-800 mx-4 mt-2 p-6 rounded-2xl shadow-lg`}>
        <Text style={tw`text-xl font-semibold text-white mb-3`}>
          Inspections
        </Text>
        {vehicle.inspectionIds && vehicle.inspectionIds.length > 0 ? (
          <TouchableOpacity
            style={tw`bg-green-500 py-3 px-4 rounded-full items-center`}
            onPress={() =>
              navigation.navigate("InspectionDetails", {
                vehicleId: vehicle._id,
              })
            }
          >
            <View style={tw`flex-row items-center`}>
              <FileText size={20} color="#fff" />
              <Text style={tw`text-white text-lg ml-2`}>Inspection Found</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <Text style={tw`text-gray-300`}>No inspections yet</Text>
        )}
      </View>

      {/* Action Buttons */}
      <View style={tw`flex-row justify-between mx-4 mt-6`}>
        <TouchableOpacity
          onPress={handleUpdate}
          style={tw`flex-1 bg-black py-3 rounded-2xl mr-2 items-center`}
          disabled={actionLoading}
        >
          <View style={tw`flex-row items-center justify-center`}>
            <Edit3 size={18} color="#fff" />
            <Text style={tw`text-white text-lg ml-2`}>Update</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleDelete}
          style={tw`flex-1 bg-black py-3 rounded-2xl ml-2 items-center`}
          disabled={actionLoading}
        >
          <View style={tw`flex-row items-center justify-center`}>
            <Trash2 size={18} color="#fff" />
            <Text style={tw`text-white text-lg ml-2`}>Delete</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
