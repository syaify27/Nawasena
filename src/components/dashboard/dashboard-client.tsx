'use client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import JobCompatibility from './job-compatibility';
import EmployeeProspects from './employee-prospects';
import type { Employee, Job } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

interface DashboardClientProps {
  employees: Employee[];
  jobs: Job[];
}

export default function DashboardClient({
  employees,
  jobs,
}: DashboardClientProps) {
  return (
    <Tabs defaultValue="compatibility" className="w-full">
      <TabsList className="grid w-full grid-cols-2 md:w-fit">
        <TabsTrigger value="compatibility">Cari Kandidat Jabatan</TabsTrigger>
        <TabsTrigger value="prospects">Rekomendasi Jabatan Pegawai</TabsTrigger>
      </TabsList>
      <TabsContent value="compatibility">
        <Card>
            <CardHeader>
                <CardTitle>Pencarian Kandidat untuk Jabatan</CardTitle>
                <CardDescription>Pilih sebuah jabatan untuk melihat 5 kandidat pegawai ASN yang paling cocok berdasarkan skor kompatibilitas.</CardDescription>
            </CardHeader>
            <CardContent>
                <JobCompatibility jobs={jobs} />
            </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="prospects">
      <Card>
            <CardHeader>
                <CardTitle>Pencarian Rekomendasi Jabatan</CardTitle>
                <CardDescription>Pilih seorang pegawai untuk melihat rekomendasi jabatan yang paling sesuai dengan profil dan kinerjanya.</CardDescription>
            </CardHeader>
            <CardContent>
                <EmployeeProspects employees={employees} />
            </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
