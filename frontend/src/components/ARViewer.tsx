import { Canvas } from '@react-three/fiber';
import { XR, createXRStore } from '@react-three/xr';
import { useTexture } from '@react-three/drei';
import { Suspense, useRef } from 'react';
import * as THREE from 'three';
import { X } from 'lucide-react';

interface ARViewerProps {
  imageUrl: string;
  onClose: () => void;
}

const store = createXRStore();

function ImageBillboard({ imageUrl }: { imageUrl: string }) {
  const texture = useTexture(imageUrl);
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Calculate aspect ratio. useTexture returns a Texture.
  const img = texture.image as any;
  const imgWidth = img?.width || 1;
  const imgHeight = img?.height || 1;
  const aspect = imgWidth / imgHeight;
  
  const width = 0.5; // 50cm wide
  const height = width / aspect;

  return (
    <mesh ref={meshRef} position={[0, 0, -1]} castShadow receiveShadow>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial map={texture} side={THREE.DoubleSide} transparent />
    </mesh>
  );
}

export default function ARViewer({ imageUrl, onClose }: ARViewerProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center">
      <div className="absolute top-4 right-4 z-[60]">
        <button 
          onClick={onClose}
          className="p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-colors"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      <div className="w-full max-w-sm px-4 mb-8 text-center absolute top-20 z-[60] pointer-events-none">
        <h2 className="text-xl font-bold text-white mb-2 shadow-black drop-shadow-md">AR Preview</h2>
        <p className="text-sm text-gray-300 shadow-black drop-shadow-md">
          Point your camera at a flat surface and click the button below to enter AR.
        </p>
      </div>

      <div className="flex-1 w-full relative">
        <button 
          className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-primary text-black font-bold px-8 py-4 rounded-full shadow-lg z-[60] active:scale-95 transition-transform"
          onClick={() => store.enterAR()}
        >
          Enter AR Mode
        </button>
        
        <Canvas>
          <XR store={store}>
            <ambientLight intensity={1.5} />
            <directionalLight position={[10, 10, 10]} intensity={1} castShadow />
            <Suspense fallback={null}>
              {imageUrl && <ImageBillboard imageUrl={imageUrl} />}
            </Suspense>
          </XR>
        </Canvas>
      </div>
    </div>
  );
}
