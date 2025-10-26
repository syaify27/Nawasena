'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { ShieldAlert, Bot, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { checkBias } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import type { Job, RankedCandidate } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

interface BiasCheckerProps {
  job: Job;
  candidates: RankedCandidate[];
}

type BiasResult = {
    biasDetected: boolean;
    biasMitigationStrategy: string;
    adjustedScores: string;
} | null;

export default function BiasChecker({ job, candidates }: BiasCheckerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<BiasResult>(null);
  const { toast } = useToast();

  const handleCheckBias = async () => {
    setIsLoading(true);
    setResult(null);
    try {
      const biasResult = await checkBias(job, candidates);
      setResult(biasResult);
    } catch (error) {
      toast({
        title: 'Gagal Memeriksa Bias',
        description: 'Terjadi kesalahan saat berkomunikasi dengan AI.',
        variant: 'destructive',
      });
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <ShieldAlert className="mr-2 h-4 w-4" />
          Periksa Bias
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Pemeriksaan Bias AI</DialogTitle>
          <DialogDescription>
            Menganalisis hasil rekomendasi untuk potensi bias berdasarkan usia atau dinas.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {!result && !isLoading && (
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <Bot size={48} className="text-muted-foreground" />
              <p className="text-muted-foreground">
                Klik "Mulai Analisis" untuk meminta AI memeriksa potensi bias pada 5 kandidat teratas.
              </p>
              <Button onClick={handleCheckBias}>
                Mulai Analisis
              </Button>
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">AI sedang menganalisis...</p>
            </div>
          )}
          
          {result && !isLoading && (
            <div className='space-y-4'>
                {result.biasDetected ? (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Potensi Bias Terdeteksi</AlertTitle>
                        <AlertDescription>
                           AI mengidentifikasi kemungkinan adanya bias dalam hasil rekomendasi.
                        </AlertDescription>
                    </Alert>
                ) : (
                    <Alert variant="default" className="border-green-500 bg-green-50 text-green-800 dark:border-green-600 dark:bg-green-950 dark:text-green-300 [&>svg]:text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <AlertTitle>Tidak Ada Bias Terdeteksi</AlertTitle>
                        <AlertDescription>
                            AI tidak menemukan indikasi bias yang signifikan pada hasil.
                        </AlertDescription>
                    </Alert>
                )}
                
                <div className='space-y-2 rounded-lg border bg-background p-4'>
                    <h4 className='font-semibold'>Strategi Mitigasi dari AI:</h4>
                    <p className='text-sm text-muted-foreground'>{result.biasMitigationStrategy}</p>
                </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Tutup</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
