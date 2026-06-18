import { useEffect, useState } from "react";
import { getFavoritePracticeId, getLastPracticeId } from "@/features/progress/progressStats";
import { loadSessionHistory } from "@/storage/sessionStorage";

type PersonalizationState = Readonly<{
  isLoading: boolean;
  hasHistory: boolean;
  lastPracticeId: string | null;
  favoritePracticeId: string | null;
}>;

const INITIAL: PersonalizationState = {
  isLoading: true,
  hasHistory: false,
  lastPracticeId: null,
  favoritePracticeId: null,
};

export function usePersonalization(): PersonalizationState {
  const [state, setState] = useState<PersonalizationState>(INITIAL);

  useEffect(() => {
    loadSessionHistory()
      .then((records) => {
        setState({
          isLoading: false,
          hasHistory: records.length > 0,
          lastPracticeId: getLastPracticeId(records),
          favoritePracticeId: getFavoritePracticeId(records),
        });
      })
      .catch(() => {
        setState({ isLoading: false, hasHistory: false, lastPracticeId: null, favoritePracticeId: null });
      });
  }, []);

  return state;
}
