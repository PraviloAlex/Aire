import { Tabs } from "expo-router";
import { StyleSheet, View } from "react-native";
import { editorial } from "@/theme/editorial";

// Минималистичный editorial-индикатор вместо крупных иконок:
//  • неактивная вкладка — приглушённая точка;
//  • активная — короткая глиняная чёрточка.
function tabIndicator() {
  function TabBarIndicator({ focused }: { focused: boolean }) {
    return <View style={focused ? styles.activeDash : styles.inactiveDot} />;
  }
  return TabBarIndicator;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: editorial.ink,
        tabBarInactiveTintColor: editorial.inkFaint,
        tabBarStyle: {
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 66,
          paddingTop: 10,
          paddingBottom: 12,
          borderTopWidth: 1,
          borderTopColor: editorial.hairline,
          backgroundColor: editorial.paper,
          elevation: 0,
        },
        tabBarItemStyle: { paddingVertical: 2 },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "700",
          letterSpacing: 0.3,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Сегодня", tabBarIcon: tabIndicator() }}
      />
      <Tabs.Screen
        name="learn"
        options={{ title: "Знания", tabBarIcon: tabIndicator() }}
      />
      <Tabs.Screen
        name="practices"
        options={{ title: "Практики", tabBarIcon: tabIndicator() }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: "Ещё", tabBarIcon: tabIndicator() }}
      />
      <Tabs.Screen
        name="progress"
        options={{ href: null }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  inactiveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: editorial.inkFaint,
  },
  activeDash: {
    width: 16,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: editorial.clay,
  },
});
