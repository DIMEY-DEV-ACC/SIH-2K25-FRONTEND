import axios from 'axios';
import { API_BASE_URL, SOAP_ENDPOINTS } from '../utils/constants';

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'text/xml; charset=utf-8',
    'SOAPAction': ''
  }
});

// SOAP envelope template
const createSoapEnvelope = (body) => `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
               xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
               xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    ${body}
  </soap:Body>
</soap:Envelope>`;

// Parse SOAP response
const parseSoapResponse = (xmlString) => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    
    // Check for SOAP fault
    const fault = xmlDoc.getElementsByTagName('soap:Fault')[0];
    if (fault) {
      const faultString = fault.getElementsByTagName('faultstring')[0]?.textContent;
      throw new Error(faultString || 'SOAP Fault occurred');
    }
    
    // Extract response data (this is a simplified parser)
    const body = xmlDoc.getElementsByTagName('soap:Body')[0];
    if (body) {
      // Convert XML to JSON (simplified approach)
      return xmlToJson(body);
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing SOAP response:', error);
    throw error;
  }
};

// Simple XML to JSON converter
const xmlToJson = (xml) => {
  let obj = {};
  
  if (xml.hasChildNodes()) {
    for (let i = 0; i < xml.childNodes.length; i++) {
      const item = xml.childNodes.item(i);
      const nodeName = item.nodeName;
      
      if (typeof obj[nodeName] === 'undefined') {
        obj[nodeName] = xmlToJson(item);
      } else {
        if (typeof obj[nodeName].push === 'undefined') {
          const old = obj[nodeName];
          obj[nodeName] = [];
          obj[nodeName].push(old);
        }
        obj[nodeName].push(xmlToJson(item));
      }
    }
  } else {
    obj = xml.nodeValue;
  }
  
  return obj;
};

// Generic SOAP client class
class SoapClient {
  constructor(endpoint) {
    this.endpoint = endpoint;
  }

  async makeRequest(action, body) {
    try {
      const soapEnvelope = createSoapEnvelope(body);
      
      const response = await apiClient.post(this.endpoint, soapEnvelope, {
        headers: {
          'SOAPAction': action
        }
      });
      
      return parseSoapResponse(response.data);
    } catch (error) {
      console.error(`SOAP request failed for ${action}:`, error);
      
      if (error.response) {
        // Server responded with error status
        throw new Error(`Server error: ${error.response.status} - ${error.response.statusText}`);
      } else if (error.request) {
        // Request was made but no response received
        throw new Error('Network error: No response from server');
      } else {
        // Something else happened
        throw new Error(`Request error: ${error.message}`);
      }
    }
  }

  // Generic CRUD operations
  async list() {
    const body = `<GetAll xmlns="http://tempuri.org/" />`;
    return this.makeRequest('GetAll', body);
  }

  async get(id) {
    const body = `<Get xmlns="http://tempuri.org/"><id>${id}</id></Get>`;
    return this.makeRequest('Get', body);
  }

  async create(data) {
    const fields = Object.keys(data).map(key => 
      `<${key}>${data[key]}</${key}>`
    ).join('');
    
    const body = `<Create xmlns="http://tempuri.org/">${fields}</Create>`;
    return this.makeRequest('Create', body);
  }

  async update(id, data) {
    const fields = Object.keys(data).map(key => 
      `<${key}>${data[key]}</${key}>`
    ).join('');
    
    const body = `<Update xmlns="http://tempuri.org/"><id>${id}</id>${fields}</Update>`;
    return this.makeRequest('Update', body);
  }

  async remove(id) {
    const body = `<Delete xmlns="http://tempuri.org/"><id>${id}</id></Delete>`;
    return this.makeRequest('Delete', body);
  }
}

// Create service instances for each entity
export const studentService = new SoapClient(SOAP_ENDPOINTS.STUDENT);
export const courseService = new SoapClient(SOAP_ENDPOINTS.COURSE);
export const departmentService = new SoapClient(SOAP_ENDPOINTS.DEPARTMENT);
export const userService = new SoapClient(SOAP_ENDPOINTS.USER);
export const feesService = new SoapClient(SOAP_ENDPOINTS.FEES);
export const examService = new SoapClient(SOAP_ENDPOINTS.EXAM);
export const guardianService = new SoapClient(SOAP_ENDPOINTS.GUARDIAN);
export const admissionService = new SoapClient(SOAP_ENDPOINTS.ADMISSION);
export const hostelService = new SoapClient(SOAP_ENDPOINTS.HOSTEL);
export const roomService = new SoapClient(SOAP_ENDPOINTS.ROOM);
export const hostelAllocationService = new SoapClient(SOAP_ENDPOINTS.HOSTEL_ALLOCATION);
export const libraryService = new SoapClient(SOAP_ENDPOINTS.LIBRARY);
export const bookIssueService = new SoapClient(SOAP_ENDPOINTS.BOOK_ISSUE);
export const resultService = new SoapClient(SOAP_ENDPOINTS.RESULT);
export const userRoleService = new SoapClient(SOAP_ENDPOINTS.USER_ROLE);
export const contactDetailsService = new SoapClient(SOAP_ENDPOINTS.CONTACT_DETAILS);

// Export default client for custom operations
export default SoapClient;