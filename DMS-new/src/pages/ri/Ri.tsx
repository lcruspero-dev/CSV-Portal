import React from "react";

const UnderMaintenance: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-white from-gray-800 via-gray-900 to-black text-white">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
          🛠️ Under Maintenance!
        </h1>
        <p className="text-lg md:text-xl text-gray-600">
          Report incident option is under maintenance. Please check back soon.
          Thank you!
        </p>
      </div>
    </div>
  );
};

export default UnderMaintenance;
