// data.tsx
import { executeQuery } from "./database";
export async function getServices() {
    const query = 'SELECT service_name, description,cost FROM comp6000_06.Services where service_name="Advanced Diagnostic Check"';
    const values: any[] = []; 
  
    try {
      const rows = await executeQuery(query, values);
      const mappedData = rows.map((row: { service_name: any; cost: any; description: any; }) => ({
        service_name: row.service_name,
        price: row.cost // Assuming there's no description field in the rows
        ,description : row.description
      }));
      
      return mappedData; // Return the mapped data
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }
  export async function getbasicMOT() {
    const query = 'SELECT service_name, description,cost FROM comp6000_06.Services where service_name="MOT"';
    const values: any[] = [];
  
    try {
      const rows = await executeQuery(query, values);
      const mappedData = rows.map((row: { service_name: any; cost: any; description: any; }) => ({
        service_name: row.service_name,
        price: row.cost // Assuming there's no description field in the rows
        ,description : row.description
      }));
      
      return mappedData; // Return the mapped data
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }
  
  export async function getInterimService() {
    const query = 'SELECT service_name, description,cost FROM comp6000_06.Services where service_name="Interim Service"';
    const values: any[] = []; 
  
    try {
      const rows = await executeQuery(query, values);
      const mappedData = rows.map((row: { service_name: any; cost: any; description: any; }) => ({
        service_name: row.service_name,
        price: row.cost // Assuming there's no description field in the rows
        ,description : row.description
      }));
      
      return mappedData; // Return the mapped data
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }
  export async function getfullservice(){
    const query = 'SELECT service_name, description,cost FROM comp6000_06.Services where service_name="Full Service"';
    const values: any[] = []; 
  
    try {
      const rows = await executeQuery(query, values);
      const mappedData = rows.map((row: { service_name: any; cost: any; description: any; }) => ({
        service_name: row.service_name,
        price: row.cost // Assuming there's no description field in the rows
        ,description : row.description
      }));
      
      return mappedData; // Return the mapped data
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }
  export async function getmajorService(){
    const query = 'SELECT service_name, description,cost FROM comp6000_06.Services where service_name="Major Service"';
    const values: any[] = []; 
  
    try {
      const rows = await executeQuery(query, values);
      const mappedData = rows.map((row: { service_name: any; cost: any; description: any; }) => ({
        service_name: row.service_name,
        price: row.cost // Assuming there's no description field in the rows
        ,description : row.description
      }));
      
      return mappedData; // Return the mapped data
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }
  export async function geOilandFilterChange(){
    const query = 'SELECT service_name, description,cost FROM comp6000_06.Services where service_name="Oil and Filter"';
    const values: any[] = [];
  
    try {
      const rows = await executeQuery(query, values);
      const mappedData = rows.map((row: { service_name: any; cost: any; description: any; }) => ({
        service_name: row.service_name,
        price: row.cost // Assuming there's no description field in the rows
        ,description : row.description
      }));
      
      return mappedData; // Return the mapped data
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }


  export async function getWindscreenRepairService(){
    const query = 'SELECT service_name, description,cost FROM comp6000_06.Services where service_name="Windscreen Repairs Service"';
    const values: any[] = []; 
  
    try {
      const rows = await executeQuery(query, values);
      const mappedData = rows.map((row: { service_name: any; cost: any; description: any; }) => ({
        service_name: row.service_name,
        price: row.cost // Assuming there's no description field in the rows
        ,description : row.description
      }));
      
      return mappedData; // Return the mapped data
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }

  export async function getMOTandInterimService(){
    const query = 'SELECT service_name, description,cost FROM comp6000_06.Services where service_name="Interim Service and MOT"';
    const values: any[] = []; 
  
    try {
      const rows = await executeQuery(query, values);
      const mappedData = rows.map((row: { service_name: any; cost: any; description: any; }) => ({
        service_name: row.service_name,
        price: row.cost // Assuming there's no description field in the rows
        ,description : row.description
      }));
      
      return mappedData; // Return the mapped data
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }
  export async function getFullAndMot(){
    const query = 'SELECT service_name, description,cost FROM comp6000_06.Services where service_name="Full Service and MOT"';
    const values: any[] = []; 
  
    try {
      const rows = await executeQuery(query, values);
      const mappedData = rows.map((row: { service_name: any; cost: any; description: any; }) => ({
        service_name: row.service_name,
        price: row.cost // Assuming there's no description field in the rows
        ,description : row.description
      }));
      
      return mappedData; // Return the mapped data
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }
  export async function getmajorandmot(){
    const query = 'SELECT service_name, description,cost FROM comp6000_06.Services where service_name="Major Service and MOT"';
    const values: any[] = []; 
  
    try {
      const rows = await executeQuery(query, values);
      const mappedData = rows.map((row: { service_name: any; cost: any; description: any; }) => ({
        service_name: row.service_name,
        price: row.cost // Assuming there's no description field in the rows
        ,description : row.description
      }));
      
      return mappedData; // Return the mapped data
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }
  export async function getMot(){
    const query = 'SELECT service_name, description,cost FROM comp6000_06.Services where service_name="MOT"';
    const values: any[] = []; 
  
    try {
      const rows = await executeQuery(query, values);
      const mappedData = rows.map((row: { service_name: any; cost: any; description: any; }) => ({
        service_name: row.service_name,
        price: row.cost // Assuming there's no description field in the rows
        ,description : row.description
      }));
      
      return mappedData; // Return the mapped data
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }

export async function getpunctureRepair() {
  const query = 'SELECT service_name, description,cost FROM comp6000_06.Services where service_name="puncture Repair"';
    const values: any[] = []; 
  
    try {
      const rows = await executeQuery(query, values);
      const mappedData = rows.map((row: { service_name: any; cost: any; description: any; }) => ({
        service_name: row.service_name,
        price: row.cost // Assuming there's no description field in the rows
        ,description : row.description
      }));
      
      return mappedData; // Return the mapped data
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  
}
export async function getTireReplacement() {
  const query = 'SELECT service_name, description,cost FROM comp6000_06.Services where service_name="Tire Replacement"';
    const values: any[] = []; 
  
    try {
      const rows = await executeQuery(query, values);
      const mappedData = rows.map((row: { service_name: any; cost: any; description: any; }) => ({
        service_name: row.service_name,
        price: row.cost // Assuming there's no description field in the rows
        ,description : row.description
      }));
      
      return mappedData; // Return the mapped data
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  
}
export async function getBrakeoil() {
  const query = 'SELECT service_name, description,cost FROM comp6000_06.Services where service_name="Brake Fluid Change"';
    const values: any[] = []; 
  
    try {
      const rows = await executeQuery(query, values);
      const mappedData = rows.map((row: { service_name: any; cost: any; description: any; }) => ({
        service_name: row.service_name,
        price: row.cost // Assuming there's no description field in the rows
        ,description : row.description
      }));
      
      return mappedData; // Return the mapped data
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  
}
export async function getbatteryservice() {
  const query = 'SELECT service_name, description,cost FROM comp6000_06.Services where service_name="batteryService"';
    const values: any[] = []; 
  
    try {
      const rows = await executeQuery(query, values);
      const mappedData = rows.map((row: { service_name: any; cost: any; description: any; }) => ({
        service_name: row.service_name,
        price: row.cost // Assuming there's no description field in the rows
        ,description : row.description
      }));
      
      return mappedData; // Return the mapped data
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  
}
export async function getengineservice() {
  const query = 'SELECT service_name, description,cost FROM comp6000_06.Services where service_name="engineService"';
    const values: any[] = []; 
  
    try {
      const rows = await executeQuery(query, values);
      const mappedData = rows.map((row: { service_name: any; cost: any; description: any; }) => ({
        service_name: row.service_name,
        price: row.cost // Assuming there's no description field in the rows
        ,description : row.description
      }));
      
      return mappedData; // Return the mapped data
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  
}
