import React, { createContext, useContext, useReducer } from 'react';

// Initial state for the application
const initialState = {
  // UI state
  sidebarOpen: true,
  loading: false,
  error: null,
  notifications: [],
  
  // Entity data - simplified structure
  students: [],
  courses: [],
  departments: [],
  users: [],
  fees: [],
  exams: [],
  guardians: [],
  admissions: [],
  hostels: [],
  rooms: [],
  hostelAllocations: [],
  library: [],
  bookIssues: [],
  results: [],
  userRoles: [],
  contactDetails: []
};

// Action types
export const actionTypes = {
  // UI actions
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  SET_LOADING: 'SET_LOADING',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  
  // Generic entity actions
  SET_ENTITY_LOADING: 'SET_ENTITY_LOADING',
  SET_ENTITY_ERROR: 'SET_ENTITY_ERROR',
  SET_ENTITY_LIST: 'SET_ENTITY_LIST',
  SET_ENTITY_SELECTED: 'SET_ENTITY_SELECTED',
  ADD_ENTITY_ITEM: 'ADD_ENTITY_ITEM',
  UPDATE_ENTITY_ITEM: 'UPDATE_ENTITY_ITEM',
  REMOVE_ENTITY_ITEM: 'REMOVE_ENTITY_ITEM',
  CLEAR_ENTITY_ERROR: 'CLEAR_ENTITY_ERROR'
};

// Reducer function
const appReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.TOGGLE_SIDEBAR:
      return {
        ...state,
        sidebarOpen: !state.sidebarOpen
      };

    case actionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };

    case actionTypes.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [...state.notifications, {
          id: Date.now(),
          ...action.payload
        }]
      };

    case actionTypes.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };

    case actionTypes.SET_ENTITY_LOADING:
      return {
        ...state,
        [action.entity]: {
          ...state[action.entity],
          loading: action.payload
        }
      };

    case actionTypes.SET_ENTITY_ERROR:
      return {
        ...state,
        [action.entity]: {
          ...state[action.entity],
          error: action.payload,
          loading: false
        }
      };

    case actionTypes.SET_ENTITY_LIST:
      return {
        ...state,
        [action.entity]: {
          ...state[action.entity],
          list: action.payload,
          loading: false,
          error: null
        }
      };

    case actionTypes.SET_ENTITY_SELECTED:
      return {
        ...state,
        [action.entity]: {
          ...state[action.entity],
          selected: action.payload
        }
      };

    case actionTypes.ADD_ENTITY_ITEM:
      return {
        ...state,
        [action.entity]: {
          ...state[action.entity],
          list: [...state[action.entity].list, action.payload]
        }
      };

    case actionTypes.UPDATE_ENTITY_ITEM:
      return {
        ...state,
        [action.entity]: {
          ...state[action.entity],
          list: state[action.entity].list.map(item =>
            item.id === action.payload.id ? action.payload : item
          )
        }
      };

    case actionTypes.REMOVE_ENTITY_ITEM:
      return {
        ...state,
        [action.entity]: {
          ...state[action.entity],
          list: state[action.entity].list.filter(item => item.id !== action.payload)
        }
      };

    case actionTypes.CLEAR_ENTITY_ERROR:
      return {
        ...state,
        [action.entity]: {
          ...state[action.entity],
          error: null
        }
      };

    default:
      return state;
  }
};

// Create context
const AppContext = createContext();

// Context provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Action creators
  const actions = {
    // UI actions
    toggleSidebar: () => dispatch({ type: actionTypes.TOGGLE_SIDEBAR }),
    
    setLoading: (loading) => dispatch({ 
      type: actionTypes.SET_LOADING, 
      payload: loading 
    }),
    
    addNotification: (notification) => dispatch({ 
      type: actionTypes.ADD_NOTIFICATION, 
      payload: notification 
    }),
    
    removeNotification: (id) => dispatch({ 
      type: actionTypes.REMOVE_NOTIFICATION, 
      payload: id 
    }),

    // Generic entity actions
    setEntityLoading: (entity, loading) => dispatch({
      type: actionTypes.SET_ENTITY_LOADING,
      entity,
      payload: loading
    }),

    setEntityError: (entity, error) => dispatch({
      type: actionTypes.SET_ENTITY_ERROR,
      entity,
      payload: error
    }),

    setEntityList: (entity, list) => dispatch({
      type: actionTypes.SET_ENTITY_LIST,
      entity,
      payload: list
    }),

    setEntitySelected: (entity, item) => dispatch({
      type: actionTypes.SET_ENTITY_SELECTED,
      entity,
      payload: item
    }),

    addEntityItem: (entity, item) => dispatch({
      type: actionTypes.ADD_ENTITY_ITEM,
      entity,
      payload: item
    }),

    updateEntityItem: (entity, item) => dispatch({
      type: actionTypes.UPDATE_ENTITY_ITEM,
      entity,
      payload: item
    }),

    removeEntityItem: (entity, id) => dispatch({
      type: actionTypes.REMOVE_ENTITY_ITEM,
      entity,
      payload: id
    }),

    clearEntityError: (entity) => dispatch({
      type: actionTypes.CLEAR_ENTITY_ERROR,
      entity
    }),

    // Notification helpers
    showSuccess: (message) => {
      actions.addNotification({
        type: 'success',
        message,
        duration: 3000
      });
    },

    showError: (message) => {
      actions.addNotification({
        type: 'error',
        message,
        duration: 5000
      });
    },

    showInfo: (message) => {
      actions.addNotification({
        type: 'info',
        message,
        duration: 3000
      });
    },

    showWarning: (message) => {
      actions.addNotification({
        type: 'warning',
        message,
        duration: 4000
      });
    }
  };

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the app context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export default AppContext;