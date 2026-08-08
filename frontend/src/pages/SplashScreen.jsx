import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Sparkles, ArrowRight } from 'lucide-react';
import image from '../assets/image.png';

const SplashScreen = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const loadingSteps = [
    'Verifying corporate identity...',
    'Matching optimal workplace routes...',
    'Synchronizing real-time telemetry...',
    'Ready for your commute',
  ];

  const handleNavigation = () => {
    setIsExiting(true);
    setTimeout(() => {
      navigate('/login');
    }, 400); // Matches the fade/scale exit animation duration
  };

  useEffect(() => {
    // Smooth progress bar counter
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1;
      });
    }, 30);

    // Dynamic step text switcher
    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < loadingSteps.length - 1) return prev + 1;
        clearInterval(stepInterval);
        return prev;
      });
    }, 800);

    // Redirect with exit animation after progress completes
    const timer = setTimeout(() => {
      handleNavigation();
    }, 3400);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
      clearTimeout(timer);
    };
  }, [navigate]);

  return (
    <div
      className={`relative min-h-screen w-full bg-gradient-to-b from-blue-50 via-white to-blue-50/50 flex flex-col items-center justify-between py-10 overflow-hidden font-sans select-none transition-all duration-500 ease-in-out ${
        isExiting ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-100/10 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle, #1e293b 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-md mx-auto my-auto">
        {/* Carpooling Illustration Image */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 mb-2 flex items-center justify-center">
          <img
            src={image}
            alt="Carpooling Illustration"
            className="w-full h-full object-contain drop-shadow-xl animate-fade-in"
          />
        </div>

        {/* Logo / Icon */}
        <div className="relative mb-6">
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-full blur-2xl" />
          <div className="relative w-20 h-20 bg-white rounded-2xl shadow-xl shadow-blue-500/10 flex items-center justify-center border border-blue-100/50">
            <Car className="w-10 h-10 text-blue-600 stroke-[1.5]" />
          </div>
        </div>

        {/* Brand Name */}
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 tracking-tight mb-2">
          CorpRide
        </h1>

        {/* Tagline */}
        <div className="flex flex-col items-center space-y-0.5 mb-3">
          <p className="text-lg sm:text-xl font-semibold text-slate-700 tracking-wide">
            Ride Together
          </p>
          <p className="text-lg sm:text-xl font-semibold text-blue-600 tracking-wide">
            Save Together
          </p>
        </div>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-slate-500 max-w-xs font-light">
          Smart corporate carpooling for sustainable and seamless workplace travel.
        </p>

        {/* Loading Status */}
        <div className="mt-6 flex items-center space-x-2 text-xs sm:text-sm text-slate-600 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-slate-200/50">
          <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
          <span className="font-medium">{loadingSteps[currentStepIndex]}</span>
        </div>
      </div>

      {/* Bottom Section with Progress */}
      <div className="relative z-10 px-8 max-w-md mx-auto w-full">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-200 ease-out shadow-lg shadow-blue-500/30"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-400 font-medium">
            <span>Loading</span>
            <span>{progress}%</span>
          </div>
        </div>

        {/* Skip Button */}
        <button
          onClick={handleNavigation}
          className="mt-4 text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center gap-1 mx-auto cursor-pointer"
        >
          <span>Skip</span>
          <ArrowRight className="w-3 h-3" />
        </button>

        {/* Footer */}
        <p className="text-center text-[10px] text-slate-400 font-medium mt-4">
          © {new Date().getFullYear()} CorpRide. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default SplashScreen;