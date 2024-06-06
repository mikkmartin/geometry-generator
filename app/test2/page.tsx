"use client";

import { cuboidDrawPrompt } from "@/app/ai-function-prompts";
import { Cuboid } from "@/components/cuboid";
import { useControls, Leva, folder } from "leva";
import { z } from "zod";

type Diagonals = z.infer<(typeof cuboidDrawPrompt)["parameters"]>["diagonals"];

export default function Test2() {
  const { body, front, base, depth, width, height } = useControls({
    sides: folder(
      {
        width: { value: "", optional: true },
        depth: { value: "", optional: true },
        height: { value: "", optional: true },
      },
      { collapsed: true }
    ),
    corners: folder(
      {
        //all 8 corners
        topLeft: { value: "", optional: true },
        topRight: { value: "", optional: true },
        bottomLeft: { value: "", optional: true },
        bottomRight: { value: "", optional: true },
        //top and bottom
        top: { value: "", optional: true },
        bottom: { value: "", optional: true },
        //left and right
        left: { value: "", optional: true },
        right: { value: "", optional: true },
      },
      { collapsed: true }
    ),
    diagonals: folder(
      {
        body: false,
        front: false,
        base: false,
      },
      { collapsed: true }
    ),
  });

  const diagonals: Diagonals = [];
  if (body) diagonals.push("body");
  if (front) diagonals.push("front");
  if (base) diagonals.push("base");

  function getSideValue(side: string | undefined): boolean | string {
    if (side === "") return true;
    if (side !== undefined) return side;
    return false;
  }

  return (
    <div className="mx-auto w-full max-w-lg my-16 bg-stone-500/5 p-2 rounded-3xl">
      <div className="bg-white flex justify-center items-center p-2 rounded-2xl">
        <Cuboid
          size={[2, 1]}
          sides={[
            getSideValue(width),
            getSideValue(depth),
            getSideValue(height),
          ]}
          diagonals={diagonals}
        />
      </div>
      <div className="flex gap-1 p-2">
        <h2>Ruuttahukas</h2>
        <Prop title="Diagonals">
          {["width", "depth", "height"].map((side) => (
            <fieldset className="flex gap-5 items-center">
              <label
                className="text-[13px] text-violet11 w-[75px]"
                htmlFor={side}
              >
                {side}
              </label>
              <input type="checkbox" id={side} />
              <input
                className="w-full inline-flex items-center justify-center flex-1 rounded px-2.5 text-[13px] leading-none text-violet11 shadow-[0_0_0_1px] shadow-violet7 h-[25px] focus:shadow-[0_0_0_2px] focus:shadow-violet8 outline-none"
                id={side}
                placeholder="10 cm"
              />
            </fieldset>
          ))}
        </Prop>
        <Prop title="Corners">
          {[{ label: "top" }, { label: "bottom" }].map((corner) => (
            <fieldset className="flex gap-5 items-center">
              <label
                className="text-[13px] text-violet11 w-[75px]"
                htmlFor={corner.label}
              >
                {corner.label}
              </label>
              <input type="checkbox" id={corner.label} />
              <input
                className="w-full inline-flex items-center justify-center flex-1 rounded px-2.5 text-[13px] leading-none text-violet11 shadow-[0_0_0_1px] shadow-violet7 h-[25px] focus:shadow-[0_0_0_2px] focus:shadow-violet8 outline-none"
                id={corner.label}
                placeholder="10 cm"
              />
            </fieldset>
          ))}
        </Prop>
        <Prop title="Sides">
          {[{ label: "top" }, { label: "bottom" }].map((corner) => (
            <fieldset className="flex gap-5 items-center">
              <label
                className="text-[13px] text-violet11 w-[75px]"
                htmlFor={corner.label}
              >
                {corner.label}
              </label>
              <input type="checkbox" id={corner.label} />
              <input
                className="w-full inline-flex items-center justify-center flex-1 rounded px-2.5 text-[13px] leading-none text-violet11 shadow-[0_0_0_1px] shadow-violet7 h-[25px] focus:shadow-[0_0_0_2px] focus:shadow-violet8 outline-none"
                id={corner.label}
                placeholder="10 cm"
              />
            </fieldset>
          ))}
        </Prop>
      </div>
      <pre>{JSON.stringify(diagonals, null, 2)}</pre>
      <Leva flat hideCopyButton titleBar={false} />
    </div>
  );
}

import * as Popover from "@radix-ui/react-popover";

const Prop = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <Popover.Root>
    <Popover.Trigger asChild>
      <button
        className="rounded-full bg-black/5 text-slate-600 tracking-wide uppercase text-xs font-medium px-3 py-1 text-violet11"
        aria-label="Update dimensions"
      >
        {title}
      </button>
    </Popover.Trigger>
    <Popover.Portal>
      <Popover.Content
        className="rounded p-5 w-[260px] bg-white  will-change-[transform,opacity] data-[state=open]:data-[side=top]:animate-slideDownAndFade data-[state=open]:data-[side=right]:animate-slideLeftAndFade data-[state=open]:data-[side=bottom]:animate-slideUpAndFade data-[state=open]:data-[side=left]:animate-slideRightAndFade"
        sideOffset={5}
      >
        <div className="flex flex-col gap-2.5">
          <p className="text-mauve12 text-[15px] leading-[19px] font-medium mb-2.5">
            {title}
          </p>
          {children}
        </div>
        <Popover.Close
          className="rounded-full h-[25px] w-[25px] inline-flex items-center justify-center text-violet11 absolute top-[5px] right-[5px] hover:bg-violet4 focus:shadow-[0_0_0_2px] focus:shadow-violet7 outline-none cursor-default"
          aria-label="Close"
        >
          x
        </Popover.Close>
        <Popover.Arrow className="fill-white" />
      </Popover.Content>
    </Popover.Portal>
  </Popover.Root>
);
