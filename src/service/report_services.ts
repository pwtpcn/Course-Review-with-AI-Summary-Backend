import { dataSource } from "../lib/data-source";
import { DataSource } from "typeorm";
import { Report } from "../schema/report";
import { CreateReportInput } from "../dto/report.dto";

export class ReportService {
  private dataSource: DataSource;

  constructor() {
    this.dataSource = dataSource;
  }

  async createReport(reportData: CreateReportInput) {
    const report = new Report();
    report.content = reportData.content;
    report.reason = reportData.reason;
    report.userId = reportData.userId;
    report.reviewId = reportData.reviewId;

    return this.dataSource.manager.save(Report, report);
  }

  async getAllReports(
    sortBy?: "newest" | "oldest",
    status?: "pending" | "approved" | "rejected",
    reason?: "spam" | "inappropriate" | "irrelevant" | "other",
    search?: string,
  ) {
    const query = this.dataSource.manager.createQueryBuilder(Report, "report")
      .leftJoinAndSelect("report.review", "review")
      .leftJoinAndSelect("report.user", "user");

    if (status) {
      query.andWhere("report.status = :status", { status });
    }

    if (reason) {
      query.andWhere("report.reason = :reason", { reason });
    }

    if (search) {
      query.andWhere(
        '("report"."id"::text LIKE :search OR "report"."reviewId"::text LIKE :search OR "user"."username" LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (sortBy === "oldest") {
      query.orderBy("report.createdAt", "ASC");
    } else {
      query.orderBy("report.createdAt", "DESC");
    }

    return query.getMany();
  }

  async getReportByIdOrThrow(id: string) {
    const report = await this.getReportById(id);
    if (!report) {
      throw new Error("Report not found");
    }
    return report;
  }

  async getReportById(id: string) {
    return this.dataSource.manager.findOne(Report, {
      where: { id },
      relations: ["user"],
    });
  }

  async getReportByReviewId(reviewId: string) {
    const reports = await this.dataSource.manager.find(Report, {
      where: { reviewId },
    });
    return reports;
  }

  async getReportByUserId(userId: string) {
    const reports = await this.dataSource.manager.find(Report, {
      where: { userId },
    });
    return reports;
  }

  async deleteReport(id: string) {
    const deletedReport = await this.getReportByIdOrThrow(id);
    await this.dataSource.manager.remove(Report, deletedReport);
    return deletedReport;
  }

  async cancelReport(id: string) {
    const report = await this.getReportByIdOrThrow(id);
    report.status = "rejected";
    return this.dataSource.manager.save(Report, report);
  }

  async approveReport(id: string) {
    const report = await this.getReportByIdOrThrow(id);
    report.status = "approved";
    return this.dataSource.manager.save(Report, report);
  }
}

export default ReportService;
