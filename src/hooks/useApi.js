import { useState, useEffect, useCallback } from "react";

// Custom hook for handling API calls with loading states
export const useApi = (apiCall, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiCall();
      setData(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "An error occurred"
      );
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  useEffect(() => {
    fetchData();
  }, dependencies);

  return { data, loading, error, refetch: fetchData };
};

// Custom hook for handling API calls with manual trigger
export const useApiCall = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (apiCall) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiCall();
      setData(response.data);
      return response.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "An error occurred";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
};

// Hook for auto-refreshing data
export const useAutoRefresh = (
  apiCall,
  interval = 30000,
  dependencies = []
) => {
  const { data, loading, error, refetch } = useApi(apiCall, dependencies);

  useEffect(() => {
    if (interval && interval > 0) {
      const intervalId = setInterval(refetch, interval);
      return () => clearInterval(intervalId);
    }
  }, [refetch, interval]);

  return { data, loading, error, refetch };
};

// Hook for polling data until a condition is met
export const usePolling = (
  apiCall,
  condition,
  interval = 5000,
  maxAttempts = 10
) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [attempts, setAttempts] = useState(0);

  const startPolling = useCallback(async () => {
    setLoading(true);
    setError(null);
    setAttempts(0);

    const poll = async (currentAttempt) => {
      try {
        const response = await apiCall();
        const responseData = response.data;
        setData(responseData);

        if (condition(responseData)) {
          setLoading(false);
          return responseData;
        }

        if (currentAttempt >= maxAttempts) {
          throw new Error("Maximum polling attempts reached");
        }

        setAttempts(currentAttempt + 1);
        setTimeout(() => poll(currentAttempt + 1), interval);
      } catch (err) {
        setError(err.message || "Polling failed");
        setLoading(false);
      }
    };

    await poll(1);
  }, [apiCall, condition, interval, maxAttempts]);

  return { data, loading, error, attempts, startPolling };
};

export default {
  useApi,
  useApiCall,
  useAutoRefresh,
  usePolling,
};
