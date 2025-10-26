'use client';
import type { RankedCandidate } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import RadarChartComponent from './radar-chart';
import { useMemo } from 'react';

interface CandidateCardProps {
  candidate: RankedCandidate;
  rank: number;
}

export default function CandidateCard({ candidate, rank }: CandidateCardProps) {
  const { employee, score, explanation } = candidate;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  };

  const getScoreColor = (value: number) => {
    if (value >= 90) return 'bg-green-600';
    if (value >= 75) return 'bg-blue-600';
    if (value >= 60) return 'bg-yellow-500';
    return 'bg-red-600';
  };

  const radarData = useMemo(() => {
    const educationMapping = { S1: 60, S2: 80, S3: 100 };
    return [
      {
        subject: 'Pengalaman',
        value: Math.min((employee.pengalaman_tahun / 20) * 100, 100),
      },
      { subject: 'SKP', value: employee.skp_skor },
      { subject: 'Kinerja', value: employee.kinerja_harian_rata },
      { subject: 'Pendidikan', value: educationMapping[employee.pendidikan] || 50 },
    ];
  }, [employee]);

  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="flex-row items-start gap-4 space-y-0 bg-muted/20">
        <Avatar className="h-12 w-12 border">
          <AvatarImage
            src={employee.avatar}
            alt={employee.nama}
            data-ai-hint="person portrait"
          />
          <AvatarFallback>{getInitials(employee.nama)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <CardTitle className="text-lg">{employee.nama}</CardTitle>
          <CardDescription>{employee.dinas}</CardDescription>
        </div>
        <Badge variant="secondary" className="text-lg font-bold text-primary">
          #{rank}
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between p-4">
        <div>
          <div className="mb-4">
              <RadarChartComponent data={radarData} />
          </div>
          <div className="mb-2 flex justify-between text-sm">
            <span className="font-medium text-muted-foreground">
              Skor Kompatibilitas
            </span>
            <span className="font-bold text-foreground">{score}%</span>
          </div>
          <Progress
            value={score}
            className="h-3 [&>div]:"
            style={
              {
                '--tw-bg-opacity': 1,
                backgroundColor: getScoreColor(score),
              } as React.CSSProperties
            }
          />
        </div>
      </CardContent>
      <CardFooter className="p-0">
        <Accordion type="single" collapsible className="w-full px-4 pb-2">
          <AccordionItem value="explanation" className="border-none">
            <AccordionTrigger className="py-2 text-sm text-primary hover:no-underline">
              Lihat Penjelasan AI
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">
              {explanation}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardFooter>
    </Card>
  );
}
