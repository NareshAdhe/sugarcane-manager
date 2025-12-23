import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import * as SecureStore from "expo-secure-store";
import { Tractor, TractorService, AuthService, UserService } from "@/services/api";

interface UserSettings {
  name: string;
  email: string;
  defaultDieselRate: number;
  defaultVahatukRateShort: number;
  defaultVahatukRateLong: number;
  defaultTodniRate: number;
}

interface TractorContextType {
  tractors: Tractor[];
  setTractors: React.Dispatch<React.SetStateAction<Tractor[]>>;
  userSettings: UserSettings | null;
  setUserSettings: React.Dispatch<React.SetStateAction<UserSettings | null>>;
  loading: boolean;
  error: boolean;
  isLoggedIn: boolean;
  setIsLoggedIn: (val: boolean) => void;
  refreshData: () => Promise<void>;
}

const TractorContext = createContext<TractorContextType | undefined>(undefined);

export function TractorProvider({ children }: { children: React.ReactNode }) {
  const [tractors, setTractors] = useState<Tractor[]>([]);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null); // ✅ Initialize settings
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = await SecureStore.getItemAsync("userToken");
        setIsLoggedIn(!!token);
      } catch (e) {
        console.log("Auth check failed", e);
      } finally {
        const token = await SecureStore.getItemAsync("userToken");
        if (!token) setLoading(false);
      }
    };
    initializeAuth();
  }, []);

  const refreshData = useCallback(async () => {
    if (!isLoggedIn) return;

    try {
      setLoading(true);
      setError(false);
      
      const [tractorData, settingsData] = await Promise.all([
        TractorService.getAll(),
        UserService.getSettings()
      ]);

      if (tractorData) setTractors(tractorData);
      if (settingsData) setUserSettings(settingsData);

    } catch (err: any) {
      if (err.response?.status === 401) {
        setIsLoggedIn(false);
        await SecureStore.deleteItemAsync("userToken");
      } else {
        setError(true);
        console.error("Refresh Data Error:", err);
      }
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) {
      refreshData();
    }
  }, [isLoggedIn, refreshData]);

  return (
    <TractorContext.Provider
      value={{
        tractors,
        setTractors,
        userSettings,
        setUserSettings,
        loading,
        error,
        refreshData,
        isLoggedIn,
        setIsLoggedIn,
      }}
    >
      {children}
    </TractorContext.Provider>
  );
}

export const useTractors = () => {
  const context = useContext(TractorContext);
  if (!context)
    throw new Error("useTractors must be used within a TractorProvider");
  return context;
};