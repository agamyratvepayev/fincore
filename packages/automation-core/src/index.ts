export type ReportJob = {
  tenantId: string;
  reportCode: string;
  runAt: Date;
};

export function planJob(job: ReportJob) {
  return {
    ...job,
    status: "planned" as const
  };
}
