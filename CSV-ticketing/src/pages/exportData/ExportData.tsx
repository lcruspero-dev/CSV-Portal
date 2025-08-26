import { ExportDatas } from "@/API/endpoint";
import { formattedDate } from "@/API/helper";
import BackButton from "@/components/kit/BackButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as XLSX from "xlsx";

interface FormData {
  startDate: string;
  endDate: string;
  department: string;
  status: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
}

interface Ticket {
  _id: string;
  user: User;
  name: string;
  category: string;
  description: string;
  status: string;
  priority: string;
  assignedTo: string;
  file: string | null;
  department: string;
  createdAt: string;
  updatedAt: string;
  closingNote: string;
}

interface TicketSummary {
  totalTickets: number;
  ticketsByDepartment: { [key: string]: number };
  ticketsByStatus: { [key: string]: number };
  ticketsByCategory: { [key: string]: number };
  ticketsByPriority: { [key: string]: number };
  ticketsByAssignee: { [key: string]: number };
  averageResolutionTime: string;
  averageResolutionTimeByDepartment: { [key: string]: string };
  averageResolutionTimeByPriority: { [key: string]: string };
  ticketsPerDay: { [key: string]: number };
  filesAttachedCount: number;
  percentageWithFiles: string;
}

const ExportData: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      startDate: "",
      endDate: "",
      department: "",
      status: "",
    },
  });

  const calculateResolutionTime = (
    createdAt: string,
    updatedAt: string
  ): number => {
    const start = new Date(createdAt).getTime();
    const end = new Date(updatedAt).getTime();
    return Math.round((end - start) / (1000 * 60 * 60)); // Hours
  };

  const formatDuration = (hours: number): string => {
    if (hours < 24) return `${hours} hours`;
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days} days ${remainingHours} hours`;
  };

  const calculateSummaryStatistics = (tickets: Ticket[]): TicketSummary => {
    const summary: TicketSummary = {
      totalTickets: tickets.length,
      ticketsByDepartment: {},
      ticketsByStatus: {},
      ticketsByCategory: {},
      ticketsByPriority: {},
      ticketsByAssignee: {},
      ticketsPerDay: {},
      filesAttachedCount: 0,
      percentageWithFiles: "0%",
      averageResolutionTime: "0 hours",
      averageResolutionTimeByDepartment: {},
      averageResolutionTimeByPriority: {},
    };

    // Track resolution times by department and priority
    const resolutionTimesByDepartment: { [key: string]: number[] } = {};
    const resolutionTimesByPriority: { [key: string]: number[] } = {};
    let totalResolutionTime = 0;
    let closedTickets = 0;

    tickets.forEach((ticket) => {
      // Existing counting logic
      summary.ticketsByDepartment[ticket.department] =
        (summary.ticketsByDepartment[ticket.department] || 0) + 1;
      summary.ticketsByStatus[ticket.status] =
        (summary.ticketsByStatus[ticket.status] || 0) + 1;
      summary.ticketsByCategory[ticket.category] =
        (summary.ticketsByCategory[ticket.category] || 0) + 1;
      summary.ticketsByPriority[ticket.priority] =
        (summary.ticketsByPriority[ticket.priority] || 0) + 1;
      summary.ticketsByAssignee[ticket.assignedTo] =
        (summary.ticketsByAssignee[ticket.assignedTo] || 0) + 1;

      const day = ticket.createdAt.split("T")[0];
      summary.ticketsPerDay[day] = (summary.ticketsPerDay[day] || 0) + 1;

      if (ticket.file) {
        summary.filesAttachedCount++;
      }

      // Calculate resolution times for closed tickets
      if (ticket.status.toLowerCase() === "closed") {
        closedTickets++;
        const resolutionTime = calculateResolutionTime(
          ticket.createdAt,
          ticket.updatedAt
        );
        totalResolutionTime += resolutionTime;

        // Track by department
        if (!resolutionTimesByDepartment[ticket.department]) {
          resolutionTimesByDepartment[ticket.department] = [];
        }
        resolutionTimesByDepartment[ticket.department].push(resolutionTime);

        // Track by priority
        if (!resolutionTimesByPriority[ticket.priority]) {
          resolutionTimesByPriority[ticket.priority] = [];
        }
        resolutionTimesByPriority[ticket.priority].push(resolutionTime);
      }
    });

    // Calculate averages and percentages
    summary.percentageWithFiles = `${(
      (summary.filesAttachedCount / tickets.length) *
      100
    ).toFixed(1)}%`;

    if (closedTickets > 0) {
      const avgHours = Math.round(totalResolutionTime / closedTickets);
      summary.averageResolutionTime = formatDuration(avgHours);

      // Calculate average resolution time by department
      Object.entries(resolutionTimesByDepartment).forEach(([dept, times]) => {
        const avgTime = Math.round(
          times.reduce((sum, time) => sum + time, 0) / times.length
        );
        summary.averageResolutionTimeByDepartment[dept] =
          formatDuration(avgTime);
      });

      // Calculate average resolution time by priority
      Object.entries(resolutionTimesByPriority).forEach(([priority, times]) => {
        const avgTime = Math.round(
          times.reduce((sum, time) => sum + time, 0) / times.length
        );
        summary.averageResolutionTimeByPriority[priority] =
          formatDuration(avgTime);
      });
    }

    return summary;
  };

  const createSummaryWorksheet = (summary: TicketSummary): XLSX.WorkSheet => {
    const summaryData = [
      ["Ticket Summary Report"],
      [""],
      ["Overall Statistics"],
      ["Total Tickets", summary.totalTickets],
      ["Average Resolution Time", summary.averageResolutionTime],
      [
        "Tickets with Files",
        `${summary.filesAttachedCount} (${summary.percentageWithFiles})`,
      ],
      [""],
      ["Average Resolution Time by Department"],
      ...Object.entries(summary.averageResolutionTimeByDepartment)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([dept, time]) => [dept, time]),
      [""],
      ["Average Resolution Time by Priority"],
      ...Object.entries(summary.averageResolutionTimeByPriority)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([priority, time]) => [priority, time]),
      [""],
      ["Tickets by Department"],
      ...Object.entries(summary.ticketsByDepartment)
        .sort(([, a], [, b]) => b - a)
        .map(([dept, count]) => [dept, count]),
      [""],
      ["Tickets by Status"],
      ...Object.entries(summary.ticketsByStatus)
        .sort(([, a], [, b]) => b - a)
        .map(([status, count]) => [status, count]),
      [""],
      ["Tickets by Category"],
      ...Object.entries(summary.ticketsByCategory)
        .sort(([, a], [, b]) => b - a)
        .map(([category, count]) => [category, count]),
      [""],
      ["Tickets by Priority"],
      ...Object.entries(summary.ticketsByPriority)
        .sort(([, a], [, b]) => b - a)
        .map(([priority, count]) => [priority, count]),
      [""],
      ["Tickets by Assignee"],
      ...Object.entries(summary.ticketsByAssignee)
        .sort(([, a], [, b]) => b - a)
        .map(([assignee, count]) => [assignee, count]),
      [""],
      ["Daily Ticket Volume"],
      ...Object.entries(summary.ticketsPerDay)
        .sort()
        .map(([date, count]) => [date, count]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(summaryData);

    // Style the worksheet
    ws["!cols"] = [{ wch: 30 }, { wch: 20 }];

    // Add some basic styling to the title
    if (ws.A1) {
      ws.A1.s = { font: { bold: true, sz: 14 } };
    }

    return ws;
  };

  const filterAndEnrichData = async (
    data: Ticket[],
    filters: FormData
  ): Promise<Ticket[]> => {
    const normalizeDate = (date: Date) =>
      new Date(date.getFullYear(), date.getMonth(), date.getDate());

    return data.filter((ticket) => {
      const ticketDate = normalizeDate(new Date(ticket.createdAt));
      const startDate = normalizeDate(new Date(filters.startDate));
      const endDate = normalizeDate(new Date(filters.endDate));

      if (ticketDate < startDate || ticketDate > endDate) return false;
      if (
        filters.department !== "ALL" &&
        ticket.department !== filters.department
      )
        return false;
      if (filters.status !== "ALL" && ticket.status !== filters.status)
        return false;

      return true;
    });
  };

  const onSubmit = async (formData: FormData): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await ExportDatas.getAllTicket();
      const allTickets: Ticket[] = response.data;
      const filteredTickets = await filterAndEnrichData(allTickets, formData);

      // Calculate summary statistics
      const summary = calculateSummaryStatistics(filteredTickets);

      // Create workbook and add sheets
      const workbook = XLSX.utils.book_new();

      // Add detailed data sheet
      const detailsSheet = XLSX.utils.json_to_sheet(
        filteredTickets.map((ticket) => ({
          _id: ticket._id,
          Category: ticket.category,
          Department: ticket.department,
          Status: ticket.status,
          Priority: ticket.priority,
          "Assigned To": ticket.assignedTo,
          Requester: ticket.name,
          Description: ticket.description,
          "Closing Note": ticket.closingNote,
          "Has Attachment": ticket.file ? "Yes" : "No",
          "Created Date": formattedDate(ticket.createdAt),
          "Updated Date": formattedDate(ticket.updatedAt),
        }))
      );

      XLSX.utils.book_append_sheet(workbook, detailsSheet, "Ticket Details");

      // Add summary sheet
      const summarySheet = createSummaryWorksheet(summary);
      XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

      // Set column widths for details sheet
      detailsSheet["!cols"] = [
        { wch: 25 },
        { wch: 25 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
        { wch: 15 },
        { wch: 15 },
        { wch: 30 },
        { wch: 30 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
      ];

      // Generate filename and trigger download
      const fileName = `Ticket_Report_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error("Error exporting data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex justify-center p-3">
      <BackButton />
      <form className="mt-5 w-1/2" onSubmit={handleSubmit(onSubmit)}>
        <div className="text-center">
          <div className="mb-3"></div>
          <h1 className="text-xl sm:text-xl md:text-2xl lg:text-3xl font-bold py-1 sm:py-1 md:py-2 bg-clip-text text-transparent bg-gradient-to-r from-[#1638df] to-[#192fb4]">
            Export Ticket Data
          </h1>
          <p className="text-lg sm:text-xl md:text-xl lg:text-2xl font-bold text-black">
            Please select the export criteria
          </p>
        </div>

        <Label htmlFor="startDate" className="text-base font-bold">
          <p>Start Date</p>
        </Label>
        <Controller
          name="startDate"
          control={control}
          rules={{ required: "Start date is required" }}
          render={({ field }) => (
            <Input {...field} type="date" required className="!mb-2" />
          )}
        />
        {errors.startDate && (
          <p className="text-red-500">{errors.startDate.message}</p>
        )}

        <Label htmlFor="endDate" className="text-base font-bold">
          <p>End Date</p>
        </Label>
        <Controller
          name="endDate"
          control={control}
          rules={{ required: "End date is required" }}
          render={({ field }) => (
            <Input {...field} type="date" required className="!mb-2" />
          )}
        />
        {errors.endDate && (
          <p className="text-red-500">{errors.endDate.message}</p>
        )}

        <Label htmlFor="department" className="text-base font-bold">
          Department
        </Label>
        <Controller
          name="department"
          control={control}
          rules={{ required: "Department is required" }}
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger className="mb-2">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="IT">IT Department</SelectItem>
                  <SelectItem value="HR">HR Department</SelectItem>
                  <SelectItem value="ALL">All Departments</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />
        {errors.department && (
          <p className="text-red-500">{errors.department.message}</p>
        )}

        <Label htmlFor="status" className="text-base font-bold">
          Status
        </Label>
        <Controller
          name="status"
          control={control}
          rules={{ required: "Status is required" }}
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger className="mb-2">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="ALL">All</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />
        {errors.status && (
          <p className="text-red-500">{errors.status.message}</p>
        )}

        <Button className="w-full mt-2" type="submit" disabled={isLoading}>
          {isLoading ? "Exporting..." : "Export Data"}
        </Button>
      </form>
    </div>
  );
};

export default ExportData;
