"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";
import { FC, useState } from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Avatar from "@/components/Avatar";

const Navigation: FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="flex items-center space-x-3"
              onClick={closeMobileMenu}
            >
              <Image
                src="/images/icon.jpg"
                alt="Dalit Welfare Association"
                width={48}
                height={48}
                className="h-12 w-12"
              />
              <div className="flex flex-col">
                <span className="text-lg font-bold text-gray-900">DALIT</span>
                <span className="text-lg font-bold text-[#004265]">
                  WELFARE
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {[
                { href: "/about", label: "About Us" },
                { href: "/projects", label: "Projects" },
                { href: "/resources", label: "Resources" },
                { href: "/support", label: "Support" },
                { href: "/blog", label: "Blog" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative group px-3 py-2 text-sm font-medium"
                >
                  <span className="relative pb-1 text-gray-900 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-gray-900 after:transition-all after:duration-300 group-hover:after:w-full">
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            
            {/* Donate Button */}
            <Button
              asChild
              className="bg-[#E6A4F9] hover:bg-[#E6A4F9]/80 text-black px-4 py-6 rounded-none font-semibold"
            >
              <Link href="/donate">Donate Now</Link>
            </Button>

            {/* Desktop Profile (only when logged in) */}
            {user && (
              <div className="hidden md:flex items-center ml-12">
                <ul className="flex gap-3">
                  <li className="relative group">
                    
                    {/* Avatar */}
                    <div className="cursor-pointer flex items-center justify-center">
                      <Avatar
                        firstName={user?.firstName}
                        lastName={user?.lastName}
                        initials={user?.initials}
                        size={40}
                      />
                    </div>

                    {/* Dropdown */}
                    <ul
                      className="absolute right-[-80px] mt-4 w-52 bg-white border border-gray-200 text-gray-900 rounded-md shadow-lg py-1
                      opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50
                      text-sm font-medium"
                    >
                      <li className="px-4 py-2 border-b border-gray-200 select-none cursor-default">
                        Hello, {user?.firstName || "User"}
                      </li>

                      <li className="px-4 py-2 hover:bg-gray-100 transition-colors">
                        <Link
                          href="/dashboard"
                          className="block w-full h-full"
                        >
                          Dashboard
                        </Link>
                      </li>

                      <li
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors"
                        onClick={logout}
                      >
                        Log Out
                      </li>
                    </ul>

                  </li>
                </ul>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 inset-x-0 bg-white border-b border-gray-200 shadow-lg">
          <div className="px-4 pt-2 pb-4 space-y-2">
            {[
              { href: "/about", label: "About Us" },
              { href: "/projects", label: "Projects" },
              { href: "/resources", label: "Resources" },
              { href: "/support", label: "Support" },
              { href: "/blog", label: "Blog" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobileMenu}
                className="block px-3 py-3 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-md transition-colors duration-200"
              >
                {item.label}
              </Link>
            ))}

            {/* Mobile Donate */}
            <div className="pt-2">
              <Button
                asChild
                className="w-full bg-[#FF9DF0] hover:bg-[#FF9DF0]/80 text-black font-semibold"
              >
                <Link href="/donate" onClick={closeMobileMenu}>
                  Donate Now
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;