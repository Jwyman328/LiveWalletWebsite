import { ApiClient } from "../api/api";
import { useQuery } from "react-query";

export const uxtoQueryKeys = {
  getCurrentFees: ["getCurrentFees"],
};

export function useGetCurrentFees() {
  return useQuery(
    uxtoQueryKeys.getCurrentFees,
    () => ApiClient.getCurrentFees(),
    {
      refetchOnWindowFocus: false,
      refetchInterval: 120000,
    }
  );
}
