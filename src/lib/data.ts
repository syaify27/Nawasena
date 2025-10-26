import employeesData from '@/data/employees.json';
import jobsData from '@/data/jobs.json';
import type { Employee, Job } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const employees: Employee[] = employeesData as Employee[];
const jobs: Job[] = jobsData as Job[];

const imageMap = new Map(PlaceHolderImages.map((p) => [p.id, p.imageUrl]));

const employeesWithImages: Employee[] = employees.map((emp) => ({
  ...emp,
  avatar:
    imageMap.get(emp.avatar) ||
    'https://picsum.photos/seed/placeholder/100/100',
}));

export function getEmployees(): Employee[] {
  return employeesWithImages;
}

export function getJobs(): Job[] {
  return jobs;
}

export function getEmployeeById(id: string): Employee | undefined {
  return employeesWithImages.find((e) => e.id_pegawai === id);
}

export function getJobById(id: string): Job | undefined {
  return jobs.find((j) => j.id_jabatan === id);
}
