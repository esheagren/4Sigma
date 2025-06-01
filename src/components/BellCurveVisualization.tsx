import React from 'react';

interface BellCurveVisualizationProps {
  lowerBound: number;
  upperBound: number;
  correctAnswer: number;
  unit: string;
}

const BellCurveVisualization: React.FC<BellCurveVisualizationProps> = ({
  lowerBound,
  upperBound,
  correctAnswer,
  unit
}) => {
  const isCorrect = correctAnswer >= lowerBound && correctAnswer <= upperBound;
  
  // Calculate parameters for the Gaussian curve
  const mean = (lowerBound + upperBound) / 2;
  const standardDeviation = (upperBound - lowerBound) / 4;
  
  // Generate points for the Gaussian curve
  const points: [number, number][] = [];
  const numPoints = 100;
  const xMin = Math.min(lowerBound, correctAnswer) - standardDeviation;
  const xMax = Math.max(upperBound, correctAnswer) + standardDeviation;
  const range = xMax - xMin;
  
  for (let i = 0; i < numPoints; i++) {
    const x = xMin + (range * i) / (numPoints - 1);
    const y = Math.exp(-Math.pow(x - mean, 2) / (2 * Math.pow(standardDeviation, 2)));
    points.push([x, y]);
  }
  
  // Scale points to SVG coordinates
  const svgWidth = 400;
  const svgHeight = 200;
  const padding = { top: 40, right: 40, bottom: 60, left: 40 };
  
  const scaledPoints = points.map(([x, y]) => [
    ((x - xMin) / range) * (svgWidth - padding.left - padding.right) + padding.left,
    svgHeight - (y * (svgHeight - padding.top - padding.bottom) + padding.bottom)
  ]);
  
  // Calculate positions for bounds and correct answer
  const answerX = ((correctAnswer - xMin) / range) * (svgWidth - padding.left - padding.right) + padding.left;
  const lowerX = ((lowerBound - xMin) / range) * (svgWidth - padding.left - padding.right) + padding.left;
  const upperX = ((upperBound - xMin) / range) * (svgWidth - padding.left - padding.right) + padding.left;

  // Format numbers with appropriate units
  const formatNumber = (num: number) => {
    if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toLocaleString();
  };

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full h-auto"
        style={{ maxHeight: '200px' }}
      >
        {/* Background */}
        <rect
          x={padding.left}
          y={padding.top}
          width={svgWidth - padding.left - padding.right}
          height={svgHeight - padding.top - padding.bottom}
          className="fill-neutral-100 dark:fill-neutral-800"
        />
        
        {/* Confidence interval region */}
        <path
          d={`M ${scaledPoints[0][0]},${scaledPoints[0][1]} ` +
            scaledPoints.slice(1).map(point => `L ${point[0]},${point[1]}`).join(' ')}
          className={`fill-none stroke-2 ${
            isCorrect 
              ? 'stroke-green-500' 
              : 'stroke-red-500'
          }`}
        />
        
        {/* Correct answer line */}
        <line
          x1={answerX}
          y1={padding.top}
          x2={answerX}
          y2={svgHeight - padding.bottom}
          className={`stroke-2 ${isCorrect ? 'stroke-green-600' : 'stroke-red-600'}`}
        />
        
        {/* Answer label */}
        <text
          x={answerX}
          y={padding.top - 10}
          textAnchor="middle"
          className={`text-sm font-medium ${
            isCorrect 
              ? 'fill-green-600 dark:fill-green-400' 
              : 'fill-red-600 dark:fill-red-400'
          }`}
        >
          {formatNumber(correctAnswer)} {unit}
        </text>

        {/* Input bounds */}
        <g className="text-sm">
          {/* Lower bound */}
          <line
            x1={lowerX}
            y1={svgHeight - padding.bottom}
            x2={lowerX}
            y2={svgHeight - padding.bottom + 20}
            className="stroke-neutral-400"
            strokeDasharray="4,4"
          />
          <text
            x={lowerX}
            y={svgHeight - padding.bottom + 40}
            textAnchor="middle"
            className="fill-neutral-600 dark:fill-neutral-400 font-medium"
          >
            {formatNumber(lowerBound)}
          </text>

          {/* Upper bound */}
          <line
            x1={upperX}
            y1={svgHeight - padding.bottom}
            x2={upperX}
            y2={svgHeight - padding.bottom + 20}
            className="stroke-neutral-400"
            strokeDasharray="4,4"
          />
          <text
            x={upperX}
            y={svgHeight - padding.bottom + 40}
            textAnchor="middle"
            className="fill-neutral-600 dark:fill-neutral-400 font-medium"
          >
            {formatNumber(upperBound)}
          </text>
        </g>
      </svg>
      
    </div>
  );
};

export default BellCurveVisualization;