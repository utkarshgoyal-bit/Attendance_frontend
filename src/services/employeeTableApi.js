import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

export const fetchEmployees = async (selectedMonth, selectedYear, selectedBranch, debouncedSearch) => {
  try {
    const params = new URLSearchParams({
      month: selectedMonth,
      year: selectedYear,
      branch: selectedBranch,
      search: debouncedSearch,
    });
    const response = await axios.get(`${API_BASE_URL}/employees?${params.toString()}`);
    console.log("Fetched employees:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching employees:", error);
    throw error;
  }
};

export const saveSalary = async (payload) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/salaries`, payload);
    return response.data;
  } catch (error) {
    console.error("Error saving salary:", error);
    throw error;
  }
};

export const updateSalary = async (id, payload) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/salaries/${id}`, payload);
    return response.data;
  } catch (error) {
    console.error("Error updating salary:", error);
    throw error;
  }
};


