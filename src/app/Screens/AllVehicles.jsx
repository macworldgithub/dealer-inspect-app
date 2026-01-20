import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import tw from "tailwind-react-native-classnames";
import { Search } from "lucide-react-native";
import { API_BASE_URL } from "../util/config";
import { getAccessToken } from "../util/storage";

export default function AllVehicles({ navigation }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const fetchVehicles = useCallback(async (pageNumber = 1, searchText = "") => {
    try {
      setLoading(true);
      const token = await getAccessToken();
      const params = new URLSearchParams({
        page: String(pageNumber),
        limit: "10",
      });

      if (searchText.trim()) {
        params.append("search", searchText.trim());
      }

      const res = await fetch(`${API_BASE_URL}/vehicle?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`API error ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      console.log("API DATA:", data);

      if (!data?.items || !data?.meta) {
        throw new Error("Invalid API response structure");
      }

      setVehicles((prev) =>
        pageNumber === 1 ? data.items : [...prev, ...data.items],
      );
      setPage(data.meta.page);
      setTotalPages(data.meta.totalPages);
    } catch (e) {
      console.error("Failed to fetch vehicles:", e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles(1, search);
  }, [search]);

  const loadMore = () => {
    if (!loading && page < totalPages) {
      fetchVehicles(page + 1, search);
    }
  };

  const renderVehicle = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("VehicleDetails", { vehicleId: item._id })
      }
      style={tw`bg-white rounded-3xl p-4 mb-4 shadow`}
    >
      <View style={tw`flex-row`}>
        <Image
          source={
            item.carImageUrl
              ? { uri: item.carImageUrl }
              : require("../../../assets/car-placeholder.png")
          }
          style={tw`w-24 h-24 rounded-2xl mr-4 bg-gray-200`}
        />

        <View style={tw`flex-1`}>
          <Text style={tw`text-lg font-bold text-black`}>
            {item.make} {item.model}
          </Text>

          <Text style={tw`text-gray-500 text-sm`}>
            {item.variant} • {item.yearOfManufacture}
          </Text>

          <Text style={tw`text-gray-600 text-sm mt-1`}>
            Reg: {item.registrationNumber}
          </Text>

          <Text style={tw`text-gray-600 text-sm`}>
            Chassis: {item.chassisNumber}
          </Text>

          <View style={tw`mt-2 self-start px-3 py-1 rounded-full bg-gray-100`}>
            <Text style={tw`text-xs text-gray-700`}>{item.transmission}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={tw`flex-1 bg-black px-6 pt-14`}>
      <Text style={tw`text-3xl font-bold text-white mb-4`}>Vehicles</Text>

      {/* Search */}
      <View style={tw`flex-row items-center bg-gray-900 rounded-2xl px-4 mb-6`}>
        <Search size={18} color="#9CA3AF" />
        <TextInput
          placeholder="Search by make, model, reg, chassis"
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={setSearch}
          style={tw`flex-1 text-white ml-3 py-3`}
        />
      </View>

      <FlatList
        data={vehicles}
        keyExtractor={(item) => item._id}
        renderItem={renderVehicle}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          loading ? <ActivityIndicator style={tw`my-6`} /> : null
        }
      />
    </View>
  );
}
