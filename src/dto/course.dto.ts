export interface CreateCourseInput {
  id: string;
  nameTh: string;
  nameEn: string;
  description: string;
  credits: number;
  year: number;
}

export interface UpdateCourseInput {
  nameTh?: string;
  nameEn?: string;
  description?: string;
  credits?: number;
  year?: number;
}
