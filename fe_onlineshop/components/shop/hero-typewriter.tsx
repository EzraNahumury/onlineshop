"use client";

import { useEffect, useState } from "react";
import TextType from "@/components/ui/text-type";

const LINE_1 = "Original gear.";
const LINE_2 = "Without the markup.";
const TYPING_SPEED = 55;
const LINE_1_DELAY = 300;
const LINE_1_DURATION = LINE_1_DELAY + LINE_1.length * TYPING_SPEED;
const LINE_2_GAP = 200;
const LINE_2_DURATION = LINE_2_GAP + LINE_2.length * TYPING_SPEED;
const CURSOR_LINGER = 900;

export function HeroTypewriter() {
  const [line1Done, setLine1Done] = useState(false);
  const [showLine2, setShowLine2] = useState(false);
  const [line2Done, setLine2Done] = useState(false);

  useEffect(() => {
    const timers = [
      setTimeout(() => setLine1Done(true), LINE_1_DURATION + 200),
      setTimeout(() => setShowLine2(true), LINE_1_DURATION),
      setTimeout(
        () => setLine2Done(true),
        LINE_1_DURATION + LINE_2_DURATION + CURSOR_LINGER
      ),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <h2 className="text-white text-2xl sm:text-3xl lg:text-[2rem] font-extralight leading-[1.05] tracking-[-0.02em] mb-6 sm:mb-7 max-w-md text-left drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)]">
      <span className="block">
        <TextType
          as="span"
          text={LINE_1}
          typingSpeed={TYPING_SPEED}
          initialDelay={LINE_1_DELAY}
          loop={false}
          showCursor={!line1Done}
          cursorCharacter="|"
          cursorClassName="text-white/80 font-extralight ml-0.5"
        />
      </span>
      <span className="block font-bold italic mt-1 min-h-[1em]">
        {showLine2 && (
          <TextType
            as="span"
            text={LINE_2}
            typingSpeed={TYPING_SPEED}
            initialDelay={LINE_2_GAP}
            loop={false}
            showCursor={!line2Done}
            cursorCharacter="|"
            cursorClassName="text-white/80 font-normal not-italic ml-0.5"
          />
        )}
      </span>
    </h2>
  );
}
