import { useState } from "react";
import { 
  loginResponse, 
  registerResponse, 
  allEmailsResponse,
  fetchOwnEmailResponse,

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



const endpoints: Endpoint[] = [
  login, 
  register,
  emails,
  ownData
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
