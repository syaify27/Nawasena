'use client';

import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { findCompatibleCandidates } from '@/lib/actions';
import type { Job, RankedCandidate } from '@/lib/types';
import CandidateCard from './candidate-card';
import { Skeleton } from '../ui/skeleton';
import { Users, Search } from 'lucide-react';
import BiasChecker from './bias-checker';

interface JobCompatibilityProps {
  jobs: Job[];
}

export default function JobCompatibility({ jobs }: JobCompatibilityProps) {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<RankedCandidate[]>([]);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!selectedJobId) {
      toast({
        title: 'Peringatan',
        description: 'Silakan pilih jabatan terlebih dahulu.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setResults([]);
    try {
      const candidates = await findCompatibleCandidates(selectedJobId);
      setResults(candidates);
    } catch (error) {
      toast({
        title: 'Terjadi Kesalahan',
        description: 'Gagal mencari kandidat. Silakan coba lagi.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedJob = jobs.find(j => j.id_jabatan === selectedJobId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row">
        <Select onValueChange={setSelectedJobId} value={selectedJobId || ''}>
          <SelectTrigger className="w-full sm:w-[350px]">
            <SelectValue placeholder="Pilih Jabatan..." />
          </SelectTrigger>
          <SelectContent>
            {jobs.map((job) => (
              <SelectItem key={job.id_jabatan} value={job.id_jabatan}>
                {job.nama_jabatan}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleSearch} disabled={isLoading} className="w-full sm:w-auto">
          <Search className="mr-2 h-4 w-4" />
          {isLoading ? 'Mencari...' : 'Cari Kandidat'}
        </Button>
      </div>

      {isLoading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
             <div key={i} className="flex flex-col space-y-3">
                <Skeleton className="h-[125px] w-full rounded-xl" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && results.length > 0 && selectedJob &&(
        <div className="space-y-4">
            <div className='flex justify-between items-center'>
                <h3 className="text-xl font-semibold">
                    Top 5 Kandidat untuk {selectedJob.nama_jabatan}
                </h3>
                <BiasChecker job={selectedJob} candidates={results} />
            </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {results.map((candidate, index) => (
              <CandidateCard
                key={candidate.employee.id_pegawai}
                candidate={candidate}
                rank={index + 1}
              />
            ))}
          </div>
        </div>
      )}

      {!isLoading && results.length === 0 && (
         <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 p-12 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold tracking-tight text-foreground">
                Hasil Pencarian Akan Tampil di Sini
            </h3>
            <p className="text-muted-foreground">
                Pilih jabatan dan klik "Cari Kandidat" untuk memulai.
            </p>
         </div>
      )}
    </div>
  );
}
