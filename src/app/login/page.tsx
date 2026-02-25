"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import LoginModal from "@/components/LoginModal";
import RegisterModal from "@/components/RegisterModal";

export default function LoginPortalPage() {
  const router = useRouter();
  const { user, role } = useAuth(); // <-- FIXED HERE

  const [showLogin, setShowLogin] = useState(true);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    if (user) {
      if (role === "admin") router.replace("/admin");
      else if (role === "author") router.replace("/author");
      else router.replace("/");
    }
  }, [user, role, router]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F6F1E8] p-4">
      <LoginModal
        isOpen={showLogin}
        onClose={() => {}}
        onSwitchToRegister={() => {
          setShowLogin(false);
          setShowRegister(true);
        }}
      />

      <RegisterModal
        isOpen={showRegister}
        onClose={() => {}}
        onSwitchToLogin={() => {
          setShowRegister(false);
          setShowLogin(true);
        }}
      />
    </div>
  );
}