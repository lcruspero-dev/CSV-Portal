import { Outlet } from "react-router-dom";
import loginImage from "../../assets/Customer-Service.gif";

const Layout = () => {
  return (
    <div className="container mx-auto py-5">
      <h1 className="text-5xl font-bold text-center mt-8 bg-gradient-to-r from-gray-900 via-blue-600 to-gray-900 text-transparent bg-clip-text drop-shadow-2xl tracking-wide">
        Employee Portal
      </h1>

      <div className="grid grid-cols-2  justify-center items-center drop-shadow-lg">
        <div className="mr-10">
          <Outlet />
        </div>
        <div>
          <img src={loginImage} alt="Login" width={500} height={500} />
        </div>
      </div>
    </div>
  );
};

export default Layout;
