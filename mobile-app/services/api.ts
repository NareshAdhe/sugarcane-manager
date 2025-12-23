import { Alert } from "react-native";
import api from "./apiConfig";
import * as SecureStore from "expo-secure-store";

export interface TripData {
  id: number;
  tractorId: number;
  date: string;
  slipNumber: string;
  netWeight: number;
  distance: number;
  cuttingIncome: number;
  transportIncome: number;
  dieselLiters: number;
  commission: number;
  dieselCost: number;
  netTripProfit: number;
}

export interface Expense {
  id: number;
  type: string;
  date: string;
  amount: number;
  description?: string;
  tractor: {
    plateNumber: string;
  };
  driver: {
    name: string;
  };

  mukadam: {
    name: string;
  };
}

export interface MukadamDetail {
  id: number;
  name: string;
  phone?: string;
  totalAdvanceGiven: number;
}

export interface DriverDetail {
  id: number;
  name: string;
  phone?: string;
  totalAdvanceGiven: number;
}

export interface Tractor {
  id: number;
  plateNumber: string;
  modelName?: string;
  driverName?: string;
  mukadamName?: string;

  driver?: DriverDetail | null;
  mukadam?: MukadamDetail | null;
  trips: TripData[];
  expenses: Expense[];

  lastTrip?: {
    id: number;
    weight: number;
    date: string;
    profit: number;
  } | null;
  lastExpense?: {
    id: number;
    amount: number;
    type: string;
    date: string;
  } | null;
}

export interface UserSettings {
  name: string;
  email: string;
  defaultDieselRate: number;
  defaultVahatukRateShort: number;
  defaultVahatukRateLong: number;
  defaultTodniRate: number;
}

export type TractorDetail = Tractor;

export const TractorService = {
  getAll: async (): Promise<Tractor[]> => {
    try {
      const response = await api.get("/api/tractors");
      return response.data;
    } catch (error) {
      console.error("Connection Error:", error);
      Alert.alert("Connection Failed", "Server शी संपर्क होऊ शकला नाही.");
      return [];
    }
  },

  getById: async (id: number, year: string): Promise<TractorDetail | null> => {
    try {
      const response = await api.get(`/api/tractors/${id}`, {
        params: { year },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching tractor details:", error);
      return null;
    }
  },

  getConfigById: async (id: number): Promise<any> => {
    try {
      const response = await api.get(`/api/tractors/${id}/config`);
      return response.data;
    } catch (error) {
      console.error("Error fetching tractor details:", error);
      return null;
    }
  },

  addTrip: async (trip: any): Promise<TripData | null> => {
    try {
      const response = await api.post(`/api/trips`, trip);
      return response.data;
    } catch (error) {
      console.error("Error adding trip:", error);
      return null;
    }
  },

  updateTrip: async (
    tripId: number,
    tripData: any
  ): Promise<TripData | null> => {
    try {
      const response = await api.put(`/api/trips/${tripId}`, tripData);
      return response.data;
    } catch (error) {
      console.error(`Error updating trip ${tripId}:`, error);
      return null;
    }
  },

  deleteTrip: async (tripId: number): Promise<boolean> => {
    try {
      const response = await api.delete(`/api/trips/${tripId}`);
      return response.status === 200 || response.status === 204;
    } catch (error) {
      console.error(`Error deleting trip ${tripId}:`, error);
      return false;
    }
  },
  delete: async (id: number): Promise<boolean> => {
    try {
      await api.delete(`/api/tractors/${id}`);
      return true;
    } catch (error) {
      console.error("API Error during deletion:", error);
      return false;
    }
  },
  update: async (id: number, data: any): Promise<Tractor | null> => {
    try {
      const response = await api.put(`/api/tractors/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("API Error during update:", error);
      return null;
    }
  },
  create: async (data: any): Promise<Tractor | null> => {
    try {
      const response = await api.post(`/api/tractors`, data);
      return response.data;
    } catch (error) {
      console.error("API Error during create:", error);
      return null;
    }
  },

  addExpense: async (id: number, data: any): Promise<Expense | null> => {
    try {
      const response = await api.post(`/api/expenses/tractor/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("API Error during expense creation:", error);
      return null;
    }
  },

  deleteExpense: async (expenseId: number): Promise<void> => {
    try {
      await api.delete(`/api/expenses/${expenseId}`);
    } catch (error) {
      console.error("API Error during delete:", error);
      throw error;
    }
  },

  getAllExpenses: async (
    tractorId: number,
    year: string
  ): Promise<Expense[]> => {
    try {
      const response = await api.get(`/api/expenses`, {
        params: {
          tractorId,
          year,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching all expenses:", error);
      return [];
    }
  },
};

export const AuthService = {
  signup: async (name: string, email: string) => {
    const response = await api.post(`/api/auth/signup`, { name, email });
    return response.data;
  },

  login: async (email: string) => {
    const response = await api.post(`/api/auth/login`, { email });
    return response.data;
  },

  verifyOTP: async (otp: string, otpToken: string) => {
    const response = await api.post(`/api/auth/verify-otp`, {
      otp: otp.trim(),
      otpToken
    });

    if (response.data.token) {
      await SecureStore.setItemAsync("userToken", response.data.token);
    }
    return response.data;
  },
};

export const UserService = {
  getSettings: async (): Promise<UserSettings> => {
    const response = await api.get("/api/user/settings");
    return response.data;
  },
  updateSettings: async (settings: {
    dieselRate: string | number;
    vahatukRateShort: string | number;
    vahatukRateLong: string | number;
    todniRate: string | number;
  }): Promise<{ message: string; settings: UserSettings }> => {
    const response = await api.put("/api/user/settings", settings);
    return response.data;
  },
}
