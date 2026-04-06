export interface CreateCourseInput {
  id: string;
  nameTh: string;
  nameEn: string;
  description: string;
  credits: number;
  year: number;
  category: "Core" | "Elective";
}

export interface UpdateCourseInput {
  nameTh?: string;
  nameEn?: string;
  description?: string;
  credits?: number;
  year?: number;
  category?: "Core" | "Elective";
}
