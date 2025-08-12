import { Card, CardBody, Spinner } from "@heroui/react";

import { Job, jobStatusColorMap } from "@/lib/types";

export default function JobsComponent({
  jobs
}: {
  jobs: Job[];
}) {
  return (
    <section className="flex flex-col">
      {jobs &&
        jobs.map((job) => {
          return (
            <Card
              key={job.id}
              className={`border-${jobStatusColorMap[job.status]}-400 border-1 w-xs`}
              radius="sm"
            >
              <CardBody>
                <div className="flex justify-between items-center">
                  {job.name}
                  <Spinner
                    color={jobStatusColorMap[job.status]}
                    variant="spinner"
                  />
                </div>
              </CardBody>
            </Card>
          );
        })}
    </section>
  );
}
