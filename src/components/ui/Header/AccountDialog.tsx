import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ConfirmDialog from "@/components/ui/confirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User } from "lucide-react";
import CenteredSpinner from "@/components/ui/spinners/centeredSpinner";
import React from "react";

export default function LoginDialog() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [captchaUrl, setCaptchaUrl] = useState("");
  const [loginError, setLoginError] = useState("");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState<Boolean>(false);

  interface UserData {
    user_name: string;
    user_data: string;
    user_image: string;
  }

  const handleOpenChange = async (isOpen: boolean) => {
    if (isOpen) {
      fetchCaptcha();
    } else {
      try {
        await fetch("/api/login/close", {
          method: "GET",
        });
        console.log("Puppeteer instance closed");
      } catch (error) {
        console.error("Failed to close Puppeteer:", error);
      }
    }
  };

  // Check if the user_acc cookie exists in localStorage and parse it
  useEffect(() => {
    const userAccCookie = localStorage.getItem("user_acc");
    if (userAccCookie) {
      try {
        // Decode and parse the user_acc cookie value
        const decodedCookie = decodeURIComponent(userAccCookie);
        const parsedData = JSON.parse(decodedCookie);

        // Set the user's name and data from the parsed user_acc cookie
        setUserData(parsedData);
      } catch (error) {
        console.error("Failed to parse user_acc cookie:", error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accountInfo");
    localStorage.removeItem("accountName");
    localStorage.removeItem("user_acc");
    setUserData(null); // Reset userData to trigger the login view again
    fetchCaptcha(); // Fetch a new CAPTCHA when logging out
  };

  // Fetch CAPTCHA when opening the dialog
  const fetchCaptcha = async () => {
    try {
      const response = await fetch("/api/login/captcha");
      const data = await response.json();
      setCaptchaUrl(data.captchaUrl);
    } catch (error) {
      setLoginError("Failed to fetch CAPTCHA.");
    }
  };

  // Submit login with CAPTCHA, username, and password
  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/login/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
          captcha,
        }),
      });

      const data = await response.json();
      if (data.success) {
        const userAccCookie = data.cookies.find(
          (cookie: { name: string }) => cookie.name === "user_acc"
        );

        if (userAccCookie) {
          localStorage.setItem("user_acc", userAccCookie.value);
          console.log("user_acc cookie saved:", userAccCookie.value);

          // Decode and parse the user_acc cookie value to update user data
          const decodedCookie = decodeURIComponent(userAccCookie.value);
          const parsedData = JSON.parse(decodedCookie);
          localStorage.setItem("accountInfo", parsedData.user_data);
          localStorage.setItem("accountName", parsedData.user_name);
          setUserData(parsedData);
        } else {
          console.error("user_acc cookie not found");
        }
      } else {
        setLoginError(data.error || "Login failed");
        fetchCaptcha();
      }
    } catch (error) {
      setLoginError("An error occurred during login.");
    }
    setIsLoading(false);
  };

  // If user data exists, display the user's name and user data, otherwise show the login dialog
  if (userData) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Account Information</DialogTitle>
          </DialogHeader>
          <div className="flex items-center space-x-4 mb-4 border-t">
            <div className="mt-4 w-full">
              <h2 className="text-xl font-bold">{userData.user_name}</h2>
              <label className="block text-sm font-medium mb-2 mt-2">
                User Data
              </label>
              <Input
                type="text"
                placeholder="User Data..."
                className="w-full"
                value={userData.user_data}
                readOnly
              />
              {/* Logout Button */}
              <ConfirmDialog
                triggerButton={
                  <Button
                    variant="outline"
                    className="mt-4 w-full bg-red-600 hover:bg-red-500"
                  >
                    Logout
                  </Button>
                }
                title="Confirm Logout"
                message="Are you sure you want to logout?"
                confirmLabel="Logout"
                confirmColor="bg-red-600 border-red-500 hover:bg-red-500"
                cancelLabel="Cancel"
                onConfirm={handleLogout}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Show the login form if the user is not logged in
  return (
    <Dialog onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <User className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        {isLoading && <CenteredSpinner />}
        {!isLoading && (
          <>
            <DialogHeader>
              <DialogTitle>Login</DialogTitle>
            </DialogHeader>
            <div className="flex items-center space-x-4 mb-4 border-t">
              <div className="mt-4 w-full">
                {/* Username Field */}
                <label className="block text-sm font-medium mb-2">
                  Username
                </label>
                <Input
                  type="text"
                  placeholder="Username..."
                  className="w-full"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />

                {/* Password Field */}
                <label className="block text-sm font-medium mb-2 mt-2">
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="Password..."
                  className="w-full"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                {/* CAPTCHA Field */}
                {!captchaUrl && <CenteredSpinner />}
                {captchaUrl && (
                  <div className="mt-4">
                    <img src={captchaUrl} alt="CAPTCHA" className="mb-2" />
                    <label className="block text-sm font-medium mb-2">
                      CAPTCHA
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter CAPTCHA..."
                      className="w-full"
                      value={captcha}
                      onChange={(e) => setCaptcha(e.target.value)}
                    />
                  </div>
                )}

                {/* Submit Button */}
                <Button className="mt-4 w-full" onClick={handleSubmit}>
                  Login
                </Button>

                {/* Error Message */}
                {loginError && (
                  <p className="text-red-500 text-sm mt-2">{loginError}</p>
                )}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
