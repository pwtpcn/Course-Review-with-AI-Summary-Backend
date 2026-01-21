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

  async getAllJobs(sortBy?: "newest" | "oldest") {
    const order: any = {};
    if (sortBy === "newest") {
      order.createdAt = "DESC";
    } else if (sortBy === "oldest") {
      order.createdAt = "ASC";
    }
    return this.dataSource.manager.find(Job, { order });
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

    Object.assign(job, jobData);
    return await this.dataSource.manager.save(job);
  }

  async deleteJob(id: string) {
    const deletedJob = await this.getJobByIdOrThrow(id);
    await this.dataSource.manager.delete(Job, id);
    return deletedJob;
  }
}

export default JobServices;
