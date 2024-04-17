"use client";

import { Camera, Canvas, RootState, useFrame } from "@react-three/fiber";
import {
  MutableRefObject,
  forwardRef,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import * as THREE from "three";
import { SVGRenderer } from "three-stdlib";
import { motion } from "framer-motion";
import { createContext } from "react";
import { MotionValue, useMotionValue } from "framer-motion";
import { OrbitControls } from "@react-three/drei";

export default function Page() {
  return (
    <div className="w-full max-w-96 aspect-square bg-white">
      <Geometry />
    </div>
  );
}

const size = { width: 200, height: 200 };

const Shape = forwardRef<
  THREE.Mesh,
  {
    onUpdate: (arg: { state: RootState }) => void;
  }
>(({ onUpdate }, meshRef) => {
  useFrame((state) => {
    onUpdate({ state });
    // if (!meshRef) return;
    // //@ts-ignore
    // const mesh = meshRef.current as THREE.Mesh;
  }, 1);

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
    </mesh>
  );
});

const CanvasContext = createContext<{
  setOrbitControllerProps: React.Dispatch<
    React.SetStateAction<{
      enabled: boolean;
    }>
  >;
  cameraRef: MutableRefObject<Camera>;
  cuboid: {
    vertices: MotionValue<Point[]>;
    mesh: React.MutableRefObject<THREE.Mesh>;
  };
}>(null!);

function Geometry({ size = { width: 300, height: 200 } }) {
  const [hydrated, setHydrated] = useState(false);

  const initialScene = createInitialScene();
  const initialVertices = getVertPositions(initialScene);

  const svgRef = useRef<SVGSVGElement>(null!);
  const vertices = useMotionValue(initialVertices);
  const meshRef = useRef<THREE.Mesh>(initialScene.mesh);
  const cameraRef = useRef<Camera>(initialScene.camera);

  const [orbitControllerProps, setOrbitControllerProps] = useState({
    enabled: true,
  });

  useLayoutEffect(() => {
    setHydrated(true);
  }, []);

  const firstUpdate = useRef(true);

  return (
    <CanvasContext.Provider
      value={{
        cameraRef,
        cuboid: { vertices, mesh: meshRef },
        setOrbitControllerProps,
      }}
    >
      {hydrated && (
        <Canvas
          style={{ display: !hydrated ? "none" : "block" }}
          orthographic
          camera={{ position: [1, 1, 1.5], zoom: 200 }}
          //frameloop="demand"
          gl={(canvas) => {
            const gl = new SVGRenderer();
            gl.domElement = svgRef.current;
            //@ts-ignore
            const parent = canvas.parentNode;
            parent.removeChild(canvas);
            parent.appendChild(gl.domElement);
            return gl;
          }}
        >
          <OrbitControls {...orbitControllerProps} />
          <Shape
            ref={meshRef}
            onUpdate={({ state: { camera } }) => {
              if (firstUpdate.current) {
                firstUpdate.current = false;
                cameraRef.current = camera;
              }
              const verts = getVertPositions({ camera, mesh: meshRef.current });
              vertices.set(verts);
            }}
          />
        </Canvas>
      )}
      <svg
        ref={svgRef}
        className="w-full max-w-96 aspect-square bg-white [grid-area:1/1]"
        viewBox={`${-size.width / 2} ${-size.height / 2} ${size.width} ${size.height}`}
      >
        <CornerVerts />
        <Faces />
        <Diagonals />
        <Gizmos />
        {/* <Wireframe /> */}
      </svg>
    </CanvasContext.Provider>
  );
}

function Diagonals() {
  const { cuboid, setOrbitControllerProps } = useGeometry();
  const polylineRef = useRef<SVGPolylineElement>(null!);

  useEffect(() => {
    cuboid.vertices.on("change", (verts) => {
      const points = [verts[0], verts[6]].map(({ x, y }) => `${x},${y}`);
      polylineRef.current.setAttribute("points", points.join(" "));
    });
  });

  return (
    <polyline
      ref={polylineRef}
      fill="none"
      stroke="#94A3B8"
      strokeDasharray="3 5"
    />
  );
}

