import { Outlet } from "react-router-dom";
import Background from "../../assets/bg.jpg";

const Layout = () => {
  return (
    <section
      className="relative flex min-h-screen w-full items-center justify-center bg-cover bg-center bg-no-repeat px-4 py-6"
      style={{
        backgroundImage: `url(${Background})`,
      }}
    >
      <div className="absolute inset-0 bg-black/20" />

      <div className="relative z-10 flex w-full max-w-5xl items-center justify-center">
        {/* Centered Form Container */}
        <div className="w-full max-w-md backdrop-blur-xl rounded-2xl shadow-2xl p-8">
          <Outlet />
        </div>
      </div>
    </section>
  );
};

export default Layout;
                            