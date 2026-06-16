import { Redirect, useLocalSearchParams, type Href } from "expo-router";
import { getPracticeById } from "@/data/breathingPractices";

export default function PracticeDetailRedirect() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const practice = getPracticeById(id);

  if (!practice) {
    return <Redirect href="/" />;
  }

  return <Redirect href={`/session/${practice.id}` as Href} />;
}
