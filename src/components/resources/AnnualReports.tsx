import React from 'react';

interface Report {
  year: number;
  url: string;
}

interface AnnualReportsProps {
  reports: Report[];
}

const AnnualReports: React.FC<AnnualReportsProps> = ({ reports }) => {
  const handleDownload = (url: string) => {
    // Open the file in a new tab
    window.open(url, '_blank');
  };

  return (
    <section className="py-12 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="heading-responsive font-bold text-black mb-12">
          Annual Reports
        </h2>
        
        <div className="flex flex-wrap gap-4">
          {reports.map((report) => (
          <a
            key={report.year}
            href={report.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#622676] hover:bg-[#7a3091] text-white font-bold text-2xl px-12 py-4 inline-block"
          >
            {report.year}
          </a>
        ))}
                </div>
      </div>
    </section>
  );
};

export default AnnualReports;