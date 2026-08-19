import { useEffect, useState } from "react";

import React from 'react';

/** Headline where each letter reacts to hover, plus a rotating word. */
export function HoverLetters({ text, className = "" }) {
  const words = text.split(" ");
  return (
    <span className={className} aria-label={text}>
      {words.map((word, wordIndex) => (
        <React.Fragment key={wordIndex}>
          <span className="inline-block">
            {word.split("").map((char, charIndex) => (
              <span
                key={charIndex}
                aria-hidden
                className="inline-block transition-transform duration-200 ease-out hover:-translate-y-2 hover:rotate-6 hover:text-primary"
              >
                {char}
              </span>
            ))}
          </span>
          {wordIndex < words.length - 1 && " "}
        </React.Fragment>
      ))}
    </span>
  );
}

export function RotatingWord({ words, className = "" }) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const out = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % words.length);
        setVisible(true);
      }, 320);
    }, 2600);
    return () => clearInterval(out);
  }, [words.length]);

  return (
    <span
      className={`inline-block transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100 blur-0" : "translate-y-2 opacity-0 blur-sm"
      } ${className}`}
    >
      {words[index]}
    </span>
  );
}
