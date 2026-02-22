import { useState } from 'react';
import './Charts.css';

function BarChart({ data, title }) {
  const [hoveredBar, setHoveredBar] = useState(null);

  const width = 500;
  const height = 240;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxValue = Math.max(...data.data) * 1.1;
  const barCount = data.data.length;
  const groupWidth = chartWidth / barCount;
  const barWidth = groupWidth * 0.55;

  const getBarX = (i) => paddingLeft + i * groupWidth + (groupWidth - barWidth) / 2;
  const getBarHeight = (val) => (val / maxValue) * chartHeight;
  const getBarY = (val) => paddingTop + chartHeight - getBarHeight(val);

  const yTickCount = 4;
  const yTicks = Array.from({ length: yTickCount + 1 }, (_, i) => {
    return Math.round((maxValue / yTickCount) * i);
  });

  return (
    <div className="chart-container">
      {title && <h3 className="chart-title">{title}</h3>}
      <div className="chart-svg-wrapper">
        <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg" aria-label={`Bar chart: ${title}`}>
          <defs>
            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={data.color} stopOpacity="1" />
              <stop offset="100%" stopColor={data.color} stopOpacity="0.6" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {yTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={paddingLeft}
                y1={paddingTop + chartHeight - (tick / maxValue) * chartHeight}
                x2={width - paddingRight}
                y2={paddingTop + chartHeight - (tick / maxValue) * chartHeight}
                stroke="var(--color-border)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={paddingLeft - 8}
                y={paddingTop + chartHeight - (tick / maxValue) * chartHeight + 4}
                textAnchor="end"
                fontSize="10"
                fill="var(--color-text-muted)"
              >
                {tick}
              </text>
            </g>
          ))}

          {/* Bars */}
          {data.data.map((val, i) => {
            const isHovered = hoveredBar === i;
            const barH = getBarHeight(val);
            const barY = getBarY(val);
            const barX = getBarX(i);

            return (
              <g key={i}>
                <rect
                  x={barX}
                  y={barY}
                  width={barWidth}
                  height={barH}
                  rx="4"
                  fill={isHovered ? data.color : 'url(#barGrad)'}
                  opacity={hoveredBar !== null && !isHovered ? 0.5 : 1}
                  style={{ cursor: 'pointer', transition: 'opacity 0.15s' }}
                  onMouseEnter={() => setHoveredBar(i)}
                  onMouseLeave={() => setHoveredBar(null)}
                />
                {isHovered && (
                  <g>
                    <rect
                      x={barX + barWidth / 2 - 24}
                      y={barY - 32}
                      width="48"
                      height="24"
                      rx="4"
                      fill="var(--color-bg-secondary)"
                      stroke="var(--color-border)"
                      strokeWidth="1"
                    />
                    <text
                      x={barX + barWidth / 2}
                      y={barY - 14}
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="600"
                      fill="var(--color-text-primary)"
                    >
                      {val}
                    </text>
                  </g>
                )}
                <text
                  x={barX + barWidth / 2}
                  y={height - paddingBottom + 18}
                  textAnchor="middle"
                  fontSize="11"
                  fill="var(--color-text-muted)"
                >
                  {data.labels[i]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export default BarChart;
