"use client";

import { cn } from "@/lib/utils/cn";
import { InputHTMLAttributes, forwardRef } from "react";

interface ColorPickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  error?: string;
  label?: string;
}

const ColorPicker = forwardRef<HTMLInputElement, ColorPickerProps>(
  ({ className, error, label, value, ...props }, ref) => {
    return (
      <div className="w-full">
        <div className="flex items-center gap-3">
          <input
            ref={ref}
            type="color"
            value={value}
            className={cn(
              "h-10 w-14 rounded-lg border border-gray-300 cursor-pointer p-1",
              error && "border-red-500",
              className
            )}
            {...props}
          />
          <div className="flex-1">
            <input
              type="text"
              value={value}
              onChange={props.onChange}
              placeholder="#000000"
              className={cn(
                "input font-mono text-sm uppercase",
                error && "border-red-500 focus:ring-red-500"
              )}
            />
          </div>
        </div>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

ColorPicker.displayName = "ColorPicker";

export { ColorPicker };
