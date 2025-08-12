import { Card, CardBody, Spinner } from "@heroui/react";

import { Job, jobStatusColorMap } from "@/lib/types";

export default function JobComponent({
  job,
  pending,
  initData
}: {
  job: Job;
  pending: boolean,
  initData: {name: string, url: string}
}) {
  console.log(pending, job, initData)
  return (
        <Card
          className={`border-${!pending ? jobStatusColorMap[job.status] : "default"}-400 border-1 w-xs`}
          radius="sm"
        >
          <CardBody>
            <div className="flex justify-between items-center">
              {!pending ? job.name : initData.name}
              <Spinner
                color={!pending ? jobStatusColorMap[job.status] : "default"}
                variant="spinner"
              />
            </div>
          </CardBody>
        </Card>
  );
}
