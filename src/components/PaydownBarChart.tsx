import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import type { YearlyPaydown } from "../lib/mortgageMath";

type Props = {
  yearly: YearlyPaydown[];
};

export function PaydownBarChart({ yearly }: Props) {
  const theme = useTheme();
  const principalColor = theme.palette.primary.main;
  const interestColor = theme.palette.secondary.main;

  if (yearly.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No loan balance — chart appears when principal is greater than zero.
      </Typography>
    );
  }

  const max = Math.max(...yearly.map((y) => y.principal + y.interest), 1);
  const barGap = 4;
  const chartW = Math.min(640, 80 + yearly.length * 28);
  const chartH = 168;
  const padL = 32;
  const padR = 10;
  const padT = 10;
  const padB = 22;
  const innerW = chartW - padL - padR;
  const innerH = chartH - padT - padB;
  const barW = Math.max(6, (innerW - barGap * (yearly.length - 1)) / yearly.length);

  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2" color="text.secondary">
        Principal vs interest by year
      </Typography>
      <Box sx={{ width: "100%", overflowX: "auto" }}>
        <svg
          width={chartW}
          height={chartH}
          viewBox={`0 0 ${chartW} ${chartH}`}
          role="img"
          aria-label="Stacked bar chart of principal and interest paid each year"
        >
          <title>Principal vs interest by calendar year of the loan</title>
          {yearly.map((y, i) => {
            const x = padL + i * (barW + barGap);
            const intH = (y.interest / max) * innerH;
            const prinH = (y.principal / max) * innerH;
            const baseY = padT + innerH;
            return (
              <g key={y.year}>
                <rect
                  x={x}
                  y={baseY - prinH}
                  width={barW}
                  height={prinH}
                  rx={3}
                  fill={principalColor}
                />
                <rect
                  x={x}
                  y={baseY - prinH - intH}
                  width={barW}
                  height={intH}
                  rx={3}
                  fill={interestColor}
                  opacity={0.85}
                />
                <text
                  x={x + barW / 2}
                  y={chartH - 6}
                  textAnchor="middle"
                  fill={theme.palette.text.secondary}
                  fontSize={10}
                >
                  {y.year}
                </text>
              </g>
            );
          })}
        </svg>
      </Box>
      <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
        <LegendDot color={principalColor} label="Principal" />
        <LegendDot color={interestColor} label="Interest" />
      </Stack>
    </Stack>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <Stack direction="row" spacing={0.75} alignItems="center">
      <Box sx={{ width: 10, height: 10, borderRadius: 1, bgcolor: color }} />
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Stack>
  );
}
