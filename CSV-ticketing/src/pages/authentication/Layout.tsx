import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <section
      className="relative flex min-h-screen w-full items-center justify-center px-4 py-6 overflow-hidden"
    >      
      <div className="relative z-10 flex w-full max-w-5xl items-center justify-center">
        {/* Centered Form Container with enhanced glow */}
        <div className="w-full max-w-md rounded-2xl p-8 relative">
            <Outlet />
        </div>
      </div>
    </section>
  );
};

export default Layout;