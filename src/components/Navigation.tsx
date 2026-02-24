import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";
import { FC } from "react";

const Navigation: FC = () => {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-3">
              <Image
                src="/images/icon.jpg"
                alt="Dalit Welfare Association"
                width={48}
                height={48}
                className="h-12 w-12"
              />
              <div className="flex flex-col">
                <span className="text-lg font-bold text-gray-900">DALIT</span>
                <span className="text-lg font-bold text-gray-900">WELFARE</span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:block">
          <div className="ml-10 flex items-baseline space-x-8">
            <Link
              href="/about"
              className="relative group px-3 py-2 text-sm font-medium"
            >
              <span className="relative pb-1 text-gray-900 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-gray-900 after:transition-all after:duration-300 group-hover:after:w-full">
                About Us
              </span>
            </Link>

            <Link
              href="/projects"
              className="relative group px-3 py-2 text-sm font-medium"
            >
              <span className="relative pb-1 text-gray-900 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-gray-900 after:transition-all after:duration-300 group-hover:after:w-full">
                Projects
              </span>
            </Link>

            <Link
              href="/resources"
              className="relative group px-3 py-2 text-sm font-medium"
            >
              <span className="relative pb-1 text-gray-900 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-gray-900 after:transition-all after:duration-300 group-hover:after:w-full">
                Resources
              </span>
            </Link>

            <Link
              href="/support"
              className="relative group px-3 py-2 text-sm font-medium"
            >
              <span className="relative pb-1 text-gray-900 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-gray-900 after:transition-all after:duration-300 group-hover:after:w-full">
                Support
              </span>
            </Link>

            <Link
              href="/blog"
              className="relative group px-3 py-2 text-sm font-medium"
            >
              <span className="relative pb-1 text-gray-900 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-gray-900 after:transition-all after:duration-300 group-hover:after:w-full">
                Blog
              </span>
            </Link>
          </div>
          </div>

          {/* CTA Button */}
          <div className="flex items-center">
          <Button asChild className="bg-[#FF9DF0] hover:bg-[#FF9DF0]/80 text-black px-4 py-6 rounded-none font-semibold">
            <Link href="/donate">Donate Now</Link>
          </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;