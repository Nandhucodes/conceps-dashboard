import { useState } from 'react';
import './Charts.css';

function LineChart({ data, title }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const width = 600;
  const height = 260;
  const paddingLeft = 50;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const allValues = data.datasets.flatMap((d) => d.data);
  const minValue = Math.min(...allValues) * 0.9;
  const maxValue = Math.max(...allValues) * 1.05;
  const range = maxValue - minValue;

  const getX = (index) => paddingLeft + (index / (data.labels.length - 1)) * chartWidth;
  const getY = (value) => paddingTop + chartHeight - ((value - minValue) / range) * chartHeight;

  const getPath = (points) => {
    return points
      .map((p, i) => {
        if (i === 0) return `M ${getX(i)} ${getY(p)}`;
        const x1 = getX(i - 1) + (getX(i) - getX(i - 1)) / 3;
        const y1 = getY(points[i - 1]);
        const x2 = getX(i) - (getX(i) - getX(i - 1)) / 3;
        const y2 = getY(p);
        return `C ${x1} ${y1}, ${x2} ${y2}, ${getX(i)} ${getY(p)}`;
      })
      .join(' ');
  };

  const getAreaPath = (points, color) => {
    const linePath = getPath(points);
    const lastX = getX(points.length - 1);
    const baseY = paddingTop + chartHeight;
    return `${linePath} L ${lastX} ${baseY} L ${paddingLeft} ${baseY} Z`;
  };

  const yTickCount = 5;
  const yTicks = Array.from({ length: yTickCount + 1 }, (_, i) => {
    return minValue + (range / yTickCount) * i;
  });

  const formatValue = (v) => {
    if (v >= 1000) return `$${(v / 1000).toFixed(0)}k`;
    return `$${v}`;
  };

  return (
    <div className="chart-container">
      {title && <h3 className="chart-title">{title}</h3>}
      <div className="chart-legend">
        {data.datasets.map((ds) => (
          <div key={ds.label} className="chart-legend-item">
            <span className="chart-legend-dot" style={{ background: ds.color }} />
            <span>{ds.label}</span>
          </div>
        ))}
      </div>
      <div className="chart-svg-wrapper">
        <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg" aria-label={`Line chart: ${title}`}>
          <defs>
            {data.datasets.map((ds, di) => (
              <linearGradient key={di} id={`areaGrad-${di}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={ds.color} stopOpacity="0.2" />
                <stop offset="100%" stopColor={ds.color} stopOpacity="0.02" />
              </linearGradient>
            ))}
          </defs>

          {/* Grid lines */}
          {yTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={paddingLeft}
                y1={getY(tick)}
                x2={width - paddingRight}
                y2={getY(tick)}
                stroke="var(--color-border)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={paddingLeft - 8}
                y={getY(tick) + 4}
                textAnchor="end"
                fontSize="11"
                fill="var(--color-text-muted)"
              >
                {formatValue(tick)}
              </text>
            </g>
          ))}

          {/* Area fills */}
          {data.datasets.map((ds, di) => (
            <path
              key={`area-${di}`}
              d={getAreaPath(ds.data)}
              fill={`url(#areaGrad-${di})`}
            />
          ))}

          {/* Lines */}
          {data.datasets.map((ds, di) => (
            <path
              key={`line-${di}`}
              d={getPath(ds.data)}
              fill="none"
              stroke={ds.color}
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ))}

          {/* Data points */}
          {data.datasets.map((ds, di) =>
            ds.data.map((val, i) => (
              <circle
                key={`point-${di}-${i}`}
                cx={getX(i)}
                cy={getY(val)}
                r={hoveredPoint?.di === di && hoveredPoint?.i === i ? 6 : 4}
                fill={ds.color}
                stroke="var(--color-bg-card)"
                strokeWidth="2"
                style={{ cursor: 'pointer', transition: 'r 0.15s' }}
                onMouseEnter={() => setHoveredPoint({ di, i, val, label: data.labels[i] })}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            ))
          )}

          {/* Tooltip */}
          {hoveredPoint && (
            <g>
              <rect
                x={Math.min(getX(hoveredPoint.i) - 55, width - paddingRight - 115)}
                y={getY(hoveredPoint.val) - 48}
                width="110"
                height="38"
                rx="6"
                fill="var(--color-bg-secondary)"
                stroke="var(--color-border)"
                strokeWidth="1"
                filter="drop-shadow(0 2px 4px rgba(0,0,0,0.15))"
              />
              <text
                x={Math.min(getX(hoveredPoint.i) - 55, width - paddingRight - 115) + 55}
                y={getY(hoveredPoint.val) - 30}
                textAnchor="middle"
                fontSize="11"
                fill="var(--color-text-muted)"
              >
                {hoveredPoint.label}
              </text>
              <text
                x={Math.min(getX(hoveredPoint.i) - 55, width - paddingRight - 115) + 55}
                y={getY(hoveredPoint.val) - 16}
                textAnchor="middle"
                fontSize="13"
                fontWeight="600"
                fill="var(--color-text-primary)"
              >
                {formatValue(hoveredPoint.val)}
              </text>
            </g>
          )}

          {/* X Axis labels */}
          {data.labels.map((label, i) => (
            <text
              key={i}
              x={getX(i)}
              y={height - paddingBottom + 20}
              textAnchor="middle"
              fontSize="11"
              fill="var(--color-text-muted)"
            >
              {label}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}

export default LineChart;
