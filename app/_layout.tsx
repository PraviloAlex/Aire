import { Stack } from "expo-router";
import Head from "expo-router/head";
import { useEffect } from "react";
import { Platform, StatusBar, StyleSheet, View } from "react-native";
import { SettingsProvider } from "@/features/settings/SettingsContext";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { colors } from "@/theme/tokens";

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS !== "web" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .catch(() => {});
  }, []);

  return (
    <ThemeProvider>
      <SettingsProvider>
        <Head>
          <meta name="theme-color" content="#070A11" />
          <link rel="manifest" href="/manifest.webmanifest" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <meta name="apple-mobile-web-app-title" content="Aire" />
          <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,400&family=Manrope:wght@400;500;700;800&display=swap"
            rel="stylesheet"
          />
        </Head>
        <View style={styles.shell}>
          <View style={styles.appFrame}>
            <StatusBar barStyle="light-content" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: {
                  backgroundColor: colors.background
                }
              }}
            />
          </View>
        </View>
      </SettingsProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#050812",
  },
  appFrame: {
    flex: 1,
    width: "100%",
    maxWidth: 430,
    overflow: "hidden",
    backgroundColor: colors.background,
  },
});
