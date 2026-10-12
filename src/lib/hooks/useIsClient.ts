import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/** `false` during SSR and hydration, `true` afterwards – without a setState-in-effect round trip. */
export const useIsClient = () =>
  useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
