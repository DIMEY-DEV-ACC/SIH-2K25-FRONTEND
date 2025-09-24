import { useState, useEffect, useCallback } from 'react';
import { apiHelpers } from '../services/apiHelpers';

// Custom hook for fetching data
export const useFetch = (entityName, id = null) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let result;
      if (id) {
        result = await apiHelpers.get(entityName, id);
      } else {
        result = await apiHelpers.list(entityName);
      }

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [entityName, id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch
  };
};

// Custom hook for CRUD operations
export const useCrud = (entityName) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const create = useCallback(async (data) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiHelpers.create(entityName, data);
      if (result.success) {
        return { success: true, data: result.data };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [entityName]);

  const update = useCallback(async (id, data) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiHelpers.update(entityName, id, data);
      if (result.success) {
        return { success: true, data: result.data };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [entityName]);

  const remove = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiHelpers.remove(entityName, id);
      if (result.success) {
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [entityName]);

  const batchDelete = useCallback(async (ids) => {
    setLoading(true);
    setError(null);

    try {
      const results = await apiHelpers.batchDelete(entityName, ids);
      const failures = results.filter(r => !r.success);
      
      if (failures.length === 0) {
        return { success: true };
      } else {
        const errorMsg = `Failed to delete ${failures.length} items`;
        setError(errorMsg);
        return { success: false, error: errorMsg, failures };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [entityName]);

  return {
    create,
    update,
    remove,
    batchDelete,
    loading,
    error,
    clearError: () => setError(null)
  };
};

export default useFetch;