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

// Reducer function
const appReducer = (state, action) => {
  switch (action.type) {
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };

    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, { id: Date.now(), ...action.payload }]
      };

    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };

    // Entity actions
    case 'SET_STUDENTS':
      return { ...state, students: action.payload };
    case 'ADD_STUDENT':
      return { ...state, students: [...state.students, action.payload] };
    case 'UPDATE_STUDENT':
      return {
        ...state,
        students: state.students.map(item => 
          item.student_id === action.payload.id ? action.payload.data : item
        )
      };
    case 'REMOVE_STUDENT':
      return {
        ...state,
        students: state.students.filter(item => item.student_id !== action.payload)
      };

    case 'SET_COURSES':
      return { ...state, courses: action.payload };
    case 'ADD_COURSE':
      return { ...state, courses: [...state.courses, action.payload] };
    case 'UPDATE_COURSE':
      return {
        ...state,
        courses: state.courses.map(item => 
          item.course_id === action.payload.id ? action.payload.data : item
        )
      };
    case 'REMOVE_COURSE':
      return {
        ...state,
        courses: state.courses.filter(item => item.course_id !== action.payload)
      };

    case 'SET_DEPARTMENTS':
      return { ...state, departments: action.payload };
    case 'ADD_DEPARTMENT':
      return { ...state, departments: [...state.departments, action.payload] };
    case 'UPDATE_DEPARTMENT':
      return {
        ...state,
        departments: state.departments.map(item => 
          item.dept_id === action.payload.id ? action.payload.data : item
        )
      };
    case 'REMOVE_DEPARTMENT':
      return {
        ...state,
        departments: state.departments.filter(item => item.dept_id !== action.payload)
      };

    case 'SET_USERS':
      return { ...state, users: action.payload };
    case 'ADD_USER':
      return { ...state, users: [...state.users, action.payload] };
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(item => 
          item.user_id === action.payload.id ? action.payload.data : item
        )
      };
    case 'REMOVE_USER':
      return {
        ...state,
        users: state.users.filter(item => item.user_id !== action.payload)
      };

    case 'SET_FEES':
      return { ...state, fees: action.payload };
    case 'ADD_FEES':
      return { ...state, fees: [...state.fees, action.payload] };
    case 'UPDATE_FEES':
      return {
        ...state,
        fees: state.fees.map(item => 
          item.fees_id === action.payload.id ? action.payload.data : item
        )
      };
    case 'REMOVE_FEES':
      return {
        ...state,
        fees: state.fees.filter(item => item.fees_id !== action.payload)
      };

    case 'SET_EXAMS':
      return { ...state, exams: action.payload };
    case 'ADD_EXAM':
      return { ...state, exams: [...state.exams, action.payload] };
    case 'UPDATE_EXAM':
      return {
        ...state,
        exams: state.exams.map(item => 
          item.exam_id === action.payload.id ? action.payload.data : item
        )
      };
    case 'REMOVE_EXAM':
      return {
        ...state,
        exams: state.exams.filter(item => item.exam_id !== action.payload)
      };

    case 'SET_GUARDIANS':
      return { ...state, guardians: action.payload };
    case 'ADD_GUARDIAN':
      return { ...state, guardians: [...state.guardians, action.payload] };
    case 'UPDATE_GUARDIAN':
      return {
        ...state,
        guardians: state.guardians.map(item => 
          item.guardian_id === action.payload.id ? action.payload.data : item
        )
      };
    case 'REMOVE_GUARDIAN':
      return {
        ...state,
        guardians: state.guardians.filter(item => item.guardian_id !== action.payload)
      };

    case 'SET_ADMISSIONS':
      return { ...state, admissions: action.payload };
    case 'ADD_ADMISSION':
      return { ...state, admissions: [...state.admissions, action.payload] };
    case 'UPDATE_ADMISSION':
      return {
        ...state,
        admissions: state.admissions.map(item => 
          item.admission_id === action.payload.id ? action.payload.data : item
        )
      };
    case 'REMOVE_ADMISSION':
      return {
        ...state,
        admissions: state.admissions.filter(item => item.admission_id !== action.payload)
      };

    case 'SET_HOSTELS':
      return { ...state, hostels: action.payload };
    case 'ADD_HOSTEL':
      return { ...state, hostels: [...state.hostels, action.payload] };
    case 'UPDATE_HOSTEL':
      return {
        ...state,
        hostels: state.hostels.map(item => 
          item.hostel_id === action.payload.id ? action.payload.data : item
        )
      };
    case 'REMOVE_HOSTEL':
      return {
        ...state,
        hostels: state.hostels.filter(item => item.hostel_id !== action.payload)
      };

    case 'SET_LIBRARY':
      return { ...state, library: action.payload };
    case 'ADD_BOOK':
      return { ...state, library: [...state.library, action.payload] };
    case 'UPDATE_BOOK':
      return {
        ...state,
        library: state.library.map(item => 
          item.book_id === action.payload.id ? action.payload.data : item
        )
      };
    case 'REMOVE_BOOK':
      return {
        ...state,
        library: state.library.filter(item => item.book_id !== action.payload)
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

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export default AppContext;