import { Job } from "../schema/job";
import { dataSource } from "../data-source";
import { DataSource } from "typeorm";

export class JobServices {
    private dataSource: DataSource;

    constructor() {
        this.dataSource = dataSource;
    }

    async createJob(jobData: Partial<Job>) {
        const job = new Job();
        job.name = jobData.name!;
        job.details = jobData.details!;

        return this.dataSource.manager.save(Job, job);
    }

    async getAllJobs() {
        return this.dataSource.manager.find(Job);
    }

    async getJobById(id: string) {
        return this.dataSource.manager.findOne(Job, { where: { id } });
    }

    async getJobByIdOrThrow(id: string) {
        const job = await this.getJobById(id);
        if (!job) {
            throw new Error("Job not found");
        }
        return job;
    }

    async updateJob(id: string, jobData: Partial<Job>) {
        const job = await this.getJobByIdOrThrow(id);

        const updatedJob = new Job();
        updatedJob.name = jobData.name ?? job.name;
        updatedJob.details = jobData.details ?? job.details;
        updatedJob.updatedAt = new Date();

        await this.dataSource.manager.update(Job, id, updatedJob);
        return await this.getJobByIdOrThrow(id);
    }

    async deleteJob(id: string) {
        const deletedJob = await this.getJobByIdOrThrow(id);
        await this.dataSource.manager.delete(Job, id);
        return deletedJob;
    }
}

export default JobServices;
