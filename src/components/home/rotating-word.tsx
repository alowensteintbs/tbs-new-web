"use client";

import { TypeAnimation } from "react-type-animation";

export function RotatingWord() {
  return (
    <TypeAnimation
      sequence={["futuro", 5000, "criterio", 5000, "libertad", 5000, "seguridad", 5000]}
      speed={{ type: "keyStrokeDelayInMs", value: 180 }}
      deletionSpeed={{ type: "keyStrokeDelayInMs", value: 120 }}
      repeat={Infinity}
      wrapper="span"
      className="inline-block"
    />
  );
}
