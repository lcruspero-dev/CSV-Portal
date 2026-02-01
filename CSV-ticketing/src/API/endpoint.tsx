/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

export const baseURL = import.meta.env.VITE_BASE_URL;

export interface PayrollPayload {
  id: string;
  basicSalary: number;
  allowances?: number;
  deductions?: number;
  overtimePay?: number;
}

const apiHelper = async (endpoint: string, method: string, body?: object) => {
  const userLogin = JSON.parse(localStorage.getItem("user")!);
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${userLogin.token}`,
  };

  try {
    const response = await axios({
      method: method,
      url: `${baseURL}${endpoint}`,
      headers: headers,
      data: body,
    });

    return response;
  } catch (error: any) {
    throw error.response?.data;
  }
};

export const TicketAPi = {
  createTicket: (body: object) => apiHelper("/api/tickets/", "POST", body),
  getAllTicket: () => apiHelper("/api/tickets/", "GET"),
  getIndividualTicket: (id: any) => apiHelper(`/api/tickets/${id}`, "GET"),
  getNotes: (id: any) => apiHelper(`/api/tickets/${id}/notes`, "GET"),
  createNote: (id: any, body: object) =>
    apiHelper(`/api/tickets/${id}/notes`, "POST", body),

  // admin routes
  getAllRaisedTickets: () => apiHelper("/api/tickets/viewAll", "GET"),
  getAllOpenTickets: () => apiHelper("/api/tickets/viewOpen", "GET"),
  getAllClosedTickets: () => apiHelper("/api/tickets/viewClosed", "GET"),
  updateTicket: (id: any, body: object) =>
    apiHelper(`/api/tickets/${id}`, "PUT", body),
  deleteTicket: (id: any, body: object) =>
    apiHelper(`/api/tickets/${id}`, "DELETE", body),

  // MEMO
  createMemo: (body: object) => apiHelper("/api/memos/create", "POST", body),
  getAllMemos: () => apiHelper("/api/memos", "GET"),
  getIndividualMemo: (id: any) => apiHelper(`/api/memos/${id}`, "GET"),
  acknowledgement: (id: any) => apiHelper(`/api/memos/${id}/acknowledged`, "PUT"),
  getUserUnacknowledged: (id: any) => apiHelper(`/api/memos/unacknowledged/${id}`, "GET"),

  // Policies
  createPolicies: (body: object) => apiHelper("/api/policies/create", "POST", body),
  getAllPolicies: () => apiHelper("/api/policies", "GET"),
  getIndividualPolicy: (id: any) => apiHelper(`/api/policies/${id}`, "GET"),
  acknowledgementPolicy: (id: any) => apiHelper(`/api/policies/${id}/acknowledged`, "PUT"),
  getUserUnacknowledgedPol: (id: any) => apiHelper(`/api/policies/unacknowledged/${id}`, "GET"),
};

export const Category = {
  CreateCategory: (body: object) => apiHelper("/api/categories/", "POST", body),
  getCategory: () => apiHelper("/api/categories/", "GET"),
  getHrCategories: () => apiHelper("/api/categories/role/HR", "GET"),
  getItCategories: () => apiHelper("/api/categories/role/IT", "GET"),
  updateCategory: (id: any, body: object) =>
    apiHelper(`/api/categories/${id}`, "PUT", body),
  DeleteCatergory: (id: any) => apiHelper(`/api/categories/${id}`, "DELETE"),
};

export const Assigns = {
  CreateAssign: (body: object) => apiHelper("/api/assigns/", "POST", body),
  getAssign: () => apiHelper("/api/assigns/", "GET"),
  updateAssign: (id: any, body: object) =>
    apiHelper(`/api/assigns/${id}`, "PUT", body),
  DeleteAssign: (id: any) => apiHelper(`/api/assigns/${id}`, "DELETE"),
};

export const ExportDatas = {
  getAllTicket: () => apiHelper("/api/tickets/viewAll", "GET"),
  getNotes: (id: any) => apiHelper(`/api/tickets/${id}/notes`, "GET"),
  getEmployeeTimes: () => apiHelper("/api/employeeTimes/times", "GET"),
};

export const timer = {
  timeIn: (body: object) => apiHelper("/api/employeeTimes", "POST", body),
  timeOut: (body: object) => apiHelper("/api/employeeTimes", "PUT", body),
  updateBreakStart: (body: object) =>
    apiHelper("/api/employeeTimes/break", "PUT", body),
  updateSecondBreakStart: (body: object) =>
    apiHelper("/api/employeeTimes/break", "PUT", body),
  updateBreakEnd: (body: object) =>
    apiHelper("/api/employeeTimes/break", "PUT", body),
  updateSecondBreakEnd: (body: object) =>
    apiHelper("/api/employeeTimes/break", "PUT", body),
  updateLunchStart: (body: object) =>
    apiHelper("/api/employeeTimes/lunch/update", "PUT", body),
  updateLunchEnd: (body: object) =>
    apiHelper("/api/employeeTimes/lunch/update", "PUT", body),
  updateEmployeeBioBreak: (body: object) =>
    apiHelper("/api/employeeTimes/bio/update", "PUT", body),
  getCurrentTimeIn: () => apiHelper("/api/employeeTimes/null", "GET"),
  getAttendanceEntries: () => apiHelper("/api/employeeTimes/time", "GET"),
  getServerTime: () => apiHelper("/api/current-time", "GET"),
};

export const ResetPassword = {
  AdminResetPassword: (body: object) =>
    apiHelper("/api/users/admin-reset-password", "POST", body),
};

export const ChangePasswordAPI = {
  updatePassword: (body: object) =>
    apiHelper("/api/users/change-password", "PUT", body),
};

export const TimeRecordAPI = {
  getTimeRecordsByNameAndDate: (name: string, date: string) =>
    apiHelper(`/api/employeeTimes/search?name=${name}&date=${date}`, "GET"),
  updateTimeRecord: (id: string, body: object) =>
    apiHelper(`/api/employeeTimes/${id}`, "PATCH", body),
  deleteTimeRecord: (id: string) =>
    apiHelper(`/api/employeeTimes/${id}`, "DELETE"),
  getEmployeeTimeByEmployeeIdandDate: (id: string, date: string) =>
    apiHelper(`/api/employeeTimes/search/${id}?date=${date}`, "GET"),
  getAllEmployeeOnBreak: () =>
    apiHelper("/api/employeeTimes/incomplete", "GET"),
};

export const SurveyAPI = {
  createSurvey: (body: object) => apiHelper("/api/surveys", "POST", body),
  getSurveys: () => apiHelper("/api/surveys", "GET"),
  getSurvey: (id: any) => apiHelper(`/api/surveys/search/${id}`, "GET"),
  updateSurvey: (id: any, body: object) =>
    apiHelper(`/api/surveys/${id}`, "PUT", body),
  deleteSurvey: (id: any) => apiHelper(`/api/surveys/${id}`, "DELETE"),
  
  // FIXED: Changed from /active to just get all surveys
  getAllActiveSurveys: () => apiHelper(`/api/surveys`, "GET"),
  
  submitResponse: (id: any, body: object) =>
    apiHelper(`/api/surveys/${id}/respond`, "POST", body),
  getAllSurveyTitle: () => apiHelper(`/api/surveys/titles`, "GET"),
};

export const UserAPI = {
  searchUser: (name: string) =>
    apiHelper(`/api/users/search?query=${name}`, "GET"),
  setUserToInactive: (id: string) =>
    apiHelper(`/api/users/inactive/${id}`, "PUT"),
  setUserToActive: (id: string) => apiHelper(`/api/users/active/${id}`, "PUT"),
  updateLoginLimit: (id: string, body: object) =>
    apiHelper(`/api/users/update-login-limit/${id}`, "PUT", body),
};

export const NteAPI = {
  createNte: (body: object) => apiHelper("/api/ntes", "POST", body),
  getNtes: () => apiHelper("/api/ntes", "GET"),
  getNte: (id: any) => apiHelper(`/api/ntes/${id}`, "GET"),
  updateNte: (id: any, body: object) =>
    apiHelper(`/api/ntes/${id}`, "PUT", body),
  deleteNte: (id: any) => apiHelper(`/api/ntes/${id}`, "DELETE"),
  getNtesByUser: () => apiHelper(`/api/ntes/my/nte`, "GET"),
};

export const UserProfileAPI = {
  createProfile: (body: object) => apiHelper("/api/userprofiles", "POST", body),
  getProfile: () => apiHelper("/api/userprofiles", "GET"),
  getAllUsers: () => apiHelper("/api/userprofiles/all", "GET"),
  updateProfile: (body: object) => apiHelper("/api/userprofiles", "PUT", body),
  deleteProfile: () => apiHelper("/api/userprofiles", "DELETE"),
  getProfileById: (id: any) => apiHelper(`/api/userprofiles/${id}`, "GET"),
  getAllUserAvatar: () => apiHelper(`/api/userprofiles/avatar/all`, "GET"),
  adminUpdateUserProfile: (id: any, body: object) =>
    apiHelper(`/api/userprofiles/admin-update-user-profile/${id}`, "PUT", body),
};

export const ScheduleAndAttendanceAPI = {
  // Schedule Entries
  getScheduleEntries: () =>
    apiHelper("/api/ScheduleAndAttendanceRoutes/schedule-entries", "GET"),
  createScheduleEntry: (body: object) =>
    apiHelper(
      "/api/ScheduleAndAttendanceRoutes/schedule-entries",
      "POST",
      body
    ),
  updateScheduleEntry: (id: string, body: object) =>
    apiHelper(
      `/api/ScheduleAndAttendanceRoutes/schedule-entries/${id}`,
      "PUT",
      body
    ),
  // Attendance Entries
  getAttendanceEntries: () =>
    apiHelper("/api/ScheduleAndAttendanceRoutes/attendance-entries", "GET"),
  createAttendanceEntry: (body: object) =>
    apiHelper(
      "/api/ScheduleAndAttendanceRoutes/attendance-entries",
      "POST",
      body
    ),
  updateAttendanceEntry: (id: string, body: object) =>
    apiHelper(
      `/api/ScheduleAndAttendanceRoutes/attendance-entries/${id}`,
      "PUT",
      body
    ),

  getTeamLeader: () =>
    apiHelper("/api/ScheduleAndAttendanceRoutes/team-leader-entries", "GET"),

  checkExistingEntry: (body: object) =>
    apiHelper(
      "/api/ScheduleAndAttendanceRoutes/check-existing-entry",
      "POST",
      body
    ),

  getSchedulePerEmployeeByDate: (employeeId: string, date: string) =>
    apiHelper(
      `/api/ScheduleAndAttendanceRoutes/schedule-per-employee-by-date?employeeId=${employeeId}&date=${date}`,
      "GET"
    ),

  getSchedulePerEmployee: (employeeId: string) =>
    apiHelper(
      `/api/ScheduleAndAttendanceRoutes/schedule/employee?employeeId=${employeeId}`,
      "GET"
    ),
};

export const LeaveCreditAPI = {
  getLeaveCredit: () => apiHelper("/api/leave", "GET"),
  createLeaveCredit: (body: object) => apiHelper("/api/leave", "POST", body),
  getLeaveCreditById: () => apiHelper(`/api/leave/my/leave-credits`, "GET"),
  updateLeaveCredit: (id: string, body: object) =>
    apiHelper(`/api/leave/${id}`, "PUT", body),
};

export const payrollAPI = {
  processPayroll: (body: PayrollPayload) =>
    apiHelper("/api/payroll/process", "POST", body),
  getAllPayrolls: () => apiHelper("/api/payroll/", "GET"),
  getPayrollByUser: (id: string) => apiHelper(`/api/payroll/${id}`, "GET"),
  updatePayroll: (id: string, body: Partial<PayrollPayload>) =>
    apiHelper(`/api/payroll/update/${id}`, "PUT", body),
  deletePayroll: (id: string) => apiHelper(`/api/payroll/${id}`, "DELETE"),
  calculateFromTimeTracker: (body: {
    userId: string;
    startDate: string;
    endDate: string;
    payrollRate?: any;
  }) => apiHelper("/api/payroll/calculate-from-time-tracker", "POST", body),
  autoCalculatePayroll: (
    userId: string,
    body: {
      startDate: string;
      endDate: string;
    }
  ) => apiHelper(`/api/payroll/auto-calculate/${userId}`, "POST", body),
  sendPayroll: (
    userId: string,
    body: {
      payrollId: string;
    }
  ) => apiHelper(`/api/payroll/send/${userId}`, "POST", body),
  getEmployeePayslips: (userId: string) =>
    apiHelper(`/api/payroll/payslips/${userId}`, "GET"),
  generatePayslipForRange: (
    userId: string,
    body: { startDate: string; endDate: string }
  ) => apiHelper(`/api/payroll/payslips/generate/${userId}`, "POST", body),
  getAllArchivedPayslips: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    const queryString = params.toString();
    return apiHelper(
      `/api/payroll/payslips/archive${queryString ? `?${queryString}` : ""}`,
      "GET"
    );
  },
};
