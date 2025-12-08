import { useState } from "react";

interface Endpoint {
  name: string;
  description?: string;
  sampleResponse: object; // Example JSON stored in the code
}

// Define endpoints with example responses
const login: Endpoint = {
  name: "Login",
  description: "Authenticate a user",
  sampleResponse: {
    "_id": "693722663e37577b33f4e144",
    "name": "CSVtest",
    "email": "csvnow@gmail.com",
    "isAdmin": false,
    "role": "user",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MzcyMjY2M2UzNzU3N2IzM2Y0ZTE0NCIsImlzQWRtaW4iOmZhbHNlLCJuYW1lIjoiQ1NWdGVzdCIsImlhdCI6MTc2NTIyMDk2NiwiZXhwIjoxNzY3ODEyOTY2fQ.6nd1yH-Er43M00DhNukCZU39i8sulEt0D5MJOwqX7a0",
    "loginLimit": 1
  }
};

const register: Endpoint = {
  name: "Register",
  description: "Create a new user",
  sampleResponse: {
    "id": "123456",
    "username": "newuser",
    "email": "newuser@example.com",
    "role": "user"
  }
};

const endpoints: Endpoint[] = [login, register];

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
