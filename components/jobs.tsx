import { Card, CardBody, Spinner } from "@heroui/react";

import { ClientJob, statusColorMap } from "../app/dashboard/clients/types";

export default function JobsComponent({
  clientJobs,
}: {
  clientJobs: ClientJob[];
}) {
  return (
    <section className="flex flex-col">
      {clientJobs &&
        clientJobs.map((job) => {
          return (
            <Card
              key={job.id}
              className={`border-${statusColorMap[job.status]}-400 border-1 w-xs`}
              radius="sm"
            >
              <CardBody>
                <div className="flex justify-between items-center">
                  {job.name}
                  <Spinner
                    color={statusColorMap[job.status]}
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
