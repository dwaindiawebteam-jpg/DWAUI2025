import React from 'react';

const InfoForm: React.FC = () => {
  return (
<section className="px-6 sm:px-12 md:px-20 lg:px-32 xl:px-48 pt-20 sm:pt-20 md:pt-16 pb-6">
  <div className="flex justify-center items-center gap-10 max-md:flex-col">
    <div className="w-1/2 max-md:w-full max-md:text-center">
      <h1 className="font-bold heading-responsive mb-8 -mt-10 md:-mt-20 lg:-mt-32">
        Get More Info
      </h1>

      <p className="font-medium text-xl max-lg:text-base w-3/4 max-md:w-full -mt-2">
        Let&apos;s get acquainted! Tell us a little bit about yourself and we&apos;ll send you information on how to get involved.
      </p>
    </div>

    <form className="w-full box-border mt-10">
      <div className="flex gap-10 items-center  max-md:flex-col max-md:gap-6">
        <div className="flex flex-col w-full gap-6">
          <input
            className="w-full outline-0 h-14 border-black border-b-2 
           text-lg font-medium text-black 
           placeholder:text-lg placeholder:text-black"
            type="text"
            placeholder="First Name"
          />
          <input
           className="w-full outline-0 h-14 border-black border-b-2 
           text-lg font-medium text-black 
           placeholder:text-lg placeholder:text-black"
            type="text"
            placeholder="Last Name"
          />
          <input
           className="w-full outline-0 h-14 border-black border-b-2 
           text-lg font-medium text-black 
           placeholder:text-lg placeholder:text-black"
            type="text"
            placeholder="Email"
          />
        </div>

        <div className="flex flex-col gap-6 w-full">
          <input
            className="w-full outline-0 h-14 border-black border-b-2 
           text-lg font-medium text-black 
           placeholder:text-lg placeholder:text-black"
            type="text"
            placeholder="Phone"
          />
          <input
            className="w-full outline-0 h-14 border-black border-b-2 
           text-lg font-medium text-black 
           placeholder:text-lg placeholder:text-black"
            type="text"
            placeholder="Address"
          />
          <input
            className="w-full outline-0 h-14 border-black border-b-2 
           text-lg font-medium text-black 
           placeholder:text-lg placeholder:text-black"
            type="text"
            placeholder="Get Involved →"
          />
        </div>
      </div>

      <div className="mt-10 flex justify-end pb-10">
        <button
          type="submit"
          className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 cursor-pointer font-bold text-xl py-3 px-4 
                    text-white bg-[#004265] hover:bg-[#004290] disabled:opacity-50"
        >
          Submit
        </button>
      </div>
    </form>
  </div>
</section>
  );
};

export default InfoForm;