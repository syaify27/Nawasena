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
import { findJobProspects } from '@/lib/actions';
import type { Employee, AIFlowRecommendation } from '@/lib/types';
import JobCard from './job-card';
import { Skeleton } from '../ui/skeleton';
import { Briefcase, Search } from 'lucide-react';

interface EmployeeProspectsProps {
  employees: Employee[];
}

export default function EmployeeProspects({ employees }: EmployeeProspectsProps) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<AIFlowRecommendation[]>([]);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!selectedEmployeeId) {
      toast({
        title: 'Peringatan',
        description: 'Silakan pilih pegawai terlebih dahulu.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setResults([]);
    try {
      const prospects = await findJobProspects(selectedEmployeeId);
      setResults(prospects);
    } catch (error) {
      toast({
        title: 'Terjadi Kesalahan',
        description: 'Gagal mencari rekomendasi. Silakan coba lagi.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row">
        <Select
          onValueChange={setSelectedEmployeeId}
          value={selectedEmployeeId || ''}
        >
          <SelectTrigger className="w-full sm:w-[350px]">
            <SelectValue placeholder="Pilih Pegawai..." />
          </SelectTrigger>
          <SelectContent>
            {employees.map((employee) => (
              <SelectItem
                key={employee.id_pegawai}
                value={employee.id_pegawai}
              >
                {employee.nama}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleSearch} disabled={isLoading} className="w-full sm:w-auto">
          <Search className="mr-2 h-4 w-4" />
          {isLoading ? 'Mencari...' : 'Cari Rekomendasi'}
        </Button>
      </div>

      {isLoading && (
         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col space-y-3 rounded-xl border bg-card p-4">
                <div className="space-y-2">
                    <Skeleton className="h-5 w-4/5" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
                 <Skeleton className="h-8 w-full" />
                 <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && results.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">
            Rekomendasi Jabatan untuk{' '}
            {employees.find((e) => e.id_pegawai === selectedEmployeeId)?.nama}
          </h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {results.map((prospect) => (
              <JobCard key={prospect.jobId} prospect={prospect} />
            ))}
          </div>
        </div>
      )}

      {!isLoading && results.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 p-12 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <Briefcase className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold tracking-tight text-foreground">
                Hasil Rekomendasi Akan Tampil di Sini
            </h3>
            <p className="text-muted-foreground">
                Pilih seorang pegawai dan klik "Cari Rekomendasi" untuk memulai.
            </p>
         </div>
      )}
    </div>
  );
}
