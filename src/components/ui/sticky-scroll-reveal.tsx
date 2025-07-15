"use client";
import React, { useEffect, useRef, useState } from "react";
import { useMotionValueEvent, useScroll } from "motion/react";
import { motion } from "motion/react";
import { cn } from "../../lib/utils";

export const StickyScroll = ({
  content,
  contentClassName,
}: {
  content: {
    title: string;
    description: string;
    content?: React.ReactNode | any;
  }[];
  contentClassName?: string;
}) => {
  const [activeCard, setActiveCard] = React.useState(0);
  const ref = useRef<any>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const cardLength = content.length;

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const cardsBreakpoints = content.map((_, index) => index / cardLength);
    const closestBreakpointIndex = cardsBreakpoints.reduce(
      (acc, breakpoint, index) => {
        const distance = Math.abs(latest - breakpoint);
        if (distance < Math.abs(latest - cardsBreakpoints[acc])) {
          return index;
        }
        return acc;
      },
      0,
    );
    setActiveCard(closestBreakpointIndex);
  });

  const backgroundColors = [
    "#0f172a", // slate-900
    "#000000", // black
    "#171717", // neutral-900
  ];
  const linearGradients = [
    "linear-gradient(to bottom right, #06b6d4, #10b981)", // cyan-500 to emerald-500
    "linear-gradient(to bottom right, #ec4899, #6366f1)", // pink-500 to indigo-500
    "linear-gradient(to bottom right, #f97316, #eab308)", // orange-500 to yellow-500
  ];

  const [backgroundGradient, setBackgroundGradient] = useState(
    linearGradients[0],
  );

  useEffect(() => {
    setBackgroundGradient(linearGradients[activeCard % linearGradients.length]);
  }, [activeCard]);

  return (
    <div ref={ref} className="w-full bg-black">
      {content.map((item, index) => (
        <section
          key={item.title + index}
          className={cn(
            "min-h-screen flex flex-col md:flex-row items-center justify-between transition-all duration-700 px-4 md:px-24 gap-8",
            activeCard === index ? "opacity-100 brightness-100" : "opacity-30 brightness-50"
          )}
          style={{
            zIndex: activeCard === index ? 10 : 1,
            pointerEvents: activeCard === index ? 'auto' : 'none',
          }}
        >
          <div className="flex-1 flex flex-col items-start justify-center">
            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: activeCard === index ? 1 : 0.3, y: activeCard === index ? 0 : 40 }}
              transition={{ duration: 0.7 }}
              className="text-4xl md:text-5xl font-bold text-white mb-8 text-left"
            >
              {item.title}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: activeCard === index ? 1 : 0.3, y: activeCard === index ? 0 : 20 }}
              transition={{ duration: 0.7 }}
              className="text-xl md:text-2xl text-neutral-200 mb-10 text-left max-w-2xl"
            >
              {item.description}
            </motion.p>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: activeCard === index ? 1 : 0.3, scale: activeCard === index ? 1 : 0.95 }}
              transition={{ duration: 0.7 }}
              className="w-full max-w-xl"
            >
              {item.content}
            </motion.div>
          </div>
        </section>
      ))}
    </div>
  );
};
