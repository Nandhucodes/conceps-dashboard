import { useState } from 'react';
import './Charts.css';

function DonutChart({ data, title }) {
  const [hoveredSlice, setHoveredSlice] = useState(null);

  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = 80;
  const innerRadius = 50;

  const total = data.reduce((sum, d) => sum + d.value, 0);

  let cumulativeAngle = -Math.PI / 2;

  const slices = data.map((item, i) => {
    const angle = (item.value / total) * 2 * Math.PI;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
    cumulativeAngle = endAngle;

    const x1 = cx + outerRadius * Math.cos(startAngle);
    const y1 = cy + outerRadius * Math.sin(startAngle);
    const x2 = cx + outerRadius * Math.cos(endAngle);
    const y2 = cy + outerRadius * Math.sin(endAngle);
    const ix1 = cx + innerRadius * Math.cos(endAngle);
    const iy1 = cy + innerRadius * Math.sin(endAngle);
    const ix2 = cx + innerRadius * Math.cos(startAngle);
    const iy2 = cy + innerRadius * Math.sin(startAngle);

    const largeArc = angle > Math.PI ? 1 : 0;

    const path = [
      `M ${x1} ${y1}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${ix1} ${iy1}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix2} ${iy2}`,
      'Z',
    ].join(' ');

    const midAngle = startAngle + angle / 2;
    const labelRadius = (outerRadius + innerRadius) / 2;
    const labelX = cx + labelRadius * Math.cos(midAngle);
    const labelY = cy + labelRadius * Math.sin(midAngle);

    return { ...item, path, labelX, labelY, midAngle, i };
  });

  const hovered = hoveredSlice !== null ? data[hoveredSlice] : null;

  return (
    <div className="chart-container">
      {title && <h3 className="chart-title">{title}</h3>}
      <div className="donut-chart-wrapper">
        <div className="donut-svg-container">
          <svg viewBox={`0 0 ${size} ${size}`} className="donut-svg">
            {slices.map((slice, i) => {
              const isHovered = hoveredSlice === i;
              const scale = isHovered ? 1.05 : 1;
              const translateX = isHovered ? (cx - cx * scale) : 0;
              const translateY = isHovered ? (cy - cy * scale) : 0;

              return (
                <path
                  key={i}
                  d={slice.path}
                  fill={slice.color}
                  opacity={hoveredSlice !== null && !isHovered ? 0.6 : 1}
                  style={{
                    cursor: 'pointer',
                    transition: 'transform 0.15s, opacity 0.15s',
                    transform: isHovered ? `scale(1.05)` : 'scale(1)',
                    transformOrigin: `${cx}px ${cy}px`,
                  }}
                  onMouseEnter={() => setHoveredSlice(i)}
                  onMouseLeave={() => setHoveredSlice(null)}
                />
              );
            })}

            {/* Center text */}
            <text x={cx} y={cy - 8} textAnchor="middle" fontSize="13" fill="var(--color-text-muted)">
              {hovered ? hovered.label : 'Total'}
            </text>
            <text x={cx} y={cy + 12} textAnchor="middle" fontSize="18" fontWeight="700" fill="var(--color-text-primary)">
              {hovered ? `${hovered.value}%` : `${total}%`}
            </text>
          </svg>
        </div>

        <div className="donut-legend">
          {data.map((item, i) => (
            <div
              key={i}
              className={`donut-legend-item ${hoveredSlice === i ? 'donut-legend-item--active' : ''}`}
              onMouseEnter={() => setHoveredSlice(i)}
              onMouseLeave={() => setHoveredSlice(null)}
            >
              <span className="donut-legend-color" style={{ background: item.color }} />
              <span className="donut-legend-label">{item.label}</span>
              <span className="donut-legend-value">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DonutChart;
