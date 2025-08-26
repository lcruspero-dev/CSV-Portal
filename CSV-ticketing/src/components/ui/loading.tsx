import React from "react";

const Loading: React.FC = () => {
  return (
    <div className="flex items-center justify-center pt-64">
      <div className="relative">
        <div className="w-20 h-20 border-purple-200 border-2 rounded-full"></div>
        <div className="w-20 h-20 border-purple-700 border-t-2 animate-spin rounded-full absolute left-0 top-0"></div>
      </div>
      <div className="ml-4 text-xl font-semibold text-purple-700">Loading...</div>
    </div>
  );
};

export default Loading;
