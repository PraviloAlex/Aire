import { Link, type Href } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Easing, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { getPracticeById } from "@/data/breathingPractices";
import { homePanicContent } from "@/features/home/homeStateContent";
import { editorial, editorialFont } from "@/theme/editorial";

const USE_NATIVE_DRIVER = Platform.OS !== "web";

// Мягкая тень-приподнятость — только web (натив не понимает строковый boxShadow).
const webShadow =
  Platform.OS === "web"
    ? ({ boxShadow: "0 14px 34px rgba(33,29,24,0.28)" } as object)
    : undefined;

function hrefForPanic(): Href {
  const practice = getPracticeById(homePanicContent.practiceId);
  return (practice ? `/session/${practice.id}` : "/practices") as Href;
}

// Тёмная чернильная плашка экстренного успокоения — всегда внизу, над таб-баром.
export function SosBar() {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: 2400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: USE_NATIVE_DRIVER,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const haloScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 2.6] });
  const haloOpacity = pulse.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0.5, 0, 0] });

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <Link href={hrefForPanic()} asChild>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${homePanicContent.title}. ${homePanicContent.subtitle}`}
        >
          {({ pressed }) => (
            <View style={[styles.bar, webShadow, pressed && styles.pressed]}>
              <View style={styles.dotWrap}>
                <Animated.View
                  style={[styles.halo, { opacity: haloOpacity, transform: [{ scale: haloScale }] }]}
                />
                <View style={styles.dot} />
              </View>
              <View style={styles.copy}>
                <Text style={styles.title}>Накрыло прямо сейчас</Text>
                <Text style={styles.sub}>{homePanicContent.subtitle}</Text>
              </View>
              <Text style={styles.arrow}>→</Text>
            </View>
          )}
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 76,
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: editorial.sosBg,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  pressed: {
    opacity: 0.88,
  },
  dotWrap: {
    width: 12,
    height: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  halo: {
    position: "absolute",
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: editorial.sosPulse,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: editorial.sosPulse,
  },
  copy: {
    flex: 1,
  },
  title: {
    fontFamily: editorialFont.sans,
    fontSize: 14,
    fontWeight: "700",
    color: editorial.sosText,
    letterSpacing: -0.1,
  },
  sub: {
    fontFamily: editorialFont.sans,
    fontSize: 11,
    color: editorial.sosSub,
    marginTop: 1,
  },
  arrow: {
    fontSize: 17,
    color: editorial.sosPulse,
  },
});
