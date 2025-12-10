import { Outlet } from "react-router-dom";
import Background from "../../assets/ChirstmasBG.png";

const Layout = () => {
  return (
    <section
      className="relative flex min-h-screen w-full items-center justify-center bg-cover bg-center bg-no-repeat px-4 py-6 overflow-hidden"
      style={{
        backgroundImage: `url(${Background})`,
      }}
    >
      {/* Animated Snowflakes */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute top-[-10px] animate-snow"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
              opacity: 0.5 + Math.random() * 0.5,
            }}
          >
            ❄️
          </div>
        ))}
      </div>

      {/* Twinkling Lights Overlay */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${4 + Math.random() * 8}px`,
              height: `${4 + Math.random() * 8}px`,
              backgroundColor: ['#ff0000', '#00ff00', '#ffffff', '#ffff00'][Math.floor(Math.random() * 4)],
              animationDelay: `${Math.random() * 2}s`,
              boxShadow: '0 0 10px currentColor',
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0 bg-black/10" />

      <div className="relative z-10 flex w-full max-w-5xl items-center justify-center">
        {/* Centered Form Container with subtle animation */}
        <div className="w-full max-w-md backdrop-blur-xl rounded-2xl shadow-2xl p-8 animate-[subtlePulse_4s_ease-in-out_infinite]">
          <Outlet />
        </div>
      </div>

      <style>{`
        @keyframes snow {
          0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        @keyframes subtlePulse {
          0%, 100% {
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          }
          50% {
            box-shadow: 0 25px 50px -12px rgba(220, 38, 38, 0.3);
          }
        }
        .animate-snow {
          animation: snow linear infinite;
        }
      `}</style>
    </section>
  );
};

export default Layout;