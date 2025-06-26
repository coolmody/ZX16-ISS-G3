import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { forwardRef, useEffect, useRef, useState } from "react";

interface PrefixedInputProps
  extends Omit<React.ComponentProps<typeof Input>, "value" | "defaultValue"> {
  prefix: string;
  defaultValue?: string;
}

export const PrefixedInput = forwardRef<HTMLInputElement, PrefixedInputProps>(
  ({ prefix, defaultValue = "", onChange, ...props }, forwardedRef) => {
    const [value, setValue] = useState(prefix + defaultValue);
    const innerRef = useRef<HTMLInputElement>(null);

    // merge forwarded ref + our innerRef
    useEffect(() => {
      if (forwardedRef) {
        if (typeof forwardedRef === "function") {
          forwardedRef(innerRef.current);
        } else {
          // @ts-ignore
          forwardedRef.current = innerRef.current;
        }
      }
    }, [forwardedRef]);

    // on mount: position caret just after the prefix
    useEffect(() => {
      const input = innerRef.current;
      if (input) {
        // ensure model value is correct
        input.value = prefix + defaultValue;
        // move caret
        input.setSelectionRange(prefix.length, prefix.length);
      }
    }, []); // run once

    // keep prefix locked even if they backspace over it
    const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
      let v = e.target.value;
      if (!v.startsWith(prefix)) {
        // remove any stray prefixes, then re-add exactly one
        v = prefix + v.replace(new RegExp(`^${prefix}+`), "");
      }
      setValue(v);
      onChange?.({ ...e, target: { ...e.target, value: v } });
    };

    // if they click into the prefix area, push them past it
    const handleFocus: React.FocusEventHandler<HTMLInputElement> = (e) => {
      if (e.target.selectionStart! < prefix.length) {
        e.target.setSelectionRange(prefix.length, prefix.length);
      }
    };

    return (
      <Input
        {...props}
        ref={innerRef}
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        className={cn("font-mono", props.className)}
      />
    );
  }
);
PrefixedInput.displayName = "PrefixedInput";
