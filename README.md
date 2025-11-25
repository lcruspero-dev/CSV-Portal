# CSV Portal

This software serves as a comprehensive internal management solution. It features an integrated ticketing system for IT and HR support, tools for distributing employee notices, memos, 
and policies, as well as modules for shift attendance tracking, employee profile management, data exporting, and accurate timekeeping.

# MERN + Typescript Stack Application 
This is MERN application that uses MongoDB, Express, React(with Vite), and Node.js.

# Tools 
Postman
Axios
Tailwindcss

## 🚀 Getting Started

Follow these instructions to set up the project locally:

### 📦 Clone the Repository

```bash
git clone <repository-url>
cd <repository-directory>
```
### 📁 Install Dependencies

#### For the backend
```bash
cd CTS-API 
npm install
```


#### For the client
```bash
cd CSV-ticketing 
npm install
```

#### Configure Environment Variables
Create a .env file in the project root directory and add the following variables. Modify the values as needed.

## CTS-API
Backend .env configuration
```bash
NODE_ENV = development
PORT = <Your Port>
MONGODB_URL= <Connection String>
JWT_SECRET= <JWT KEY>
RESET_SECRET_KEY= <For reset passwords>
UPDATE_SECRET_KEY= <For time scrubbing>
```

## IMPORT-FILES-API
To use the Import Files API, no additional .env configuration is required.
You only need to set up your own server where both the CTS-API and CSV-Ticketing systems are properly connected.

Below is the CORS configuration example.
Make sure to update the origin values according to your server’s URL:
```bash
const corsOptions = {
  origin: ["http://localhost:<PORT>", "http://localhost:<PORT>"],
  credentials: true,
  optionsSuccessStatus: 200,
};

Need to update the origin http
```


## CSV-Tickeing 
#### Local Development (your machine)
When you are running the app locally
```bash
VITE_BASE_URL="http://localhost"
VITE_UPLOADFILES_URL="localhost"
```
## Run the Application in development mode

Start both the backend and frontend servers.

### Backend

Navigate to the `CTS-API` directory and start the backend server.

```sh
cd CTS-API/
npm run server
```

### Frontend

Navigate to the `CSV-ticketing` directory and start the frontend server.

```sh
cd CSV-ticketing/
npm run dev
```

## Running the Application in Production
This guide explains how to deploy your application on a production server, either using IIS or a server with its own IP/domain, with pm2 managing your backend processes.

## 1.Update Environment Variables
Before running the application, ensure your environment variables reflect your production server’s IP address or domain.
Update the .env file (or environment configuration) as follows:

```
VITE_BASE_URL="http://<SERVER_IP_OR_DOMAIN>"
VITE_UPLOADFILES_URL="http://<SERVER_IP_OR_DOMAIN>:4000"
```
Replace <SERVER_IP_OR_DOMAIN> with your actual server IP address or domain name.
Ensure the backend port (4000 in this example) matches your server configuration.

## 2. Prepare the Server
### 2.1 Install Node.js and pm2
If not already installed, install Node.js on your server. Then, install pm2 globally:
```
npm install -g pm2
```

### 2.2 Install Node.js and pm2
If not already installed, install Node.js on your server. Then, install pm2 globally:
```
cd /path/to/your/backend
```

## 3. Run the Backend Using pm2
Start your backend server with pm2:
```
pm2 start server.js --name csv-backend
```
server.js is your backend entry file (adjust if different).
csv-backend is the process name (can be customized).
### 3.1 Optional: Enable Auto Restart on Server Reboot
```
pm2 startup
pm2 save
```
## 4.Configure IIS 
If you are using IIS to host your frontend:
Open IIS Manager.
Create a new Website pointing to your frontend build folder.
Update the Bindings to match your server’s IP/domain.
Ensure that requests to the backend API are allowed via CORS and that the backend port (e.g., 4000) is open in your firewall.

## 5. Test the Application
Visit http://<SERVER_IP_OR_DOMAIN> to check your frontend.
Verify backend connectivity at http://<SERVER_IP_OR_DOMAIN>:4000.
Ensure all API endpoints, file uploads, and ticketing features are functioning.

## 6. Notes
For production, it’s recommended to use HTTPS for secure communication.
Make sure firewall rules allow the backend port.
Always monitor your pm2 processes:
```
pm2 list
pm2 logs csv-backend
```










