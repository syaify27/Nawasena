export type Employee = {
  id_pegawai: string;
  nama: string;
  usia: number;
  pendidikan: 'S1' | 'S2' | 'S3';
  pengalaman_tahun: number;
  skill: string[];
  skp_skor: number;
  kinerja_harian_rata: number;
  dinas: string;
  avatar: string;
};

export type Job = {
  id_jabatan: string;
  nama_jabatan: string;
  dinas: string;
  required_skill: string[];
  level: 'Eselon 2' | 'Eselon 3';
};

export type AIFlowRecommendation = {
  jobId: string;
  jobName: string;
  compatibilityScore: number;
  explanation: string;
};

export type RankedCandidate = {
  employee: Employee;
  score: number;
  explanation: string;
};
