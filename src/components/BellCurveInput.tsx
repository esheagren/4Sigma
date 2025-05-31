import React, { useState, useEffect, useRef } from 'react';

interface BellCurveInputProps {
  onChange: (lowerBound: number, upperBound: number, magnitude: number) => void;
  unit: string;
}

const BellCurveInput: React.FC<BellCurveInputProps> = ({ onChange, unit }) => {
  const [magnitude, setMagnitude] = useState<number>(3);
  const [lowerPercentile, setLowerPercentile] = useState<number>(30);
  const [upperPercentile, setUpperPercentile] = useState<number>(70);
  const [isDragging, setIsDragging] = useState<'lower' | 'upper' | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  
  const baseValue = Math.pow(10, magnitude);
  const lowerBound = Math.round(baseValue * (0.5 + lowerPercentile / 200));
  const upperBound = Math.round(baseValue * (1.5 - upperPercentile / 200));
  
  useEffect(() => {
    onChange(lowerBound, upperBound, magnitude);
  }, [lowerBound, upperBound, magnitude, onChange]);

  const handleMagnitudeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setMagnitude(value);
  };

  const handleMouseDown = (handle: 'lower' | 'upper') => (e: React.MouseEvent) => {
    setIsDragging(handle);
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !svgRef.current) return;

    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const percentage = Math.max(0, Math.min(100, (x / width) * 100));

    if (isDragging === 'lower') {
      const newLower = Math.min(percentage, upperPercentile - 5);
      setLowerPercentile(newLower);
    } else {
      const newUpper = Math.max(percentage, lowerPercentile + 5);
      setUpperPercentile(newUpper);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove as any);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove as any);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  // Generate bell curve path
  const generateBellCurvePath = () => {
    const width = 300;
    const height = 100;
    const points: [number, number][] = [];
    
    for (let i = 0; i <= width; i++) {
      const x = (i / width) * 6 - 3; // Scale to [-3, 3]
      const y = Math.exp(-(x * x) / 2) / Math.sqrt(2 * Math.PI);
      points.push([i, (1 - y) * height]);
    }
    
    return `M ${points[0][0]},${height} ` +
           points.map(p => `L ${p[0]},${p[1]}`).join(' ') +
           ` L ${width},${height} Z`;
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium">Order of Magnitude</label>
        <div className="flex items-center gap-4">
          <span className="text-neutral-500 dark:text-neutral-400">10^</span>
          <input
            type="range"
            min="0"
            max="6"
            step="1"
            value={magnitude}
            onChange={handleMagnitudeChange}
            className="flex-1 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-neutral-900 dark:text-neutral-100 font-medium">{magnitude}</span>
        </div>
        <div className="text-sm text-neutral-500 dark:text-neutral-400">
          Working with values around {Math.pow(10, magnitude).toLocaleString()} {unit}
        </div>
      </div>
      
      <div className="h-40 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
        <svg
          ref={svgRef}
          viewBox="0 0 300 100"
          className="w-full h-full"
          onMouseMove={isDragging ? handleMouseMove : undefined}
        >
          {/* Bell curve */}
          <path
            d={generateBellCurvePath()}
            className="fill-neutral-200 dark:fill-neutral-700"
          />
          
          {/* Selected range */}
          <path
            d={generateBellCurvePath()}
            clipPath={`path('M ${lowerPercentile * 3} 0 L ${upperPercentile * 3} 0 L ${upperPercentile * 3} 100 L ${lowerPercentile * 3} 100 Z')`}
            className="fill-primary-500/30"
          />
          
          {/* Draggable handles */}
          <g
            transform={`translate(${lowerPercentile * 3}, 0)`}
            className="cursor-ew-resize"
            onMouseDown={handleMouseDown('lower')}
          >
            <line
              y1="0"
              y2="100"
              className="stroke-primary-600 stroke-2"
            />
            <circle
              cy="50"
              r="6"
              className="fill-primary-600"
            />
          </g>
          
          <g
            transform={`translate(${upperPercentile * 3}, 0)`}
            className="cursor-ew-resize"
            onMouseDown={handleMouseDown('upper')}
          >
            <line
              y1="0"
              y2="100"
              className="stroke-primary-600 stroke-2"
            />
            <circle
              cy="50"
              r="6"
              className="fill-primary-600"
            />
          </g>
        </svg>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="text-center">
          <div className="text-sm font-medium">Lower Bound (5%)</div>
          <div className="text-xl font-bold">{lowerBound.toLocaleString()}</div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400">{unit}</div>
        </div>
        
        <div className="text-center">
          <div className="text-sm font-medium">Upper Bound (95%)</div>
          <div className="text-xl font-bold">{upperBound.toLocaleString()}</div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400">{unit}</div>
        </div>
      </div>
    </div>
  );
};

export default BellCurveInput;