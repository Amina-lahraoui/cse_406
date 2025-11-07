import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Scan, Package, Settings, User, LogOut, Languages, Bell, Shield, Utensils, ChevronRight } from "lucide-react";

export default function Home() {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const toggleLanguage = () => {
        const newLang = i18n.language === "en" ? "kr" : "en";
        i18n.changeLanguage(newLang);
    };

    const { logout } = useAuth();
    const handleLogout = () => {
        logout();
        navigate("/");
    };
        
    const handleNavigation = () => {
        navigate("/capture");
    };


    const [showSettings, setShowSettings] = useState(false);
    const [settings, setSettings] = useState({
        dietaryPreferences: "none",
        notifications: "daily",
        language: "en",
        privacyMode: false
    });

    const mainCards = [
        {
            id: "face-scan",
            title: t("home.faceScan.title"),
            description: t("home.faceScan.description"),
            icon: Scan,
            gradient: "from-purple-500 to-pink-500",
            path: "/face-scan"
        },
        {
            id: "inventory",
            title: t("home.inventory.title"),
            description: t("home.inventory.description"),
            icon: Package,
            gradient: "from-emerald-500 to-teal-500",
            path: "/inventory"
        }
    ];

    const settingsOptions = [
        {
            id: "dietaryPreferences",
            title: t("settings.dietary.title"),
            description: t("settings.dietary.description"),
            icon: Utensils,
            value: settings.dietaryPreferences,
            type: "select",
            options: [
                { value: "none", label: t("settings.dietary.none") },
                { value: "vegetarian", label: t("settings.dietary.vegetarian") },
                { value: "vegan", label: t("settings.dietary.vegan") },
                { value: "gluten-free", label: t("settings.dietary.glutenFree") }
            ]
        },
        {
            id: "notifications",
            title: t("settings.notifications.title"),
            description: t("settings.notifications.description"),
            icon: Bell,
            value: settings.notifications,
            type: "select",
            options: [
                { value: "realtime", label: t("settings.notifications.realtime") },
                { value: "daily", label: t("settings.notifications.daily") },
                { value: "weekly", label: t("settings.notifications.weekly") },
                { value: "off", label: t("settings.notifications.off") }
            ]
        },
        {
            id: "language",
            title: t("settings.language.title"),
            description: t("settings.language.description"),
            icon: Languages,
            value: settings.language,
            type: "select",
            options: [
                { value: "en", label: "English" },
                { value: "kr", label: "한국어" }
            ]
        },
        {
            id: "privacyMode",
            title: t("settings.privacy.title"),
            description: t("settings.privacy.description"),
            icon: Shield,
            value: settings.privacyMode,
            type: "toggle"
        }
    ];

    const handleSettingChange = (id: string, value: any) => {
        setSettings(prev => ({ ...prev, [id]: value }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-stone-200">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                <User className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">{t("home.welcome")}</h1>
                                <p className="text-sm text-gray-500">{t("home.subtitle")}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={toggleLanguage}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <Languages className="w-6 h-6 text-gray-700" />
                            </button>
                            <button
                                onClick={() => setShowSettings(!showSettings)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <Settings className="w-6 h-6 text-gray-700" />
                            </button>
                            <button
                                onClick={handleLogout}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <LogOut className="w-6 h-6 text-gray-700" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {!showSettings ? (
                    <>
                        {/* Main Interaction Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {mainCards.map((card) => {
                                const Icon = card.icon;
                                return (
                                    <div
                                        key={card.id}
                                        onClick={() => handleNavigation(card.path)}
                                        className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                                    >
                                        <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                                        <div className="p-8">
                                            <div className={`w-16 h-16 bg-gradient-to-br ${card.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                                <Icon className="w-8 h-8 text-white" />
                                            </div>
                                            <h2 className="text-2xl font-bold text-gray-900 mb-3">{card.title}</h2>
                                            <p className="text-gray-600 mb-4">{card.description}</p>
                                            <div className="flex items-center text-sm font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
                                                <span>{t("home.getStarted")}</span>
                                                <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">{t("home.quickStats")}</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center p-4 bg-purple-50 rounded-xl">
                                    <p className="text-3xl font-bold text-purple-600">0</p>
                                    <p className="text-sm text-gray-600 mt-1">{t("home.stats.scans")}</p>
                                </div>
                                <div className="text-center p-4 bg-emerald-50 rounded-xl">
                                    <p className="text-3xl font-bold text-emerald-600">0</p>
                                    <p className="text-sm text-gray-600 mt-1">{t("home.stats.items")}</p>
                                </div>
                                <div className="text-center p-4 bg-pink-50 rounded-xl">
                                    <p className="text-3xl font-bold text-pink-600">0</p>
                                    <p className="text-sm text-gray-600 mt-1">{t("home.stats.recommendations")}</p>
                                </div>
                                <div className="text-center p-4 bg-teal-50 rounded-xl">
                                    <p className="text-3xl font-bold text-teal-600">0</p>
                                    <p className="text-sm text-gray-600 mt-1">{t("home.stats.alerts")}</p>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    /* Settings Panel */
                    <div className="space-y-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">{t("settings.title")}</h2>
                            <button
                                onClick={() => setShowSettings(false)}
                                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                            >
                                {t("settings.back")}
                            </button>
                        </div>

                        {settingsOptions.map((option) => {
                            const Icon = option.icon;
                            return (
                                <div key={option.id} className="bg-white rounded-2xl shadow-lg p-6">
                                    <div className="flex items-start space-x-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-gray-900 mb-1">{option.title}</h3>
                                            <p className="text-sm text-gray-600 mb-4">{option.description}</p>
                                            
                                            {option.type === "select" && (
                                                <select
                                                    value={option.value as string}
                                                    onChange={(e) => handleSettingChange(option.id, e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                >
                                                    {option.options?.map((opt) => (
                                                        <option key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            )}

                                            {option.type === "toggle" && (
                                                <button
                                                    onClick={() => handleSettingChange(option.id, !option.value)}
                                                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                                                        option.value ? "bg-purple-600" : "bg-gray-300"
                                                    }`}
                                                >
                                                    <span
                                                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                                                            option.value ? "translate-x-7" : "translate-x-1"
                                                        }`}
                                                    />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <button
                                onClick={() => {
                                    alert("Settings saved!");
                                    setShowSettings(false);
                                }}
                                className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
                            >
                                {t("settings.save")}
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}