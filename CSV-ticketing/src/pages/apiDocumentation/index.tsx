import { useState } from "react";
import { 
  loginResponse, 
  registerResponse, 
  allEmailsResponse,
  fetchOwnEmailResponse,
fetchAllTickersResponse,
fetchViewOpenTicketsResponse,
fetchViewClosedTicketsResponse,
fetchAllMemosResponse,
fetchMemoResponse,
fetchCategoriesResponse,
fetchCategoryResponse,
fetchPoliciesResponse,
fetchPolicyResponse,
fetchEmployeeTimesReponse,
emmployeeLogs,
fetchEmployeeNull
} from "./apiResponse.ts"; 

interface Endpoint {
  url: string;
  method: string;
  name: string;
  description?: string;
  sampleResponse: object;
}

const login: Endpoint = {
  url: "http://localhost:5000/api/users/login",
  method: "POST",
  name: "Login",
  description: "Logged in a user",
  sampleResponse: loginResponse
};

const register: Endpoint = {
  url: "http://localhost:5000/api/users/",
  method: "POST",
  name: "Register",
  description: "Register a new user",
  sampleResponse: registerResponse
};

const emails: Endpoint = {
  url: "http://localhost:5000/api/users/emails",
  method: "GET",
  name: "Emails",
  description: "Retrieve all user emails",
  sampleResponse: allEmailsResponse
}

const ownData: Endpoint = {
  url: "http://localhost:5000/api/users/me",
  method: "GET",
  name: "Fetch Own Data",
  description: "Fetch the authenticated user's data",
  sampleResponse: fetchOwnEmailResponse
}

const allTickets: Endpoint = {
  url: "http://localhost:5000/api/tickets/viewAll",
  method: "GET",
  name: "Fetch All Tickets",
  description: "Fetch all tickets in the system",
  sampleResponse: fetchAllTickersResponse
}

const viewOpenTikcets: Endpoint = {
  url: "http://localhost:5000/api/tickets/viewOpen",
  method: "GET",
  name: "Fetch Open Tickets",
  description: "Fetch all open tickets in the system",
  sampleResponse: fetchViewOpenTicketsResponse
  
}

const viewClosedTickets: Endpoint = {
  url: "http://localhost:5000/api/tickets/viewClosed",
  method: "GET",
  name: "Fetch Closed Tickets",
  description: "Fetch all closed tickets in the system",
  sampleResponse: fetchViewClosedTicketsResponse
}

const viewAllMemos: Endpoint = {
url: "http://localhost:5000/api/memos/",
  method: "GET",
  name: "Fetch Memos",
  description: "Fetch all memos in the system",
  sampleResponse: fetchAllMemosResponse
}

const viewMemo: Endpoint = {
  url: "http://localhost:5000/api/memos/68e77b4ab56b95db6c1c55d0",
  method: "GET",
  name: "Fetch Memo",
  description: "Fetch a specific memo by its ID",
  sampleResponse: fetchMemoResponse
}

const viewCategories: Endpoint = {
  url: "http://localhost:5000/api/categories/",
  method: "GET",
  name: "Fetch Categories",
  description: "Fetch all categories in the system",
  sampleResponse: fetchCategoriesResponse
}

const viewCategory: Endpoint = {
  url: "http://localhost:5000/api/categories/68e881382ee851b2a0cd2a77",
  method: "GET",
  name: "Fetch Category",
  description: "Fetch a specific category by its ID",
  sampleResponse: fetchCategoryResponse
}

const viewPolicies: Endpoint = {
  url: "http://localhost:5000/api/policies/",
  method: "GET",
  name: "Fetch Policies",
  description: "Fetch all policies in the system",
  sampleResponse: fetchPoliciesResponse
}

const viewPolicy: Endpoint = {
url: "http://localhost:5000/api/policies/692f190a9af6da9ceedbd47e",
  method: "GET",
  name: "Fetch Policy",
  description: "Fetch a specific policy by its ID",
  sampleResponse: fetchPolicyResponse
}

const viewEmployees: Endpoint = {
  url: "http://localhost:5000/api/employeeTimes/",
  method: "GET",
  name: "Fetch Employee Times",
  description: "Fetch all employee times in the system",
  sampleResponse: fetchEmployeeTimesReponse
}

const viewEmployeesLog: Endpoint = {
  url: "http://localhost:5000/api/employeeTimes/time",
  method: "GET",
  name: "Fetch Employee Logs",
  description: "Fetch all employee logs in the system",
  sampleResponse: emmployeeLogs
}

const viewEmployeesNull: Endpoint = {
  url: "http://localhost:5000/api/employeeTimes/null",
  method: "GET",
  name: "Fetch Employee Null",
  description: "Fetch all employee null entries in the system",
  sampleResponse: fetchEmployeeNull
}

const endpoints: Endpoint[] = [
  login, 
  register,
  emails,
  ownData,
  allTickets,
  viewOpenTikcets,
  viewClosedTickets,
  viewAllMemos,
  viewMemo,
  viewCategories,
  viewCategory,
  viewPolicies,
  viewPolicy,
  viewEmployees,
  viewEmployeesLog,
  viewEmployeesNull
];

const ApiDocumentation = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint>(endpoints[0]);

  return (
    <div className="flex h-screen w-full bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-4">
        <h2 className="text-xl font-bold mb-4">API Endpoints</h2>
        <ul>
          {endpoints.map((endpoint) => (
            <li
              key={endpoint.name}
              onClick={() => setSelectedEndpoint(endpoint)}
              className={`cursor-pointer p-2 rounded mb-2 hover:bg-blue-100 ${
                selectedEndpoint.name === endpoint.name ? "bg-blue-200 font-semibold" : ""
              }`}
            >
              {endpoint.name}
            </li>
          ))}
        </ul>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        <h2 className="text-2xl font-bold mb-4">{selectedEndpoint.name}</h2>
        <h6 className="text-xl font-light mb-2">{selectedEndpoint.url}</h6>
        {selectedEndpoint.description && (
          <p className="mb-4 text-gray-700">{selectedEndpoint.description}</p>
        )}
        <h3 className="font-semibold mb-2">Example Response:</h3>
        <pre className="bg-gray-800 text-white p-6 rounded overflow-auto text-sm">
          {JSON.stringify(selectedEndpoint.sampleResponse, null, 2)}
        </pre>
      </main>
    </div>
  );
};

export default ApiDocumentation;
