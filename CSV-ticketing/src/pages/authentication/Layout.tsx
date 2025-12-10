import { Outlet } from "react-router-dom";
import Background from "../../assets/holidayBG.png";

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

      {/* Gradient Light Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-red-500/5" />
      
      {/* Soft Glow Effect */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-red-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-green-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Light Rays Effect */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-[1px] h-64 bg-gradient-to-b from-transparent via-white/30 to-transparent animate-ray"
            style={{
              left: `${(i + 1) * 12.5}%`,
              transform: `rotate(${i * 45}deg)`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* Floating Orbs */}
      <div className="absolute inset-0">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
              width: `${60 + Math.random() * 100}px`,
              height: `${60 + Math.random() * 100}px`,
              backgroundColor: i % 2 === 0 ? 'rgba(59, 130, 246, 0.03)' : 'rgba(239, 68, 68, 0.03)',
              filter: 'blur(40px)',
              animationDelay: `${i * 2}s`,
              animationDuration: `${15 + Math.random() * 15}s`,
            }}
          />
        ))}
      </div>

      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(to right, white 1px, transparent 1px),
                             linear-gradient(to bottom, white 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/5" />

      <div className="relative z-10 flex w-full max-w-5xl items-center justify-center">
        {/* Centered Form Container with enhanced glow */}
        <div className="w-full max-w-md backdrop-blur-xl rounded-2xl p-8 animate-[subtlePulse_4s_ease-in-out_infinite] relative">
          {/* Container Glow Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-red-500/20 to-green-500/20 rounded-2xl blur-xl opacity-75 animate-pulse" style={{ animationDuration: '3s' }} />
          <div className="relative bg-white/90 dark:bg-gray-800/90 rounded-xl shadow-2xl">
            <Outlet />
          </div>
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
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5),
                        0 0 60px rgba(59, 130, 246, 0.1);
          }
          50% {
            box-shadow: 0 25px 50px -12px rgba(220, 38, 38, 0.3),
                        0 0 80px rgba(239, 68, 68, 0.2);
          }
        }
        
        @keyframes ray {
          0%, 100% {
            opacity: 0;
            transform: rotate(var(--rotation)) translateY(-100px);
          }
          50% {
            opacity: 0.5;
            transform: rotate(var(--rotation)) translateY(100px);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.3;
          }
          33% {
            transform: translate(30px, -30px) scale(1.1);
            opacity: 0.5;
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
            opacity: 0.2;
          }
        }
        
        .animate-snow {
          animation: snow linear infinite;
        }
        
        .animate-ray {
          animation: ray 8s ease-in-out infinite;
          --rotation: 0deg;
        }
        
        .animate-float {
          animation: float ease-in-out infinite;
        }
        
        /* Add subtle texture to background */
        .bg-texture {
          background-image: 
            radial-gradient(circle at 25% 25%, rgba(255,255,255,0.05) 1px, transparent 1px),
            radial-gradient(circle at 75% 75%, rgba(255,255,255,0.05) 1px, transparent 1px);
          background-size: 50px 50px;
        }
      `}</style>
    </section>
  );
};

export default Layout;