function Gizmos() {
  const { cuboid, setOrbitControllerProps } = useGeometry();
  const xScaleElRef = useRef<SVGCircleElement>(null!);
  const zScaleElRef = useRef<SVGCircleElement>(null!);

  useEffect(() => {
    cuboid.vertices.on("change", (verts) => {
      if (!xScaleElRef.current || !zScaleElRef.current) return;
      const xPoint = getCentroid(verts[2], verts[3]);
      xScaleElRef.current.setAttribute("cx", xPoint.x.toString());
      xScaleElRef.current.setAttribute("cy", xPoint.y.toString());
      const zPoint = getCentroid(verts[2], verts[7]);
      zScaleElRef.current.setAttribute("cx", zPoint.x.toString());
      zScaleElRef.current.setAttribute("cy", zPoint.y.toString());
    });
  });

  const enable = () => setOrbitControllerProps({ enabled: true });
  const disable = () => setOrbitControllerProps({ enabled: false });

  const scale = useRef({
    x: 1,
    z: 1,
    runningX: 0,
    runningZ: 0,
  });

  return (
    <>
      <motion.circle
        ref={xScaleElRef}
        dragMomentum
        onPointerEnter={disable}
        onPointerLeave={enable}
        onPan={(_, info) => {
          const runningX = info.offset.x / 100;
          const startingScale = scale.current.x;
          scale.current.runningX = runningX;
          const mesh = cuboid.mesh.current;
          mesh.geometry = new THREE.BoxGeometry(
            startingScale + runningX,
            1,
            scale.current.z
          );
        }}
        onPanEnd={() => {
          scale.current.x += scale.current.runningX;
          scale.current.runningX = 0;
        }}
        r={5}
        fill="red"
      />
      <motion.circle
        ref={zScaleElRef}
        dragMomentum
        onPointerEnter={disable}
        onPointerLeave={enable}
        onPan={(_, info) => {
          const scaleY = info.offset.y / 100;
          const startingScale = scale.current.z;
          scale.current.runningZ = scaleY;
          const mesh = cuboid.mesh.current;
          mesh.geometry = new THREE.BoxGeometry(
            scale.current.x,
            1,
            startingScale + scaleY
          );
        }}
        onPanEnd={() => {
          scale.current.z += scale.current.runningZ;
          scale.current.runningZ = 0;
        }}
        r={5}
        fill="red"
      />
    </>
  );
}

function Wireframe() {
  const { cuboid, setOrbitControllerProps } = useGeometry();
  const polylineRef = useRef<SVGPolylineElement>(null!);
  const xScaleElRef = useRef<SVGCircleElement>(null!);
  const zScaleElRef = useRef<SVGCircleElement>(null!);

  useEffect(() => {
    cuboid.vertices.on("change", (verts) => {
      polylineRef.current.setAttribute(
        "points",
        verts.map(({ x, y }) => `${x},${y}`).join(" ")
      );
      if (!xScaleElRef.current || !zScaleElRef.current) return;
      const xPoint = getCentroid(verts[2], verts[3]);
      xScaleElRef.current.setAttribute("cx", xPoint.x.toString());
      xScaleElRef.current.setAttribute("cy", xPoint.y.toString());
      const zPoint = getCentroid(verts[2], verts[7]);
      zScaleElRef.current.setAttribute("cx", zPoint.x.toString());
      zScaleElRef.current.setAttribute("cy", zPoint.y.toString());
    });
  });

  const points = cuboid.vertices
    .get()
    .map(({ x, y }) => `${x},${y}`)
    .join(" ");

  const enable = () => setOrbitControllerProps({ enabled: true });
  const disable = () => setOrbitControllerProps({ enabled: false });

  const scale = useRef({
    x: 1,
    z: 1,
    runningX: 0,
    runningZ: 0,
  });

  return (
    <>
      <polyline points={points} ref={polylineRef} fill="none" stroke="black" />
      <motion.circle
        ref={xScaleElRef}
        dragMomentum
        onPointerEnter={disable}
        onPointerLeave={enable}
        onPan={(_, info) => {
          const runningX = info.offset.x / 100;
          const startingScale = scale.current.x;
          scale.current.runningX = runningX;
          const mesh = cuboid.mesh.current;
          mesh.geometry = new THREE.BoxGeometry(
            startingScale + runningX,
            1,
            scale.current.z
          );
        }}
        onPanEnd={() => {
          scale.current.x += scale.current.runningX;
          scale.current.runningX = 0;
        }}
        r={5}
        fill="red"
      />
      <motion.circle
        ref={zScaleElRef}
        dragMomentum
        onPointerEnter={disable}
        onPointerLeave={enable}
        onPan={(_, info) => {
          const scaleY = info.offset.y / 100;
          const startingScale = scale.current.z;
          scale.current.runningZ = scaleY;
          const mesh = cuboid.mesh.current;
          mesh.geometry = new THREE.BoxGeometry(
            scale.current.x,
            1,
            startingScale + scaleY
          );
        }}
        onPanEnd={() => {
          scale.current.z += scale.current.runningZ;
          scale.current.runningZ = 0;
        }}
        r={5}
        fill="red"
      />
    </>
  );
}

