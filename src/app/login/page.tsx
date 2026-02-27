"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import LoginModal from "@/components/LoginModal";
import RegisterModal from "@/components/RegisterModal";

export default function LoginPortalPage() {
  const router = useRouter();
  const { user, role } = useAuth(); // <-- FIXED HERE

 const [showLogin, setShowLogin] = useState(false);
const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    if (user) {
      if (role === "admin") router.replace("/admin");
      else if (role === "author") router.replace("/author");
      else router.replace("/");
    }
  }, [user, role, router]);

return (
  <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50 px-4">

    <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-10 text-center space-y-6">

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-[#004265]">
          Author & Admin Portal
        </h1>
        <p className="text-gray-500 text-sm">
          Access your dashboard to manage content, users, and analytics.
        </p>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-200 w-full" />

      {/* Buttons */}
      <div className="flex flex-col gap-4">
        <button
          onClick={() => setShowLogin(true)}
          className="w-full py-3 bg-[#004265] text-white rounded-lg hover:opacity-90 transition font-medium"
        >
          Login
        </button>

        <button
          onClick={() => setShowRegister(true)}
          className="w-full py-3 border border-[#004265] text-[#004265] rounded-lg hover:bg-[#004265] hover:text-white transition font-medium"
        >
          Register
        </button>
      </div>

    </div>

    {/* Modals */}
    <LoginModal
      isOpen={showLogin}
      onClose={() => setShowLogin(false)}
      onSwitchToRegister={() => {
        setShowLogin(false);
        setShowRegister(true);
      }}
    />

    <RegisterModal
      isOpen={showRegister}
      onClose={() => setShowRegister(false)}
      onSwitchToLogin={() => {
        setShowRegister(false);
        setShowLogin(true);
      }}
    />
  </div>
);
}