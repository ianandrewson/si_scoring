import { View, ActivityIndicator } from "react-native";
import { Redirect } from "expo-router";
import { useApp } from "@/contexts/AppContext";

export default function Index() {
  const { hasCompletedSetup, loading } = useApp();

  // Show loading spinner while checking setup status
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Redirect based on setup status
  if (!hasCompletedSetup) {
    return <Redirect href="/profile-setup" />;
  }

  return <Redirect href="/(tabs)" />;
}
