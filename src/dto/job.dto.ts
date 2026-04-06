export interface CreateJobInput {
    name: string;
    details: string;
}

export interface UpdateJobInput {
    name?: string;
    details?: string;
}