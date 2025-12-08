// components/AppIcon.js
import React from "react";
import { FontAwesome5 } from "@expo/vector-icons";

export default function AppIcon({ name, size = 24, color = "#000" }) {
  return <FontAwesome5 name={name} size={size} color={color} />;
}
