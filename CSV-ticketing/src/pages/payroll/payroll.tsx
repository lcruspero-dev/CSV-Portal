/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useEffect, useMemo, useState, useRef } from "react";

import { payrollAPI } from "@/API/endpoint";
import BackButton from "@/components/kit/BackButton";
import PayrollModal, { Payroll } from "@/components/kit/payrollModal";
import UpdatePayrollModal from "@/components/kit/payrollUpdateModal";
import { Archive } from "lucide-react";

// Import the extracted components
import PayrollTableComponent from "./payrollTable";
import { payrollColumns } from "./payrollColumn";

// Helper function for computing payroll (extract to utils if you prefer)
const computePayroll = (p: Payroll): Payroll => {
  const monthlyRate = p.payrollRate?.monthlyRate ?? 0;
  const dailyRate = p.payrollRate?.dailyRate ?? (monthlyRate / 26);
  const hourlyRate = p.payrollRate?.hourlyRate ?? (dailyRate / 8);
  
  const totalHoursWorked = p.workDays?.totalHoursWorked ?? 0;
  const basicPay = totalHoursWorked * hourlyRate;
  
  const absentDays = p.workDays?.absentDays ?? 0;
  const minsLate = p.workDays?.minsLate ?? 0;
  const undertimeMinutes = p.workDays?.undertimeMinutes ?? 0;
  
  // Calculate deductions from time
  const amountAbsent = absentDays * dailyRate;
  const amountMinLateUT = (minsLate / 60) * hourlyRate;
  const undertimeAmount = (undertimeMinutes / 60) * hourlyRate;
  
  // Holiday pay
  const regHolidayPay = (p.holidays?.regHoliday ?? 0) * dailyRate;
  const speHolidayPay = (p.holidays?.speHoliday ?? 0) * dailyRate * 0.3;
  
  // Overtime pay
  const regularOTpay = (p.totalOvertime?.regularOT ?? 0) * hourlyRate * 1.25;
  const restDayOtPay = (p.totalOvertime?.restDayOtHours ?? 0) * hourlyRate * 1.3;
  const totalOvertimePay = regularOTpay + restDayOtPay;
  
  // Night differential
  const nightDiffPay = (p.totalSupplementary?.nightDiffHours ?? 0) * hourlyRate * 0.1;
  
  // Salary adjustments
  const salaryIncrease = p.salaryAdjustments?.increase ?? 0;
  const unpaidAmount = (p.salaryAdjustments?.unpaid ?? 0) * dailyRate;
  
  // Allowances
  const nonTaxableAllowance = p.grossSalary?.nonTaxableAllowance ?? 0;
  const performanceBonus = p.grossSalary?.performanceBonus ?? 0;
  
  // Gross salary calculation
  const grossSalary = basicPay + regHolidayPay + speHolidayPay + totalOvertimePay + 
                     nightDiffPay + salaryIncrease + nonTaxableAllowance + performanceBonus;

  // Government deductions
  const sss = p.totalDeductions?.sssEmployeeShare ?? 0;
  const phic = p.totalDeductions?.phicEmployeeShare ?? 0;
  const hdmf = p.totalDeductions?.hdmfEmployeeShare ?? 0;
  const wisp = p.totalDeductions?.wisp ?? 0;
  const totalSSSContribution = p.totalDeductions?.totalSSScontribution ?? 0;
  const withHoldingTax = p.totalDeductions?.withHoldingTax ?? 0;
  const sssSalaryLoan = p.totalDeductions?.sssSalaryLoan ?? 0;
  const hdmfLoan = p.totalDeductions?.hdmfLoan ?? 0;

  const totalDeductions = amountAbsent + amountMinLateUT + undertimeAmount + unpaidAmount +
                         sss + phic + hdmf + wisp + totalSSSContribution + withHoldingTax + 
                         sssSalaryLoan + hdmfLoan;

  const netPay = grossSalary - totalDeductions;

  return {
    ...p,
    pay: { basicPay },
    holidays: { 
      regHoliday: p.holidays?.regHoliday ?? 0,
      regHolidayPay, 
      speHoliday: p.holidays?.speHoliday ?? 0,
      speHolidayPay 
    },
    latesAndAbsent: {
      ...p.latesAndAbsent,
      amountAbsent,
      amountMinLateUT,
      undertimeAmount
    },
    salaryAdjustments: {
      ...p.salaryAdjustments,
      unpaidAmount
    },
    totalOvertime: { 
      ...p.totalOvertime,
      regularOTpay,
      restDayOtPay,
      totalOvertime: totalOvertimePay
    },
    totalSupplementary: {
      ...p.totalSupplementary,
      nightDiffPay,
      totalSupplementaryIncome: nightDiffPay
    },
    grossSalary: { 
      ...p.grossSalary, 
      grossSalary,
      nonTaxableAllowance,
      performanceBonus
    },
    totalDeductions: { 
      ...p.totalDeductions, 
      totalDeductions 
    },
    grandtotal: { grandtotal: netPay },
  };
};

