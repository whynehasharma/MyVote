import React, { useRef, useEffect } from 'react';
import { CHART_COLORS } from '../utils/helpers';
import { useTheme } from '../context/ThemeContext';

export default function CanvasBarChart({ election }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const { theme } = useTheme();

  const candidates = election?.candidates || [];
  const votes = election?.votes || {};
  const totalVotes = Object.values(votes).reduce((sum, v) => sum + (Number(v) || 0), 0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    const renderChart = () => {
      const width = container.clientWidth || 600;
      // Adjust height based on number of candidates
      const dynamicHeight = Math.max(220, candidates.length * 48 + 40);

      canvas.width = width * dpr;
      canvas.height = dynamicHeight * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${dynamicHeight}px`;

      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, dynamicHeight);

      if (candidates.length === 0) {
        ctx.fillStyle = theme === 'dark' ? '#94a3b8' : '#64748b';
        ctx.font = '14px Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('No candidates registered in this election', width / 2, dynamicHeight / 2);
        return;
      }

      const pad = 16;
      const barHeight = Math.floor((dynamicHeight - pad * 2) / candidates.length);
      const isDark = theme === 'dark';

      // Colors from theme
      const trackColor = isDark ? '#1e293b' : '#f1f5f9';
      const textColor = isDark ? '#f8fafc' : '#1e293b';
      const mutedColor = isDark ? '#94a3b8' : '#64748b';

      ctx.textBaseline = 'middle';

      const labelWidth = Math.min(180, Math.floor(width * 0.3));
      const chartStartX = labelWidth + 10;
      const availableBarWidth = width - chartStartX - 90; // room for vote label

      candidates.forEach((c, idx) => {
        const count = Number(votes[c.id]) || 0;
        const percent = totalVotes > 0 ? count / totalVotes : 0;
        const barW = Math.round(availableBarWidth * percent);
        const y = pad + idx * barHeight;
        const barY = y + 8;
        const barH = Math.max(16, barHeight - 16);

        // Candidate Label (truncated if too long)
        ctx.font = '500 13px Inter, system-ui, sans-serif';
        ctx.fillStyle = textColor;
        ctx.textAlign = 'left';

        let displayLabel = c.label;
        if (ctx.measureText(displayLabel).width > labelWidth) {
          while (displayLabel.length > 3 && ctx.measureText(displayLabel + '...').width > labelWidth) {
            displayLabel = displayLabel.slice(0, -1);
          }
          displayLabel += '...';
        }
        ctx.fillText(displayLabel, 8, y + barHeight / 2);

        // Background Track
        ctx.fillStyle = trackColor;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(chartStartX, barY, availableBarWidth, barH, 4) : ctx.rect(chartStartX, barY, availableBarWidth, barH);
        ctx.fill();

        // Active Colored Bar
        if (barW > 0) {
          const color = CHART_COLORS[idx % CHART_COLORS.length];
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.roundRect ? ctx.roundRect(chartStartX, barY, barW, barH, 4) : ctx.rect(chartStartX, barY, barW, barH);
          ctx.fill();
        }

        // Vote Count & Percentage Text
        ctx.fillStyle = mutedColor;
        ctx.font = '600 12px Inter, system-ui, sans-serif';
        ctx.textAlign = 'left';
        const percentStr = `${Math.round(percent * 100)}%`;
        const countStr = `${count} ${count === 1 ? 'vote' : 'votes'} (${percentStr})`;
        ctx.fillText(countStr, chartStartX + availableBarWidth + 10, y + barHeight / 2);
      });
    };

    renderChart();

    const resizeObserver = new ResizeObserver(() => renderChart());
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [candidates, votes, totalVotes, theme]);

  return (
    <div style={{ width: '100%' }}>
      <div ref={containerRef} className="chart-container" style={{ height: 'auto', minHeight: '220px' }}>
        <canvas ref={canvasRef} className="chart-canvas" />
      </div>

      {candidates.length > 0 && (
        <div className="chart-legend">
          {candidates.map((c, i) => {
            const count = Number(votes[c.id]) || 0;
            const percent = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
            const color = CHART_COLORS[i % CHART_COLORS.length];

            return (
              <div key={c.id} className="legend-item">
                <span className="legend-color-box" style={{ backgroundColor: color }} />
                <span>
                  <strong>{c.label}</strong>: {count} votes ({percent}%)
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
