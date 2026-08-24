export { useAppData as useProjects } from "./app-data-context";

import { useAppData } from "./app-data-context";

export function useCurrentPorteurId() {
  return useAppData().currentPorteurId;
}

export { useAppData };
export const currentPorteurId = ""; // legacy compat — use useAppData().currentPorteurId instead
