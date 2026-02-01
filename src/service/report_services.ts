import { dataSource } from "../data-source";
import { DataSource } from "typeorm";
import { Report } from "../schema/report";

export class ReportService {
  private dataSource: DataSource;

  constructor() {
    this.dataSource = dataSource;
  }

  async createReport(reportData: Partial<Report>) {
    const report = new Report();
    report.content = reportData.content!;
    report.status = reportData.status!;
    report.userId = reportData.userId!;
    report.reviewId = reportData.reviewId!;
    
    return this.dataSource.manager.save(Report, report);
  }

  async getAllReports(sortBy?: "newest" | "oldest") {
    const order: any = {};
    if (sortBy === "newest") {
      order.createdAt = "DESC";
    } else if (sortBy === "oldest") {
      order.createdAt = "ASC";
    }
    return this.dataSource.manager.find(Report, { order });
  }

  async getReportByIdOrThrow(id: string) {
    const report = await this.getReportById(id);
    if (!report) {
      throw new Error("Report not found");
    }
    return report;
  }

  async getReportById(id: string) {
    return this.dataSource.manager.findOne(Report, { where: { id } });
  }

  async getReportByReviewId(reviewId: string) {
    const report = await this.getReportByIdOrThrow(reviewId);
    return report;
  }

  async getReportByUserId(userId: string) {
    const report = await this.getReportByIdOrThrow(userId);
    return report;
  }

  async deleteReport(id: string) {
    const report = await this.getReportByIdOrThrow(id);
    await this.dataSource.manager.delete(Report, id);
    return report;
  }
}

export default ReportService;
