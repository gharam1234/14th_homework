import { create } from "zustand";
import type {
  AddressData,
  AddressStore,
  Coordinates,
} from "../types/address.types";

/**
 * 주소 및 좌표 관리 Zustand 스토어
 */
export const useAddressStore = create<AddressStore>((set) => ({
  address: null,
  coordinates: null,
  isLoading: false,
  error: null,

  setAddress: (address: AddressData) =>
    set({
      address,
      error: null,
    }),

  setCoordinates: (coords: Coordinates) =>
    set({
      coordinates: coords,
      error: null,
    }),

  clearAddress: () =>
    set({
      address: null,
      coordinates: null,
      error: null,
      isLoading: false,
    }),

  setLoading: (loading: boolean) =>
    set({
      isLoading: loading,
    }),

  setError: (error: string | null) =>
    set({
      error,
      isLoading: false,
    }),
}));
