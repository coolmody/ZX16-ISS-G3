import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";

const KeyboardLayout = ({ className }: { className?: string }) => {
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      setPressedKey(event.key.toUpperCase());
    };

    const handleKeyUp = () => {
      setPressedKey(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const isKeyPressed = (key: string) => pressedKey === key;

  const keyClass = (key: string) =>
    cn(
      "w-5 h-5 bg-neutral-800 flex items-center justify-center text-[10px]",
      isKeyPressed(key) && "bg-blue-500 text-white"
    );

  return (
    <div className={cn(className, "bg-neutral-900 p-2 rounded-lg")}>
      <div className="flex flex-col gap-1 ">
        {/* Row 2: Numbers */}
        <div className="flex gap-1">
          <div className={keyClass("`")}>`</div>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((n) => (
            <div key={n} className={keyClass(n.toString())}>
              {n}
            </div>
          ))}
          <div className={keyClass("-")}>-</div>
          <div className={keyClass("=")}>=</div>
          <div
            className={cn(
              "w-20 h-5 bg-neutral-800 flex items-center justify-center text-xs",
              isKeyPressed("BACKSPACE") && "bg-blue-500 text-white"
            )}
          >
            BACK
          </div>
        </div>

        {/* Row 3: QWERTY */}
        <div className="flex gap-1">
          <div
            className={cn(
              "w-16 h-5 bg-neutral-800 flex items-center justify-center text-xs",
              isKeyPressed("TAB") && "bg-blue-500 text-white"
            )}
          >
            TAB
          </div>
          {["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"].map((letter) => (
            <div key={letter} className={keyClass(letter)}>
              {letter}
            </div>
          ))}
          <div className={keyClass("[")}>[</div>
          <div className={keyClass("]")}>]</div>
          <div className={keyClass("\\")}>\\</div>
        </div>

        {/* Row 4: ASDF */}
        <div className="flex gap-1">
          <div
            className={cn(
              "w-20 h-5 bg-neutral-800 flex items-center justify-center text-xs",
              isKeyPressed("CAPSLOCK") && "bg-blue-500 text-white"
            )}
          >
            CAPS
          </div>
          {["A", "S", "D", "F", "G", "H", "J", "K", "L"].map((letter) => (
            <div key={letter} className={keyClass(letter)}>
              {letter}
            </div>
          ))}
          <div className={keyClass(";")}>;</div>
          <div className={keyClass("'")}>'</div>
          <div
            className={cn(
              "w-20 h-5 bg-neutral-800 flex items-center justify-center text-xs",
              isKeyPressed("ENTER") && "bg-blue-500 text-white"
            )}
          >
            ENTER
          </div>
        </div>

        {/* Row 5: ZXCV */}
        <div className="flex gap-1">
          <div
            className={cn(
              "w-24 h-5 bg-neutral-800 flex items-center justify-center text-xs",
              isKeyPressed("SHIFT") && "bg-blue-500 text-white"
            )}
          >
            SHIFT
          </div>
          {["Z", "X", "C", "V", "B", "N", "M"].map((letter) => (
            <div key={letter} className={keyClass(letter)}>
              {letter}
            </div>
          ))}
          <div className={keyClass(",")}>,</div>
          <div className={keyClass(".")}>.</div>
          <div className={keyClass("/")}>/</div>
          <div
            className={cn(
              "w-24 h-5 bg-neutral-800 flex items-center justify-center text-[10px]",
              isKeyPressed("SHIFT") && "bg-blue-500 text-white"
            )}
          >
            SHIFT
          </div>
        </div>

        {/* Row 6: Bottom row */}
        <div className="flex gap-1">
          <div
            className={cn(
              "w-16 h-5 bg-neutral-800 flex items-center justify-center text-[10px]",
              isKeyPressed("CONTROL") && "bg-blue-500 text-white"
            )}
          >
            CTRL
          </div>
          <div className={keyClass("ALT")}>ALT</div>
          <div
            className={cn(
              "w-64 h-5 bg-neutral-800 flex items-center justify-center  text-[10px]",
              isKeyPressed(" ") && "bg-blue-500 text-white"
            )}
          >
            SPACE
          </div>
          <div className={keyClass("ALT")}>ALT</div>
          <div
            className={cn(
              "w-16 h-5 bg-neutral-800 flex items-center justify-center  text-[10px]",
              isKeyPressed("CONTROL") && "bg-blue-500 text-white"
            )}
          >
            CTRL
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyboardLayout;
