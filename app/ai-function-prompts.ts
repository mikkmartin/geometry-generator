import { z } from "zod";

export const drawCylinder = {
  name: "draw_cylinder",
  description: `\
  Get the current paramaters for drawing a 3D cylinder. The shape will be drawn on the screen.
  Keep in mind the bounds, so you dont draw outside width of 300 and height of 200. Try to use all of the space, but leave padding.`,
  parameters: z.object({
    lines: z
      .array(
        z.object({
          x1: z.number(),
          y1: z.number(),
          x2: z.number(),
          y2: z.number(),
        })
      )
      .describe(
        `\n
The parallel lines to to draw the cylinder left and right sides.\n
In the svg line format eg. [{ "x1": 50, "y1": 50, "x2": 50, "y2": 150 }, { "x1": 250, "y1": 50, "x2": 250, "y2": 150 }]`
      ),
    ellipses: z
      .array(
        z.object({
          cx: z.number(),
          cy: z.number(),
          rx: z.number(),
          ry: z.number(),
        })
      )
      .describe(
        `The parallel ellipses to to draw the shape. In the svg ellipse format eg. [{ "cx": 150, "cy": 50, "rx": 100, "ry": 50 }, { "cx": 150, "cy": 150, "rx": 100, "ry": 50 }]`
      )
      .optional(),
  }),
};

export const polygonDrawPrompt = {
  name: "draw_shape",
  description: `\
  Get the current paramaters for drawing a 2D geometric shape. The shape will be drawn on the screen.
  Keep in mind the bounds, so you dont draw outside width of 300 and height of 200. Try to use all of the space, but leave padding.
  Don't nessessarily add all the parameters (points, angles, corners, etc..) you can add one if you want. Try to keep it simple at first.`,
  parameters: z.object({
    points: z
      .string()
      .describe(
        `The points to draw the shape. In SVG shape points format e.g. "200,10 250,190 150,190"`
      ),
    angles: z
      .array(z.union([z.string(), z.boolean()]))
      .describe(
        `\
  For angle indicators. Use an array of strings: eg. ['a', 'b', 'c']. Keep the correlation of the points and angles.
  eg. If the points are "50,150 250,150 250,50" the 90 degree angle should be at the SECOND index. Since it corresponds to the second point "250,150".
  If you need to hide an angle, use false. eg. ['a', false, 'c']
  If you need to show an angle in degrees, use a boolean true value. The user will be shown calculated angle in degrees. eg. [true, true, true] (this will show all three angles in degrees)`
      )
      .optional(),
    corners: z
      .array(z.union([z.string(), z.null()]))
      .describe(
        `
  A collection of marks to indicate a vertecies on the shape if asked. Use an array of strings: eg. ['A', 'B', 'C']`
      )
      .optional(),
    sides: z
      .array(z.union([z.string(), z.boolean()]))
      .describe(
        `\
  A collection of marks to indicate a sides on the shape if asked. Use an array of strings: eg. ['x', 'y', 'z']
  If you need to show a side length, use a "true". The user will be shown calculated length. eg. [true, true, true] (this will show all three sides)`
      )
      .optional(),
  }),
};

export const cuboidDrawPrompt = {
  name: "draw_cuboid",
  description: `\
Get the current paramaters for drawing a 3D cuboid. The shape will be drawn on the screen.
Don't nessessarily add all the parameters (points, angles, corners, etc..) you can add one if you want. Try to keep it simple at first.
Corner are ordered starting from the top face: [0, 1, 2, 3] and then the bottom face: [4, 5, 6, 7] they start from the bottom right and go counter clockwise.
The body diagonal is [8, 1] indexes of the corners. eg. [false, 'A', false, false, false, false, false, 'B'] (this will show the body diagonal).`,
  parameters: z.object({
    size: z.array(z.union([z.number(), z.number()])).describe(
      `\
The size of the cuboid. In the format of [width, depth]. eg. [1, 0.5] keep the width and depth between 0.1 and 2. Keep one of the values close to 1.
The size will be translated to the user as 10cm x 5cm. So if the user asks for different sizes, you can use the same size but change the translation.`
    ),
    diagonals: z.array(z.enum(["base", "front", "body"])).optional().describe(`\
The diagonals to draw on the shape. The base diagonal is the diagonal on the base of the cuboid. eg. ['body']
The front diagonal is the diagonal on the front face of the cuboid.
The body diagonal is the diagonal that goes through the cuboid from the top front to the bottom back.
`),
    corners: z.array(z.union([z.string(), z.boolean()])).optional().describe(`\
A collection of marks to indicate a vertecies on the shape if asked. Use an array of strings: eg. ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] (Maximum of 8 corners)
`),
    sides: z.array(z.union([z.string(), z.boolean()])).optional().describe(`\
A collection of marks to indicate a sides on the shape if asked. Use an array of strings: eg. ['x', 'y', 'z']
If you need to show a side length, use a "true". The user will be shown calculated length. eg. [true, true, true] (this will show all three sides)`),
  }),
};
