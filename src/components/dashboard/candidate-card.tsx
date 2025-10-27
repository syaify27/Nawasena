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
import { Separator } from '../ui/separator';
import { Award, Briefcase, GraduationCap } from 'lucide-react';

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
    return [
      { subject: 'Leadership', value: employee.leadership },
      { subject: 'Analytical', value: employee.analyticalThinking },
      { subject: 'Public Svc', value: employee.publicService },
      { subject: 'Digital Lit', value: employee.digitalLiteracy },
      { subject: 'Collaboration', value: employee.collaboration },
      { subject: 'Integrity', value: employee.integrity },
    ];
  }, [employee]);

  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="flex-row items-start gap-4 space-y-0 bg-muted/20 p-4">
        <Avatar className="h-12 w-12 border">
          <AvatarImage
            src={employee.avatar}
            alt={employee.nama}
            data-ai-hint="person portrait"
          />
          <AvatarFallback>{getInitials(employee.nama)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <CardTitle className="text-base">{employee.nama}</CardTitle>
          <CardDescription className="text-xs">{employee.dinas}</CardDescription>
        </div>
        <Badge variant="secondary" className="text-lg font-bold text-primary">
          #{rank}
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between p-4">
        <div>
          <div className="mb-2">
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
            className="h-2"
            indicatorClassName={getScoreColor(score)}
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start bg-muted/20 p-0">
        <Accordion type="single" collapsible className="w-full px-4">
          <AccordionItem value="details" className="border-none">
            <AccordionTrigger className="py-2 text-sm text-primary hover:no-underline">
              Lihat Detail & Rekomendasi
            </AccordionTrigger>
            <AccordionContent className="space-y-4 text-sm">
              <div>
                <h4 className="mb-1 font-semibold">Penjelasan AI:</h4>
                <p className="text-muted-foreground">{explanation}</p>
              </div>
              <Separator />
              <div className="space-y-2">
                 <h4 className="font-semibold">Rekomendasi Pengembangan:</h4>
                 <div className="flex items-start gap-2 text-muted-foreground">
                    <GraduationCap className="mt-1 h-4 w-4 flex-shrink-0" />
                    <span>{employee.recommendedTreatment.join(', ')}</span>
                 </div>
              </div>
               <div className="space-y-2">
                 <h4 className="font-semibold">Jenjang Karir Potensial:</h4>
                 <div className="flex items-start gap-2 text-muted-foreground">
                    <Briefcase className="h-4 w-4 flex-shrink-0 mt-1" />
                    <span>{employee.talentGrowthPath.join(', ')}</span>
                 </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardFooter>
    </Card>
  );
}
