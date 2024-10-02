"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { debounce } from "lodash";
import { Search, Bookmark, User, Moon, Sun, Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CenteredSpinner from "@/components/ui/spinners/centeredSpinner";
import LoginDialog from "./ui/Header/AccountDialog";
import Icon from "./ui/Header/Icon";

interface Manga {
  id: string;
  image: string;
  title: string;
  chapter: string;
  chapterUrl: string;
  rating: string;
  author: string;
}

// Custom hook for managing theme
const useTheme = () => {
  const [theme, setTheme] = useState<string | null>(null);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") || "light";
    setTheme(storedTheme);
    document.documentElement.classList.toggle("dark", storedTheme === "dark");
  }, []);

  useEffect(() => {
    if (theme) {
      document.documentElement.classList.toggle("dark", theme === "dark");
      localStorage.setItem("theme", theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return { theme, toggleTheme };
};

// Hook to manage account information input
const useAccountInfo = () => {
  const [accountInfo, setAccountInfo] = useState<string>("");

  useEffect(() => {
    const storedAccountInfo = localStorage.getItem("accountInfo") || "";
    setAccountInfo(storedAccountInfo);
  }, []);

  return { accountInfo, setAccountInfo };
};

// Hook to manage settings
const useSettings = () => {
  const [settings, setSettings] = useState<{ fetchMalImage: boolean }>(() => {
    // Initialize from localStorage or return default values
    if (typeof window !== "undefined") {
      const storedSettings = localStorage.getItem("settings");
      return storedSettings
        ? JSON.parse(storedSettings)
        : { fetchMalImage: true };
    }
    return { fetchMalImage: true }; // Default settings in case window is not defined
  });

  useEffect(() => {
    // Only set localStorage if we're in a browser environment
    if (typeof window !== "undefined") {
      localStorage.setItem("settings", JSON.stringify(settings));
    }
  }, [settings]);

  return { settings, setSettings };
};

export function HeaderComponent() {
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [notification, setNotification] = useState("");
  const { theme, toggleTheme } = useTheme();
  const { accountInfo, setAccountInfo } = useAccountInfo();
  const { settings, setSettings } = useSettings();
  const popupRef = useRef<HTMLDivElement | null>(null);

  // Debounce function for fetching search results
  const debouncedFetchResults = useCallback(
    debounce(async (query) => {
      if (query) {
        setIsSearchLoading(true);
        setShowPopup(true);
        try {
          const res = await fetch(
            `/api/search?search=${query.replaceAll(" ", "_")}`
          );
          const data = await res.json();
          const firstFiveResults = data.mangaList.slice(0, 5);
          setSearchResults(firstFiveResults);
        } catch (error) {
          console.error("Error fetching search results:", error);
        } finally {
          setIsSearchLoading(false);
        }
      } else {
        setSearchResults([]);
        setShowPopup(false);
      }
    }, 500), // 500ms debounce delay
    []
  );

  // Handle search input changes
  const handleSearchInputChange = (e: { target: { value: any } }) => {
    const query = e.target.value;
    setSearchText(query);
    debouncedFetchResults(query);
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (
      popupRef.current &&
      !popupRef.current.contains(e.relatedTarget as Node)
    ) {
      setShowPopup(false);
    }
  };

  const fetchNotification = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/bookmarks/notification?user_data=${accountInfo}`
      );
      const data = await res.json();
      setNotification(data);
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  }, [accountInfo]);

  const debouncedFetchNotification = useCallback(
    debounce(fetchNotification, 10),
    [fetchNotification]
  );

  useEffect(() => {
    if (accountInfo) {
      debouncedFetchNotification();
    }

    // Cleanup to cancel the debounced function when the component unmounts or dependencies change
    return () => {
      debouncedFetchNotification.cancel();
    };
  }, [accountInfo, debouncedFetchNotification]);

  return (
    <header className="sticky top-0 z-50 bg-background border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold title">
          <Icon />
        </Link>

        <div className="flex items-center space-x-4">
          <div className="relative xl:w-128 lg:w-96 ml-6 sm:w-auto">
            <Input
              type="search"
              placeholder="Search manga..."
              value={searchText}
              onChange={handleSearchInputChange}
              onBlur={handleInputBlur}
              onFocus={() => searchResults.length > 0 && setShowPopup(true)}
              className="w-full"
            />
            {showPopup && (
              <Card ref={popupRef} className="absolute z-10 w-full mt-1">
                <CardContent className="p-2">
                  {isSearchLoading ? (
                    <CenteredSpinner />
                  ) : searchResults.length > 0 ? (
                    searchResults.map((result: Manga) => (
                      <Link
                        href={`/manga/${result.id}`}
                        key={result.id}
                        className="block p-2 hover:bg-accent flex items-center rounded-lg"
                      >
                        <img
                          src={result.image}
                          alt={result.title}
                          className="max-h-24 w-auto rounded mr-2"
                        />
                        {result.title}
                      </Link>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground p-4">
                      No Results
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
          <Link href="/bookmarks">
            <div className="relative group">
              <Button
                variant="ghost"
                size="icon"
                className="group-hover:bg-accent"
              >
                <Bookmark className="h-5 w-5" />
              </Button>
              {/* Badge element */}
              {notification && (
                <span
                  className="absolute bg-red-500 text-white text-xs font-bold rounded-full px-2 h-5 flex items-center justify-center transform translate-x-1/4 translate-y-1/4"
                  style={{ bottom: "0", right: "0" }}
                >
                  {notification}
                </span>
              )}
            </div>
          </Link>

          {/* Account Information Dialog */}
          <LoginDialog />

          {/* Settings Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Settings</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col space-y-4 border-t">
                <div className="flex items-center justify-start gap-2">
                  <label className="block text-sm font-medium mb-2 mt-2">
                    Fetch MAL Image:
                  </label>
                  <Input
                    type="checkbox"
                    checked={settings.fetchMalImage}
                    onChange={(e) =>
                      setSettings((prevSettings: any) => ({
                        ...prevSettings,
                        fetchMalImage: e.target.checked,
                      }))
                    }
                    className="h-4 w-auto"
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Theme Toggle Button */}
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "light" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