{
  /** Payroll Main Page */
}
const PayrollPage = () => {
  const [data, setData] = useState<Payroll[]>([]);
  const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null);
  const [positionFilter, setPositionFilter] = useState<string>("All");
  const [filterOpen, setFilterOpen] = useState<boolean>(false);
  const [csrTypes, setCsrTypes] = useState({
    US: false,
    CANADA: false,
    GENERAL: false,
    VIP: false
  });
  const [historyOpen, setHistoryOpen] = useState<boolean>(false);
  const [historyEmployee, setHistoryEmployee] = useState<Payroll | null>(null);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);
  const [payslips, setPayslips] = useState<any[]>([]);
  const [archiveOpen, setArchiveOpen] = useState<boolean>(false);
  const [archivePayslips, setArchivePayslips] = useState<any[]>([]);
  const [archiveLoading, setArchiveLoading] = useState<boolean>(false);
  const [archiveStartDate, setArchiveStartDate] = useState<string>('');
  const [archiveEndDate, setArchiveEndDate] = useState<string>('');
  
  const historyNetSum = useMemo(() => {
    try {
      return (payslips || []).reduce((acc: number, ps: any) => acc + Number(ps?.grandtotal?.grandtotal || 0), 0);
    } catch {
      return 0;
    }
  }, [payslips]);

  const archiveNetSum = useMemo(() => {
    try {
      return (archivePayslips || []).reduce((acc: number, ps: any) => acc + Number(ps?.grandtotal?.grandtotal || 0), 0);
    } catch {
      return 0;
    }
  }, [archivePayslips]);

  // Use refs to track if we're in the middle of operations
  const isMounted = useRef(true);
  const isProcessingHistory = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const fetchPayrolls = async () => {
      try {
        const res = await payrollAPI.getAllPayrolls();
        const list = Array.isArray(res.data.payrolls) ? res.data.payrolls : [];
        setData(list.map((p: Payroll) => computePayroll(p)));
      } catch (err) {
        console.error(err);
      }
    };
    fetchPayrolls();
  }, []);

  // Handle custom dispatched send-payroll events from table items
  useEffect(() => {
    const handler = async (evt: Event) => {
      const custom = evt as CustomEvent<Payroll>;
      const payroll = custom.detail;
      const userId = payroll?.payrollRate?.userId as unknown as string;
      const payrollId = (payroll as any)?._id as string;
      if (!userId || !payrollId) return;
      try {
        if (!confirm('Send this payroll and reset calculations for the next cycle?')) return;
        await payrollAPI.sendPayroll(userId, { payrollId });
        if (!isMounted.current) return;
        
        setData(prev => prev.map(p => {
          const same = ((p as any)._id === payrollId);
          if (!same) return p;
          
          // Preserve the original rates - they should NEVER change after send
          const preservedRates = {
            monthlyRate: p.payrollRate?.monthlyRate || 0,
            dailyRate: p.payrollRate?.dailyRate || 0,
            hourlyRate: p.payrollRate?.hourlyRate || 0,
            userId: p.payrollRate?.userId
          };
          
          const preservedDeductions = { ...p.totalDeductions };
          
          const updated: Payroll = {
            ...p,
            status: 'sent',
            // PRESERVE payroll rates - they should NEVER change
            payrollRate: preservedRates,
            workDays: { regularDays: 0, absentDays: 0, minsLate: 0, totalHoursWorked: 0, undertimeMinutes: 0 },
            latesAndAbsent: { absentDays: 0, minLateUT: 0, amountAbsent: 0, amountMinLateUT: 0 } as any,
            pay: { basicPay: 0 },
            totalOvertime: {},
            totalSupplementary: {},
            grossSalary: { ...(p.grossSalary || {}), nonTaxableAllowance: 0, performanceBonus: 0, grossSalary: 0 },
            grandtotal: { grandtotal: 0 },
            // PRESERVE deductions but reset calculated total
            totalDeductions: { ...preservedDeductions, totalDeductions: 0 }
          } as unknown as Payroll;
          return computePayroll(updated);
        }));
        alert('Payroll sent and snapshot stored successfully.');
      } catch (error) {
        console.error('Failed to send payroll:', error);
        alert('Failed to send payroll. Please try again.');
      }
    };

    document.addEventListener('send-payroll', handler as EventListener);
    return () => {
      document.removeEventListener('send-payroll', handler as EventListener);
    };
  }, []);

  // Listen for view history events and fetch payslips
  useEffect(() => {
    const handler = async (evt: Event) => {
      if (isProcessingHistory.current) return;
      
      isProcessingHistory.current = true;
      const custom = evt as CustomEvent<Payroll>;
      const payroll = custom.detail;
      const userId = payroll?.payrollRate?.userId as unknown as string;
      
      if (!userId) {
        isProcessingHistory.current = false;
        return;
      }
      
      try {
        setHistoryLoading(true);
        setHistoryEmployee(payroll);
        setHistoryOpen(true);
        const res = await payrollAPI.getEmployeePayslips(userId);
        if (!isMounted.current) return;
        
        const list = Array.isArray(res.data?.payslips) ? res.data.payslips : [];
        setPayslips(list);
      } catch (error) {
        console.error('Failed to load payslip history:', error);
        if (isMounted.current) {
          setPayslips([]);
        }
      } finally {
        if (isMounted.current) {
          setHistoryLoading(false);
        }
        isProcessingHistory.current = false;
      }
    };

    document.addEventListener('view-payslip-history', handler as EventListener);
    return () => {
      document.removeEventListener('view-payslip-history', handler as EventListener);
    };
  }, []);

  // Improved handler for closing history
  const handleHistoryOpenChange = (open: boolean) => {
    setHistoryOpen(open);
    
    if (!open) {
      setTimeout(() => {
        if (isMounted.current) {
          setHistoryEmployee(null);
          setPayslips([]);
          setHistoryLoading(false);
        }
      }, 150);
    }
  };

  // Force close history if component unmounts
  useEffect(() => {
    return () => {
      if (isMounted.current) {
        setHistoryOpen(false);
        setHistoryEmployee(null);
        setPayslips([]);
        setHistoryLoading(false);
      }
    };
  }, []);

  // Handle archive view - fetch all archived payslips
  const handleViewArchive = async () => {
    try {
      setArchiveLoading(true);
      setArchiveOpen(true);
      
      // Set default date range to current month if not set
      if (!archiveStartDate || !archiveEndDate) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        const formatDate = (date: Date) => {
          return date.toISOString().split('T')[0];
        };
        
        setArchiveStartDate(formatDate(startOfMonth));
        setArchiveEndDate(formatDate(endOfMonth));
      }
      
      const res = await payrollAPI.getAllArchivedPayslips(archiveStartDate, archiveEndDate);
      const list = Array.isArray(res.data?.payslips) ? res.data.payslips : [];
      setArchivePayslips(list);
    } catch (error) {
      console.error('Failed to load archived payslips:', error);
      setArchivePayslips([]);
    } finally {
      setArchiveLoading(false);
    }
  };

  // Handle archive date filter
  const handleArchiveDateFilter = async () => {
    if (!archiveStartDate || !archiveEndDate) {
      alert('Please select both start and end dates');
      return;
    }
    
    try {
      setArchiveLoading(true);
      const res = await payrollAPI.getAllArchivedPayslips(archiveStartDate, archiveEndDate);
      const list = Array.isArray(res.data?.payslips) ? res.data.payslips : [];
      setArchivePayslips(list);
    } catch (error) {
      console.error('Failed to filter archived payslips:', error);
      setArchivePayslips([]);
    } finally {
      setArchiveLoading(false);
    }
  };

  const handleUpdate = (updated: Payroll) => {
    const recomputed = computePayroll(updated);
    setData((prev) =>
      prev.map((p) =>
        (p as any)._id === (recomputed as any)._id ? recomputed : p
      )
    );
    setSelectedPayroll(null);
  };

  const handleDeletePayroll = async (payroll: Payroll) => {
    const userId = payroll.payrollRate?.userId;

    if (!userId) {
      alert('Error: Cannot delete payroll record - missing user ID');
      return;
    }

    if (confirm('Are you sure you want to delete this payroll record?')) {
      try {
        await payrollAPI.deletePayroll(userId);
        setData((prev) =>
          prev.filter((p) =>
            p.payrollRate?.userId !== userId
          )
        );
        alert('Payroll record deleted successfully!');
      } catch (error) {
        console.error('Error deleting payroll:', error);
        alert('Error deleting payroll record. Please try again.');
      }
    }
  };

  const handleBulkDelete = async (payrolls: Payroll[]) => {
    if (!payrolls.length) return;

    const userIds = payrolls.map(p => p.payrollRate?.userId).filter(Boolean);

    if (userIds.length !== payrolls.length) {
      alert('Error: Some payroll records are missing user IDs and cannot be deleted');
      return;
    }

    if (confirm(`Are you sure you want to delete ${payrolls.length} payroll record(s)? This action cannot be undone.`)) {
      try {
        const deletePromises = userIds.map(userId => payrollAPI.deletePayroll(userId!));
        await Promise.all(deletePromises);
        setData((prev) =>
          prev.filter((p) => !userIds.includes(p.payrollRate?.userId))
        );
        alert(`${payrolls.length} payroll record(s) deleted successfully!`);
      } catch (error) {
        console.error('Error deleting payrolls:', error);
        alert('Error deleting payroll records. Please try again.');
      }
    }
  };

  const handleViewPayroll = (payroll: Payroll) => {
    alert(`Viewing payroll for: ${payroll.employee?.fullName}\nNet Pay: ₱${payroll.grandtotal?.grandtotal?.toFixed(2)}`);
  };

  const filteredData = useMemo(() => {
    if (positionFilter === "All") return data;
    const target = positionFilter.toLowerCase();
    return data.filter(
      (p) => (p.employee?.position || "").toLowerCase() === target
    );
  }, [data, positionFilter]);

  return (
    <section className="w-full mx-auto py-12 px-6">
      <article className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          CSV NOW OPC
        </h1>
        <h3 className="text-lg text-gray-600">Payroll Register</h3>
      </article>

      <div className="flex justify-between items-center gap-4 mb-6">
        <BackButton />
        <div className="flex items-center gap-3">
          <PayrollModal
            onAdd={(p) =>
              setData((prev) => {
                const id = (p as any)._id;
                const exists = prev.some((x) => (x as any)._id === id);
                return exists
                  ? prev.map((x) => ((x as any)._id === id ? p : x))
                  : [...prev, p];
              })
            }
          />
          <Button variant="outline" onClick={handleViewArchive} className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            Archive
          </Button>
          <Button variant="outline" onClick={() => setFilterOpen(true)}>
            Filter
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-sm border border-gray-200 p-4">
        <PayrollTableComponent
          columns={payrollColumns}
          data={filteredData}
          onRowClick={setSelectedPayroll}
          onDeletePayroll={handleDeletePayroll}
          onViewPayroll={handleViewPayroll}
          onBulkDelete={handleBulkDelete}
        />
      </div>

      {/* Right-side Filter Sidebar */}
      <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
        <SheetContent side="right" className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Filter Payroll</SheetTitle>
            <SheetDescription>
              Filter payroll records by position and other criteria
            </SheetDescription>
          </SheetHeader>
          
          <div className="mt-4 space-y-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Job Position
              </label>
              <select
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
                className="border rounded px-2 py-2 text-sm"
              >
                <option value="All">All</option>
                <option value="Accounting">Accounting</option>
                <option value="IT Specialist">IT</option>
                <option value="HR">HR</option>
                <option value="CSR">CSR</option>
              </select>
            </div>

            {/* CSR Sub-filter with Checkboxes */}
            {positionFilter === "CSR" && (
              <div className="flex flex-col gap-3">
                <label className="text-sm font-medium text-gray-700">
                  CSR Type
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={csrTypes.US}
                      onChange={(e) => setCsrTypes(prev => ({ ...prev, US: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">US</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={csrTypes.CANADA}
                      onChange={(e) => setCsrTypes(prev => ({ ...prev, CANADA: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">CANADA</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={csrTypes.GENERAL}
                      onChange={(e) => setCsrTypes(prev => ({ ...prev, GENERAL: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">GENERAL</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={csrTypes.VIP}
                      onChange={(e) => setCsrTypes(prev => ({ ...prev, VIP: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">VIP</span>
                  </label>
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setPositionFilter("All");
                  setCsrTypes({
                    US: false,
                    CANADA: false,
                    GENERAL: false,
                    VIP: false
                  });
                }}
              >
                Reset
              </Button>
              <Button onClick={() => setFilterOpen(false)}>Apply</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Payslip History Sheet */}
      <Sheet open={historyOpen} onOpenChange={handleHistoryOpenChange}>
        <SheetContent 
          side="right" 
          className="w-[100vw] sm:max-w-[100vw]"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <SheetHeader>
            <div className="flex items-center justify-between gap-3">
              <SheetTitle>
                Payslip History {historyEmployee?.employee?.fullName ? `— ${historyEmployee.employee.fullName}` : ''}
              </SheetTitle>
              {payslips.length > 0 && (
                <Badge variant="outline" className="text-green-700 border-green-700">
                  Total Net: PHP {historyNetSum.toFixed(2)}
                </Badge>
              )}
            </div>
            <SheetDescription>
              View historical payslip data for this employee
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4 w-full overflow-x-auto">
            {historyLoading ? (
              <div className="text-sm text-gray-600">Loading history…</div>
            ) : payslips.length === 0 ? (
              <div className="text-sm text-gray-600">No payslips found for this employee.</div>
            ) : (
              <div className="bg-white rounded-sm border border-gray-200 p-4 min-w-[1200px]">
                <PayrollTableComponent
                  columns={payrollColumns}
                  data={payslips as unknown as Payroll[]}
                  onRowClick={() => {}}
                  onDeletePayroll={() => {}}
                  onViewPayroll={() => {}}
                  onBulkDelete={() => {}}
                  hideActions
                  totalsRow={false}
                />
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Archive View Sheet - All archived payslips */}
      <Sheet open={archiveOpen} onOpenChange={setArchiveOpen}>
        <SheetContent side="right" className="w-[100vw] sm:max-w-[100vw]">
          <SheetHeader>
            <div className="flex items-center justify-between gap-3">
              <SheetTitle>
                Payroll Archive — All Sent Payslips
              </SheetTitle>
              {archivePayslips.length > 0 && (
                <Badge variant="outline" className="text-green-700 border-green-700">
                  Total Net: PHP {archiveNetSum.toFixed(2)} ({archivePayslips.length} payslips)
                </Badge>
              )}
            </div>
          </SheetHeader>
          
          {/* Date Range Filter */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <Label htmlFor="archive-start-date">Start Date</Label>
                <Input
                  id="archive-start-date"
                  type="date"
                  value={archiveStartDate}
                  onChange={(e) => setArchiveStartDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="archive-end-date">End Date</Label>
                <Input
                  id="archive-end-date"
                  type="date"
                  value={archiveEndDate}
                  onChange={(e) => setArchiveEndDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button onClick={handleArchiveDateFilter} disabled={archiveLoading}>
                {archiveLoading ? 'Loading...' : 'Filter'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setArchiveStartDate('');
                  setArchiveEndDate('');
                  handleViewArchive();
                }}
                disabled={archiveLoading}
              >
                Clear
              </Button>
            </div>
          </div>

          <div className="mt-4 w-full overflow-x-auto">
            {archiveLoading ? (
              <div className="text-sm text-gray-600">Loading archive data…</div>
            ) : archivePayslips.length === 0 ? (
              <div className="text-sm text-gray-600">No archived payslips found.</div>
            ) : (
              <div className="bg-white rounded-sm border border-gray-200 p-4 min-w-[1200px]">
                <PayrollTableComponent
                  columns={payrollColumns}
                  data={archivePayslips as unknown as Payroll[]}
                  onRowClick={() => {}}
                  onDeletePayroll={() => {}}
                  onViewPayroll={() => {}}
                  onBulkDelete={() => {}}
                  hideActions
                  totalsRow={false}
                />
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Update Modal appears when a row is clicked */}
      {selectedPayroll && (
        <UpdatePayrollModal
          open={true}
          onOpenChange={(o) => !o && setSelectedPayroll(null)}
          payroll={selectedPayroll}
          onUpdated={handleUpdate}
        />
      )}
    </section>
  );
};

export default PayrollPage;