'use client';
import type { AIFlowRecommendation } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Progress } from '../ui/progress';
import RadarChartComponent from './radar-chart';
import { useMemo } from 'react';
import { getJobById } from '@/lib/data';


interface JobCardProps {
  prospect: AIFlowRecommendation;
}

export default function JobCard({ prospect }: JobCardProps) {
  const { jobId, jobName, compatibilityScore, explanation } = prospect;
  const jobDetails = getJobById(jobId);

  const title = jobDetails?.nama_jabatan || jobName;
  const department = jobDetails?.dinas || '';

  const getScoreColor = (value: number) => {
    if (value >= 90) return 'bg-green-600';
    if (value >= 75) return 'bg-blue-600';
    if (value >= 60) return 'bg-yellow-500';
    return 'bg-red-600';
  };
  
  const radarData = useMemo(() => {
    if (!jobDetails) return [];
    
    // Define ideal competency scores for a job level
    const levelMultiplier = jobDetails.level === 'Eselon 2' ? 1.0 : 0.8;
    const idealScores = {
        leadership: 90 * levelMultiplier,
        analyticalThinking: 85 * levelMultiplier,
        publicService: 85 * levelMultiplier,
        digitalLiteracy: 80 * levelMultiplier,
        collaboration: 85 * levelMultiplier,
        integrity: 90 * levelMultiplier,
    };
    
    // We add compatibility score to the radar to show overall fitness
    return [
        { subject: 'Compatibility', value: compatibilityScore },
        { subject: 'Leadership', value: idealScores.leadership },
        { subject: 'Analytical', value: idealScores.analyticalThinking },
        { subject: 'Service', value: idealScores.publicService },
        { subject: 'Digital', value: idealScores.digitalLiteracy },
        { subject: 'Collaboration', value: idealScores.collaboration },
        { subject: 'Integrity', value: idealScores.integrity },
    ];
  }, [jobDetails, compatibilityScore]);

  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-lg">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {department && <CardDescription>{department}</CardDescription>}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between space-y-4">
        <div>
          <div className='mb-4'>
            <RadarChartComponent data={radarData} />
          </div>
          <div className="mb-2 flex justify-between text-sm">
            <span className="font-medium text-muted-foreground">
              Skor Kompatibilitas
            </span>
            <span className="font-bold text-foreground">
              {compatibilityScore}%
            </span>
          </div>
          <Progress
            value={compatibilityScore}
            className="h-2"
            indicatorClassName={getScoreColor(compatibilityScore)}
          />
        </div>
        <Accordion type="single" collapsible>
          <AccordionItem value="explanation" className="border-t pt-2">
            <AccordionTrigger className="py-2 text-sm text-primary hover:no-underline">
              Lihat Penjelasan AI
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">
              {explanation}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
