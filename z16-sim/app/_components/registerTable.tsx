"use client";

import { binaryToDecimal } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

export default function Registers({
  values,
  index,
}: {
  values?: string[];
  index?: number[];
}) {
  return (
    <table className="table-auto w-3/5 border-collapse border border-black text-sm">
      <thead>
        <tr className="bg-neutral-900">
          <th className="border border-black px-4 py-2">x0</th>
          <th className="border border-black px-4 py-2">x1</th>
          <th className="border border-black px-4 py-2">x2</th>
          <th className="border border-black px-4 py-2">x3</th>
          <th className="border border-black px-4 py-2">x4</th>
          <th className="border border-black px-4 py-2">x5</th>
          <th className="border border-black px-4 py-2">x6</th>
          <th className="border border-black px-4 py-2">x7</th>
        </tr>
      </thead>
      <tbody className="bg-transparent">
        <tr>
          {values?.map((value, i) => (
            <td
              key={i}
              className={`border border-black px-4 py-2 text-center ${
                index?.includes(i) ? "bg-yellow-300" : ""
              }`}
            >
              {binaryToDecimal(value)}
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  );
}
