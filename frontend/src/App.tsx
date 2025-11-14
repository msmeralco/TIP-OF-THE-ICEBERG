import { useState } from "react";
import { Home } from "./components/Home";
import { Billing } from "./components/Billing";
import { AlertsPanel } from "./components/AlertsPanel";
import { Settings } from "./components/Settings";
import { Toaster } from "./components/ui/sonner";
import {
  HomeIcon,
  Receipt,
  Bell,
  SettingsIcon,
  Moon,
  Sun,
  User,
} from "lucide-react";
import { Button } from "./components/ui/button";
import { UserProfile } from "./components/UserProfile";

export default function App() {
  const [selectedTab, setSelectedTab] = useState<
    "home" | "billing" | "alerts" | "settings" | "profile"
  >("home");
  const [darkMode, setDarkMode] = useState(false);

  const tabs = [
    { id: "home" as const, label: "Home", icon: HomeIcon },
    { id: "billing" as const, label: "Billing", icon: Receipt },
    { id: "alerts" as const, label: "Alerts", icon: Bell },
    {
      id: "settings" as const,
      label: "Settings",
      icon: SettingsIcon,
    },
  ];

  return (
    <div
      className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gradient-to-br from-orange-50 via-orange-100/30 to-orange-50"}`}
    >
      <Toaster />

      {/* Header */}
      <header
        className={`sticky top-0 z-50 ${darkMode ? "bg-gradient-to-r from-gray-800 to-gray-900" : "bg-gradient-to-r from-orange-500 to-orange-600"} text-white shadow-lg`}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl tracking-tight">
                Project Alisto
              </h1>
              <p
                className={`${darkMode ? "text-gray-400" : "text-orange-100"} text-sm`}
              >
                Smart Fire Prevention and Energy Management
                System
              </p>
            </div>
            <div className="flex items-center gap-2">
              <nav className="flex gap-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        selectedTab === tab.id
                          ? darkMode
                            ? "bg-gray-700 text-white"
                            : "bg-white text-orange-600"
                          : darkMode
                            ? "bg-gray-800 hover:bg-gray-700"
                            : "bg-orange-600 hover:bg-orange-700"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">
                        {tab.label}
                      </span>
                    </button>
                  );
                })}
              </nav>

              {/* Dark Mode Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDarkMode(!darkMode)}
                className={`${darkMode ? "text-white hover:bg-gray-700" : "text-white hover:bg-orange-700"}`}
              >
                {darkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>

              {/* User Profile */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedTab("profile")}
                className={`${darkMode ? "text-white hover:bg-gray-700" : "text-white hover:bg-orange-700"} ${selectedTab === "profile" ? "bg-white/20" : ""}`}
              >
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {selectedTab === "home" && <Home darkMode={darkMode} />}
        {selectedTab === "billing" && (
          <Billing darkMode={darkMode} />
        )}
        {selectedTab === "alerts" && (
          <AlertsPanel darkMode={darkMode} />
        )}
        {selectedTab === "settings" && (
          <Settings darkMode={darkMode} />
        )}
        {selectedTab === "profile" && (
          <UserProfile darkMode={darkMode} />
        )}
      </main>
    </div>
  );
}

