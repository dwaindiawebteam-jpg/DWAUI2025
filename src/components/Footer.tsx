import React, { FC } from "react";
import Image from "next/image";

const Footer: FC = () => {
  return (
    <section className="">
      {/* donation */}
      <div className="relative flex flex-row font-inter gap-8 font-bold justify-end items-center bg-pink/41">
        <span className="justify-center text-purple">
          Ready to get involved?
        </span>
        <button className="py-4 px-6 md:mr-20 bg-purple text-white hover:bg-purple/80 transition-colors">
          Donate Now
        </button>
      </div>
      <div className="relative flex flex-col md:flex-row editor-content bg-teal-900">
        {/* logo and company name */}
        <div className="md:w-80 bg-blue relative flex flex-col justify-center items-center">
          <div className="flex flex-row md:flex-col mb-4 mt-5 md:mt-0">
            <div className="w-16 h-16">
              <Image
                src="/images/icon.jpg"
                alt="DWA Logo"
                width={60}
                height={60}
                className="rounded"
              />
            </div>
            <div>
              <h3 className="text-xl font-bold">DALIT</h3>
              <h3 className="text-navy-blue text-xl font-bold">WELFARE</h3>
            </div>
          </div>
        </div>

        {/* address and contact details */}
        <div className="px-15 py-15 w-full bg-navy-blue text-white relative flex flex-col justify-center">
          {/* content */}
          <div className=" relative flex  flex-col md:flex-row mb-6 justify-between gap-4 items-center md:items-start">
            {/* Left - Address and Contact */}
            <div className="flex flex-col  gap-12">
              {/* Address and Contact Details */}
              <div className="text-sm">
                <p># 4-84, Parnapalle,</p>
                <p>Nandyal, A.P, 518501, INDIA.</p>
                <br />
                <p>E-mail: info@dwalindia.org</p>
                <p>Phone: +91 83097 44864</p>
              </div>

              {/* Social Media Icons */}
              <div className="flex justify-center md:justify-start space-x-4">
                <a
                  href="#"
                  className="text-white hover:text-blue transition-colors" // change color
                  aria-label="Instagram"
                >
                  <svg
                    className="w-8 h-8"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-white hover:text-gray-300 transition-colors"
                  aria-label="LinkedIn"
                >
                  <svg
                    className="w-8 h-8"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-white hover:text-gray-300 transition-colors"
                  aria-label="Twitter/X"
                >
                  <svg
                    className="w-10 h-8"
                    fill="currentColor"
                    viewBox="0 0 57 47"
                  >
                    <path d="M54.6765 0H1.40196C0.630882 0 0 0.75 0 1.66667V43.3333C0 44.25 0.630882 45 1.40196 45H54.6765C55.4475 45 56.0784 44.25 56.0784 43.3333V1.66667C56.0784 0.75 55.4475 0 54.6765 0ZM51.3118 3.33333L28.0392 31L4.76667 3.33333H51.3118ZM2.80392 5.66667L16.9637 22.5L2.80392 39.3333V5.66667ZM4.83676 41.6667L18.9265 24.9167L27.0578 34.5833C27.6186 35.25 28.4598 35.25 29.0206 34.5833L37.152 24.9167L51.2417 41.6667H4.83676ZM53.2745 39.3333L39.1147 22.5L53.2745 5.66667V39.3333Z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* right - Accreditation */}
            <div className="flex flex-col">
              <h4 className="text-white text-lg font-semibold mb-4">
                Accreditations
              </h4>
              <div className="flex h-13 flex-row gap-4">
                <div className="bg-white px-3 flex items-center justify-center">
                  <Image
                    src="/images/homepage/Accrediations/give.do.png"
                    alt="Give.do"
                    width={80}
                    height={40}
                    className="object-contain"
                  />
                </div>
                <div className="bg-white px-2 flex items-center justify-center">
                  <Image
                    src="/images/homepage/Accrediations/GuideStarIndia.png"
                    alt="GuideStar India"
                    width={80}
                    height={40}
                    className="object-contain"
                  />
                </div>
              </div>
              <div className="flex h-13 flex-row gap-4 mt-4">
                <div className="bg-white flex items-center justify-center">
                  <Image
                    src="/images/homepage/Accrediations/benevity.png"
                    alt="Benevity"
                    width={120}
                    height={40}
                    className="object-contain"
                  />
                </div>
                <div className="bg-white px-2 flex items-center justify-center">
                  <Image
                    src="/images/homepage/Accrediations/goodstack.png"
                    alt="GoodStack"
                    width={100}
                    height={40}
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* policies */}
          <div className="mt-4 relative flex flex-row justify-between items-center">
            <a href="#" className="hover:underline pr-2">
              Refund Policy
            </a>
            <a href="#" className="hover:underline pr-2">
              Privacy Policy
            </a>
            <div>
              ©DWA INDIA 2026
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Footer;
