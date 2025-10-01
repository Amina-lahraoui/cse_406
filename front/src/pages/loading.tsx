import { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import { MapPin, Languages } from 'lucide-react';

export default function Loading() {
  const { t, i18n } = useTranslation();
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [showLoader, setShowLoader] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "kr" : "en";
    i18n.changeLanguage(newLang);
  };

  useEffect(() => {
    const loadingTimer = setTimeout(() => {
      setTimeout(() => {
        setIsTransitioning(true);
        setTimeout(() => {
          setIsDarkTheme(false);
          setTimeout(() => {
            setIsTransitioning(false);
            setShowLoader(true);
          }, 100);
        }, 500);
      }, 500);
    }, 100);

    return () => clearTimeout(loadingTimer);
  }, []);

  return (
    <>
      <style>{`
        .loader {
          width: 100px;
          aspect-ratio: 1;
          display: grid;
          border: 4px solid #0000;
          border-radius: 50%;
          border-color: #ccc #0000;
          animation: l16 1s infinite linear;
        }
        
        .loader::before,
        .loader::after {
          content: "";
          grid-area: 1/1;
          margin: 2px;
          border: inherit;
          border-radius: 50%;
        }
        
        .loader::before {
          border-color: #f03355 #0000;
          animation: inherit;
          animation-duration: .5s;
          animation-direction: reverse;
        }
        
        .loader::after {
          margin: 8px;
        }
        
        @keyframes l16 {
          100% {
            transform: rotate(1turn);
          }
        }
      `}</style>

      <div className="relative w-full h-screen overflow-hidden">
        <div className={`absolute inset-0 transition-opacity duration-1000 ${isDarkTheme ? 'opacity-100' : 'opacity-0'}`}>
          <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 relative overflow-hidden">
            <div className="absolute inset-0">
              <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-20 right-20 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>
          </div>
        </div>

        <div className={`absolute inset-0 transition-opacity duration-1000 ${isDarkTheme ? 'opacity-0' : 'opacity-100'}`}>
          <div className="min-h-screen bg-gradient-to-br from-stone-200 via-gray-300 to-stone-400 relative overflow-hidden">
            <div className="absolute inset-0">
              <div className="absolute top-20 left-20 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-20 right-20 w-96 h-96 bg-stone-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gray-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>
          </div>
        </div>

        <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform transition-all duration-1000 ${isTransitioning ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}></div>

        <header className="relative z-20 pt-4 px-6">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 transition-colors duration-1000 ${
                isDarkTheme ? 'text-white/80' : 'text-gray-700'
              }`}>
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{t("index.location")}</span>
              </div>
            </div>
            <div className={`flex items-center px-3 py-2 rounded-full p-1 cursor-pointer transition-all duration-300 ${
              isDarkTheme ? 'text-white/80 hover:bg-white/5' : 'text-gray-700 hover:bg-black/5'
            }`}>
              <Languages onClick={toggleLanguage} className="w-6 h-6" />
            </div>
          </div>
        </header>

        {showLoader && (
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="loader mb-4"></div>
            <p className={`${isDarkTheme ? 'text-white/80 hover:bg-white/5' : 'text-gray-700 hover:bg-black/5'} text-lg`}>{t("index.common.loading")}</p>
          </div>
        </div>)}
      </div>
    </>
  );
};