function CornerVerts() {
  const { cuboid, setOrbitControllerProps } = useGeometry();
  const textRefs = useRef<SVGTextElement[]>([]);

  cuboid.vertices.on("change", updateCornerLabels);

  function getCorners(verts: Point[]) {
    return Array.from({ length: 8 }, (_, i) => {
      const p = verts[i];
      return {
        x: p.x,
        y: p.y,
      };
    });
  }

  function updateCornerLabels(verts: Point[]) {
    const corners = getCorners(verts);
    corners.forEach((corner, i) => {
      const text = textRefs.current[i];
      text.setAttribute("x", corner.x.toString());
      text.setAttribute("y", corner.y.toString());
    });
  }

  return getCorners(cuboid.vertices.get()).map((pos, i) => (
    <text
      key={i}
      {...pos}
      ref={(el) => {
        textRefs.current[i] = el!;
      }}
      fontSize={10}
      textAnchor="middle"
    >
      {i}
    </text>
  ));
}

function Faces() {
  const { cuboid, cameraRef } = useGeometry();
  const faceRefs = useRef<SVGPolygonElement[]>([]);

  cuboid.vertices.on("change", updateFaces);

  function calculateFaces(verts: Point[]) {
    return Array.from({ length: 6 }, (_, i) => {
      const [p1, p2, p3, p4] = verts.slice(i * 4, i * 4 + 4);
      const points = [p1, p2, p4, p3].map((v) => `${v.x},${v.y}`).join(" ");

      const normal = new THREE.Vector3();
      const a = new THREE.Vector3();
      const b = new THREE.Vector3();
      const c = new THREE.Vector3();

      const geometry = cuboid.mesh.current.geometry as THREE.BufferGeometry;

      const index = i * 4;
      a.fromBufferAttribute(geometry.attributes.position, index);
      b.fromBufferAttribute(geometry.attributes.position, index + 1);
      c.fromBufferAttribute(geometry.attributes.position, index + 2);

      normal.crossVectors(b.sub(a), c.sub(a)).normalize();
      const cameraDirection = new THREE.Vector3();

      const camera = cameraRef.current;
      camera.getWorldDirection(cameraDirection);
      const dot = normal.dot(cameraDirection);
      const flipped = dot < 0;

      return {
        points,
        fill: flipped ? "rgba(148, 163, 184, 0.10)" : "rgba(0,0,0,0)",
        stroke: flipped ? "#94a3b822" : "#94a3b8",
      };
    });
  }

  function updateFaces(verts: Point[]) {
    const faces = calculateFaces(verts);
    faces.forEach((face, i) => {
      const ref = faceRefs.current[i];
      ref.setAttribute("points", face.points);
      ref.setAttribute("fill", face.fill);
      ref.setAttribute("stroke", face.stroke);
    });
  }

  return calculateFaces(cuboid.vertices.get()).map((face, i) => (
    <polygon
      key={i}
      ref={(el) => {
        faceRefs.current[i] = el!;
      }}
      points={face.points}
      fill={face.fill}
      stroke={face.stroke}
    />
  ));
}

function createInitialScene() {
  const camera = new THREE.OrthographicCamera(
    -192, // left
    192, // right
    192, // top
    -192, // bottom
    1,
    1000
  );

  camera.position.set(1, 1, 1.5);
  camera.lookAt(0, 0, 0);
  camera.updateWorldMatrix(true, true);

  camera.zoom = 200;
  camera.updateProjectionMatrix();

  const scene = new THREE.Scene();
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const mesh = new THREE.Mesh(geometry);
  scene.add(mesh);

  return { mesh, camera };
}

function getVertPositions({
  mesh,
  camera,
}: {
  mesh: THREE.Mesh;
  camera: Camera;
}): Point[] {
  const vertPositions: Point[] = [];
  const positionAttr = mesh.geometry.attributes.position;

  const vertex = new THREE.Vector3();

  for (let i = 0; i < positionAttr.count; i++) {
    vertex.fromBufferAttribute(positionAttr, i);

    vertex.applyMatrix4(mesh.matrixWorld);
    vertex.project(camera);

    const x = vertex.x * 0.5 * size.height;
    const y = -vertex.y * 0.5 * size.height;

    vertPositions.push({ x, y });
  }
  return vertPositions;
}

const useGeometry = () => {
  const vertices = useContext(CanvasContext);
  return vertices;
};

type Point = { x: number; y: number };

function getCentroid(...arr: Point[]): Point {
  let sumX = 0;
  let sumY = 0;

  for (let i = 0; i < arr.length; i++) {
    sumX += arr[i].x;
    sumY += arr[i].y;
  }

  let centroidX = sumX / arr.length;
  let centroidY = sumY / arr.length;

  return { x: centroidX, y: centroidY };
}
