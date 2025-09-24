// API helper functions for common operations
import {
  studentService,
  courseService,
  departmentService,
  userService,
  feesService,
  examService,
  guardianService,
  admissionService,
  hostelService,
  roomService,
  hostelAllocationService,
  libraryService,
  bookIssueService,
  resultService,
  userRoleService,
  contactDetailsService
} from './soapClient';

// Service mapping
const serviceMap = {
  student: studentService,
  course: courseService,
  department: departmentService,
  user: userService,
  fees: feesService,
  exam: examService,
  guardian: guardianService,
  admission: admissionService,
  hostel: hostelService,
  room: roomService,
  hostelAllocation: hostelAllocationService,
  library: libraryService,
  bookIssue: bookIssueService,
  result: resultService,
  userRole: userRoleService,
  contactDetails: contactDetailsService
};

// Generic API operations
export const apiHelpers = {
  // Get service by entity name
  getService: (entityName) => {
    const service = serviceMap[entityName];
    if (!service) {
      throw new Error(`Service not found for entity: ${entityName}`);
    }
    return service;
  },

  // Generic list operation with error handling
  list: async (entityName) => {
    try {
      const service = apiHelpers.getService(entityName);
      const response = await service.list();
      return {
        success: true,
        data: response || [],
        error: null
      };
    } catch (error) {
      console.error(`Error fetching ${entityName} list:`, error);
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  },

  // Generic get operation
  get: async (entityName, id) => {
    try {
      const service = apiHelpers.getService(entityName);
      const response = await service.get(id);
      return {
        success: true,
        data: response,
        error: null
      };
    } catch (error) {
      console.error(`Error fetching ${entityName} with id ${id}:`, error);
      return {
        success: false,
        data: null,
        error: error.message
      };
    }
  },

  // Generic create operation
  create: async (entityName, data) => {
    try {
      const service = apiHelpers.getService(entityName);
      const response = await service.create(data);
      return {
        success: true,
        data: response,
        error: null
      };
    } catch (error) {
      console.error(`Error creating ${entityName}:`, error);
      return {
        success: false,
        data: null,
        error: error.message
      };
    }
  },

  // Generic update operation
  update: async (entityName, id, data) => {
    try {
      const service = apiHelpers.getService(entityName);
      const response = await service.update(id, data);
      return {
        success: true,
        data: response,
        error: null
      };
    } catch (error) {
      console.error(`Error updating ${entityName} with id ${id}:`, error);
      return {
        success: false,
        data: null,
        error: error.message
      };
    }
  },

  // Generic delete operation
  remove: async (entityName, id) => {
    try {
      const service = apiHelpers.getService(entityName);
      const response = await service.remove(id);
      return {
        success: true,
        data: response,
        error: null
      };
    } catch (error) {
      console.error(`Error deleting ${entityName} with id ${id}:`, error);
      return {
        success: false,
        data: null,
        error: error.message
      };
    }
  },

  // Batch operations
  batchDelete: async (entityName, ids) => {
    const results = [];
    for (const id of ids) {
      const result = await apiHelpers.remove(entityName, id);
      results.push({ id, ...result });
    }
    return results;
  },

  // Search and filter operations (client-side for now)
  search: (data, searchTerm, searchFields) => {
    if (!searchTerm || !searchFields || searchFields.length === 0) {
      return data;
    }

    const term = searchTerm.toLowerCase();
    return data.filter(item => 
      searchFields.some(field => 
        item[field] && item[field].toString().toLowerCase().includes(term)
      )
    );
  },

  // Sort data
  sort: (data, sortField, sortDirection = 'asc') => {
    if (!sortField) return data;

    return [...data].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      // Handle null/undefined values
      if (aVal == null) aVal = '';
      if (bVal == null) bVal = '';

      // Convert to strings for comparison
      aVal = aVal.toString().toLowerCase();
      bVal = bVal.toString().toLowerCase();

      if (sortDirection === 'asc') {
        return aVal.localeCompare(bVal);
      } else {
        return bVal.localeCompare(aVal);
      }
    });
  },

  // Paginate data
  paginate: (data, page, pageSize) => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    return {
      data: data.slice(startIndex, endIndex),
      totalItems: data.length,
      totalPages: Math.ceil(data.length / pageSize),
      currentPage: page,
      pageSize
    };
  }
};

export default apiHelpers;