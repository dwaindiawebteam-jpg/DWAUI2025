"use client";

import React, { useState, useEffect } from "react";

// Define props interface for the main component
interface ImpactStatsProps {
  bgColor?: string;    // can be Tailwind class OR hex code
  textColor?: string; // can be Tailwind class OR hex code
}

// Define props interface for the StatCard component
interface StatCardProps {
  endValue: number;
  label: string;
  prefix?: string;
  suffix?: string;
  textColor?: string;
}

const ImpactStats: React.FC<ImpactStatsProps> = ({
  bgColor = "#FFD446",    // can be Tailwind class OR hex code
  textColor = "#000000" // can be Tailwind class OR hex code
}) => {
  // detect Tailwind vs raw color
  const bgStyle = bgColor.startsWith("#") ? { backgroundColor: bgColor } : {};
  const textStyle = textColor.startsWith("#") ? { color: textColor } : {};

  return (
    <section 
      className={`${!bgColor.startsWith("#") ? bgColor : ""} py-16`} 
      style={bgStyle}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-left mb-12">
          <h2
            className={`text-2xl md:text-3xl font-semibold ${
              !textColor.startsWith("#") ? textColor : ""
            } mb-4`}
            style={textStyle}
          >
            Our impact in numbers
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-black">
          <StatCard endValue={5000} label="People" suffix="+" textColor={textColor} />
          <StatCard endValue={140} label="Villages" suffix="+" textColor={textColor} />
          <StatCard endValue={30} label="Programs" suffix="+" textColor={textColor} />
        </div>
      </div>
    </section>
  );
};

// Stat card component with proper typing
const StatCard: React.FC<StatCardProps> = ({ 
  endValue, 
  label, 
  prefix = "", 
  suffix = "", 
  textColor = "text-black" 
}) => {
  const [currentValue, setCurrentValue] = useState<number>(0);

  // detect Tailwind vs raw color
  const textStyle = textColor.startsWith("#") ? { color: textColor } : {};

  useEffect(() => {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = endValue / steps;
    const stepDuration = duration / steps;

    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const newValue = Math.min(Math.round(increment * currentStep), endValue);
      setCurrentValue(newValue);

      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [endValue]);

  return (
    <div className="text-center py-8">
      <div
        className={`text-4xl md:text-5xl font-bold mb-2 ${
          !textColor.startsWith("#") ? textColor : ""
        }`}
        style={textStyle}
      >
        {prefix}
        {currentValue.toLocaleString()}
        {suffix}
      </div>
      <div
        className={`text-lg md:text-xl font-medium ${
          !textColor.startsWith("#") ? textColor : ""
        }`}
        style={textStyle}
      >
        {label}
      </div>
    </div>
  );
};

export default ImpactStats;