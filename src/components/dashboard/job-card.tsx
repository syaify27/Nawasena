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
import { Badge } from '../ui/badge';

interface JobCardProps {
  prospect: AIFlowRecommendation;
}

export default function JobCard({ prospect }: JobCardProps) {
  const { jobName, compatibilityScore, explanation } = prospect;
  // We don't have all job details here, so we extract what we can from the name or leave it.
  // This is a limitation of the current AI flow output.
  const jobDetails = prospect.jobName.split(' - ');
  const title = jobDetails[0];
  const department = jobDetails.length > 1 ? jobDetails[1] : '';

  const getScoreColor = (value: number) => {
    if (value >= 90) return 'bg-green-600';
    if (value >= 75) return 'bg-blue-600';
    if (value >= 60) return 'bg-yellow-500';
    return 'bg-red-600';
  }

  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-lg">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {department && <CardDescription>{department}</CardDescription>}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between space-y-4">
        <div>
            <div className="mb-2 flex justify-between text-sm">
                <span className="font-medium text-muted-foreground">
                Skor Kompatibilitas
                </span>
                <span className="font-bold text-foreground">{compatibilityScore}%</span>
            </div>
            <Progress value={compatibilityScore} className="h-3" style={{ '--tw-bg-opacity': 1, backgroundColor: getScoreColor(compatibilityScore) } as React.CSSProperties} />
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
