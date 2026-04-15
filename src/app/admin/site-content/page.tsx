"use client";

import Link from "next/link";
import {
  FiHome,
  FiInfo,
  FiFolder,
  FiBookOpen,
  FiLifeBuoy,
  FiHeart,
} from "react-icons/fi";

import { IconType } from "react-icons";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import FooterModal from "@/components/admin/FooterModal";

interface Option {
  label: string;
  href: string;
  icon: IconType;
}

export default function SiteContentDashboard() {
  const { user, authReady } = useAuth();
  const [showFooterModal, setShowFooterModal] = useState(false);

  // Content management cards
  const contentOptions: Option[] = [
  {
    label: "Edit Home Page",
    href: "/admin/site-content/homepage",
    icon: FiHome,
  },
  {
    label: "Edit About Page",
    href: "/admin/site-content/about",
    icon: FiInfo,
  },
  {
    label: "Edit Projects Page",
    href: "/admin/site-content/projects",
    icon: FiFolder,
  },
  {
    label: "Edit Resources Page",
    href: "/admin/site-content/resources",
    icon: FiBookOpen,
  },
  {
    label: "Edit Support Page",
    href: "/admin/site-content/support",
    icon: FiLifeBuoy,
  },
  {
    label: "Edit Donation Page",
    href: "/admin/site-content/donate",
    icon: FiHeart,
  },
  {
  label: "Edit Footer",
  href: "#",
  icon: FiInfo, // or pick a better icon
},
];


  const renderCard = (option: Option) => {
  const Icon = option.icon;

  const isFooter = option.label === "Edit Footer";

  const handleClick = (e: React.MouseEvent) => {
    if (isFooter) {
      e.preventDefault();
      setShowFooterModal(true);
    }
  };

  return (
    <Link
      key={option.label}
      href={option.href}
      onClick={handleClick}
      className="flex flex-col items-center justify-center py-6 px-8 border hover:border-[#004265] bg-white/40 transition-colors duration-200 text-lg font-medium group text-center"
      style={{ minWidth: "200px", minHeight: "120px" }}
    >
      <Icon size={28} className="mb-2 group-hover:text-[#004265]" />
      <span>{option.label}</span>
    </Link>
  );
};
  // Show loading until Firebase has finished initializing
  if (!authReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="w-48 h-2 overflow-hidden">
          <div className="h-full w-full bg-[#004265] animate-pulse"></div>
        </div>
        <p className="mt-4 font-medium text-lg font-sans!">
          Loading site content…
        </p>
      </div>
    );
  }

  // Only show login message if initialized AND user is null
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl font-semibold font-sans!">
          You must be logged in to access this page.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 py-12 lg:px-8 font-sans!">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold mb-2 text-center font-sans!">
          Site Content Management
        </h1>
        <p className="text-xl! mb-8 text-center">
          Adjust the text, images, and structure of your public website pages.
        </p>

        {/* Content Management Section */}
        <div className="space-y-8">
          <div className="border shadow-md p-6 sm:p-8">
            <h2 className="text-2xl font-extrabold mb-6 text-center font-sans!">
              Manage Pages
            </h2>

            <div className="flex flex-wrap justify-center gap-4">
              {contentOptions.map(renderCard)}
            </div>
          </div>
        </div>
      </div>
      {showFooterModal && (
        <FooterModal onClose={() => setShowFooterModal(false)} />
      )}
    </div>
  );
}