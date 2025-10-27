'use client';
import {
  PolarGrid,
  PolarAngleAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  PolarRadiusAxis,
  Tooltip,
} from 'recharts';
import { ChartTooltipContent } from '../ui/chart';

interface RadarChartProps {
  data: { subject: string; value: number }[];
}

export default function RadarChartComponent({ data }: RadarChartProps) {
  if (!data || data.length === 0) {
    return null;
  }
  
  return (
    <ResponsiveContainer width="100%" height={150}>
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
        <PolarGrid gridType="polygon" />
        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9 }} />
        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
        <Radar
          name="Mike"
          dataKey="value"
          stroke="hsl(var(--primary))"
          fill="hsl(var(--primary))"
          fillOpacity={0.6}
        />
        <Tooltip content={<ChartTooltipContent />} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
