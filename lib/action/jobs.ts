import { Job } from "../types";
import { supabase } from "../utils";
import { ServerActionState } from "./type";

export const SubmitJobs = async (entity: string, entity_id: number, jobsToProceed: {url: string, name: string}[]): Promise<ServerActionState<Job[]>> => {
    if (!jobsToProceed.length) {
        return {
            message: 'هیچ اکشنی پیدا نشد.',
            success: false
        }
    }

    const jobsPromise = jobsToProceed.map((job) => {
        return supabase.from('n8n_job').insert({
            entity,
            entity_id,
            status: 'pending',
            URL: job.url,
            name: job.name
        }).select().single()
    })

    const results = await Promise.all(jobsPromise)

    let unsuccessfulId = 1000
    const jobs = results.map((res, index): Job => {
        const {data, error} = res
        if (!error && data) {
            return {
                id: data.id, name: data.name, url: data.URL, status: data.status as Job["status"]
            }
        }
        console.log(error)
        unsuccessfulId += 1
        return {
            id: unsuccessfulId,
            name: jobsToProceed[index].name,
            url: jobsToProceed[index].url,
            status: 'error'
        }
    })
    
    return {
        message: "همه یا بخشی از اکشن‌ها با موفقیت ثبت شدند.",
        success: true,
        data: jobs
    }
}