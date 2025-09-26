import { Outlet } from "react-router-dom";
import loginImage from "../../assets/Customer-Service.gif";

const Layout = () => {
  return (
    <section className="container mx-auto flex min-h-[75vh] items-center justify-center px-4 py-6">
      <div className="grid w-full max-w-5xl grid-cols-1 items-center justify-center gap-12 lg:grid-cols-2">

        {/* Left Column - Form Content */}
        <div className="order-2 flex w-full justify-center lg:order-1">
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </div>

        {/* Right Column - Title & Image */}
        <div className="order-1 flex flex-col items-center justify-center lg:order-2">
          <img
            src={loginImage}
            alt="Login"
            className="hidden lg:block w-full max-w-md lg:max-w-lg"
          />
        </div>

      </div>
    </section>
  );
};

export default Layout;  