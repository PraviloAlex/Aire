import { Redirect, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { buildCustomPractice, isPlayable, type CustomPattern } from "@/features/custom/customPattern";
import { getCustomPatternById, loadCustomDraft } from "@/features/custom/customPatternStorage";
import { BreathingSessionScreen } from "@/features/session/BreathingSessionScreen";
import { colors } from "@/theme/tokens";

type LoadState =
  | { status: "loading" }
  | { status: "missing" }
  | { status: "ready"; pattern: CustomPattern };

export default function CustomSessionRoute() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let active = true;
    const load = async () => {
      const pattern = id ? await getCustomPatternById(id) : await loadCustomDraft();
      if (!active) return;
      setState(pattern && isPlayable(pattern) ? { status: "ready", pattern } : { status: "missing" });
    };
    void load();
    return () => {
      active = false;
    };
  }, [id]);

  if (state.status === "missing") {
    return <Redirect href="/custom" />;
  }

  if (state.status === "loading") {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return <BreathingSessionScreen practice={buildCustomPractice(state.pattern)} />;
}
