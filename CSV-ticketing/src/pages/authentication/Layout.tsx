import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <section
      className="relative flex w-full items-center justify-center px-4 py-6 overflow-hidden"
    >      
            <Outlet />
    </section>
  );
};

export default Layout;