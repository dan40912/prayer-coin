"use client";

import { useEffect } from "react";

export default function BodyClass({ className }) {
  useEffect(() => {
    if (!className) return undefined;
    const classes = Array.isArray(className) ? className : className.split(/\s+/).filter(Boolean);
    classes.forEach((token) => document.body.classList.add(token));
    return () => {
      classes.forEach((token) => document.body.classList.remove(token));
    };
  }, [className]);

  return null;
}
