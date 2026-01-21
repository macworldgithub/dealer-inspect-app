import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import tw from "tailwind-react-native-classnames";
import { Search } from "lucide-react-native";
import { API_BASE_URL } from "../util/config";
import { getAccessToken } from "../util/storage";
import { ArrowLeft } from "lucide-react-native";

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

      setVehicles(data.items);
      setPage(Number(data.meta.page));
      setTotalPages(Number(data.meta.totalPages));
    } catch (e) {
      console.error("Failed to fetch vehicles:", e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles(1, search);
  }, [search]);

  const goToPage = (targetPage) => {
    if (
      targetPage < 1 ||
      targetPage > totalPages ||
      targetPage === page ||
      loading
    ) {
      return;
    }
    fetchVehicles(targetPage, search);
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
            {item.make || "Unknown"} {item.model || ""}
          </Text>
          <Text style={tw`text-gray-500 text-sm`}>
            {item.variant || "—"} • {item.yearOfManufacture || "—"}
          </Text>
          <Text style={tw`text-gray-600 text-sm mt-1`}>
            Reg: {item.registrationNumber || "—"}
          </Text>
          <Text style={tw`text-gray-600 text-sm`}>
            Chassis: {item.chassisNumber || "—"}
          </Text>
          <View style={tw`mt-2 self-start px-3 py-1 rounded-full bg-gray-100`}>
            <Text style={tw`text-xs text-gray-700`}>
              {item.transmission || "Unknown"}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <View style={tw`mx-6 mb-8 pb-4 border-t border-gray-800 pt-2`}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={tw`py-2`}
        >
          <View style={tw`flex-row items-center space-x-2.5`}>
            {page > 1 && (
              <TouchableOpacity
                onPress={() => goToPage(page - 1)}
                disabled={loading}
                style={tw`w-10 h-10 items-center justify-center rounded-full bg-gray-800 border border-gray-700`}
              >
                <Text style={tw`text-gray-300 text-lg font-bold`}>‹</Text>
              </TouchableOpacity>
            )}

            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNum = i + 1;
              const isActive = pageNum === page;
              const isNearCurrent =
                Math.abs(pageNum - page) <= 2 ||
                pageNum === 1 ||
                pageNum === totalPages;

              if (!isNearCurrent && pageNum !== 1 && pageNum !== totalPages) {
                if (pageNum === page - 3 || pageNum === page + 3) {
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
                  onPress={() => goToPage(pageNum)}
                  disabled={loading || isActive}
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

            {/* Next button */}
            {page < totalPages && (
              <TouchableOpacity
                onPress={() => goToPage(page + 1)}
                disabled={loading}
                style={tw`w-10 h-10 items-center justify-center rounded-full bg-gray-800 border border-gray-700`}
              >
                <Text style={tw`text-gray-300 text-lg font-bold`}>›</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
        <Text style={tw`text-center text-gray-500 text-xs mt-3`}>
          Page {page} of {totalPages}
        </Text>
      </View>
    );
  };

  return (
    <View style={tw`flex-1 bg-black px-6 pt-14`}>
      <View style={tw`flex-row items-center mb-6`}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={tw`mr-4 p-2 rounded-full bg-gray-900 border border-gray-800`}
        >
          <ArrowLeft size={22} color="#fff" />
        </TouchableOpacity>

        <Text style={tw`text-3xl font-bold text-white`}>Vehicles</Text>
      </View>

      {/* Search */}
      <View
        style={tw`flex-row items-center bg-gray-900 rounded-2xl px-4 mb-6 border border-gray-800`}
      >
        <Search size={20} color="#9CA3AF" />
        <TextInput
          placeholder="Search by make, model, reg, chassis"
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={setSearch}
          style={tw`flex-1 text-white ml-3 py-3.5 text-base text-sm`}
        />
      </View>

      {loading && vehicles.length === 0 ? (
        <View style={tw`flex-1 justify-center items-center`}>
          <ActivityIndicator size="large" color="#22C55E" />
          <Text style={tw`text-gray-400 mt-4`}>Loading vehicles...</Text>
        </View>
      ) : (
        <FlatList
          data={vehicles}
          keyExtractor={(item) => item._id}
          renderItem={renderVehicle}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={tw`text-gray-400 text-center mt-20 text-lg`}>
              No vehicles found
            </Text>
          }
        />
      )}

      {renderPagination()}
    </View>
  );
}
