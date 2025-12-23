import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import * as SecureStore from "expo-secure-store";
import { 
  Tractor, 
  Karkhana, 
  TractorService, 
  KarkhanaService,
  UserService
} from "@/services/api";

interface UserProfile {
  name: string;
  email: string;
}

interface TractorContextType {
  tractors: Tractor[];
  setTractors: React.Dispatch<React.SetStateAction<Tractor[]>>;
  karkhanas: Karkhana[];
  setKarkhanas: React.Dispatch<React.SetStateAction<Karkhana[]>>;
  userProfile: UserProfile | null;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  loading: boolean;
  error: boolean;
  isLoggedIn: boolean;
  setIsLoggedIn: (val: boolean) => void;
  refreshData: () => Promise<void>;
}

const TractorContext = createContext<TractorContextType | undefined>(undefined);

export function TractorProvider({ children }: { children: React.ReactNode }) {
  const [tractors, setTractors] = useState<Tractor[]>([]);
  const [karkhanas, setKarkhanas] = useState<Karkhana[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = await SecureStore.getItemAsync("userToken");
        if (token) {
          setIsLoggedIn(true);
        } else {
          setLoading(false);
        }
      } catch (e) {
        console.log("Auth check failed", e);
        setLoading(false);
      }
    };
    initializeAuth();
  }, []);

  const refreshData = useCallback(async () => {
    if (!isLoggedIn) return;

    try {
      setLoading(true);
      setError(false);

      const [tractorData, karkhanaData, profileData] = await Promise.all([
        TractorService.getAll(),
        KarkhanaService.getAll(),
        UserService.getSettings(),
      ]);

      if (tractorData) setTractors(tractorData);
      if (karkhanaData) setKarkhanas(karkhanaData);
      if (profileData) setUserProfile(profileData);

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
        karkhanas,
        setKarkhanas,
        userProfile,
        setUserProfile,
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