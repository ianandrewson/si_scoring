import { Stack } from "expo-router";
import { AppProvider } from "@/contexts/AppContext";
import { useColorScheme } from "react-native";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AppProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: colorScheme === "dark" ? "#000" : "#fff",
          },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="profile-setup" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="add-game"
          options={{
            presentation: "modal",
            headerShown: true,
            title: "Add Game",
          }}
        />
        <Stack.Screen
          name="game/[id]"
          options={{
            headerShown: true,
            title: "Game Details",
          }}
        />
      </Stack>
    </AppProvider>
  );
}
