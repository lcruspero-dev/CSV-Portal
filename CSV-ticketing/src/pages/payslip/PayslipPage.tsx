import React, { useEffect, useState } from 'react';
import { payrollAPI } from '@/API/endpoint';
import { useAuth } from '@/context/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Download, Eye } from 'lucide-react';

interface Payslip {
  _id: string;
  employee: {
    fullName: string;
    position: string;
    email: string;
  };
  payrollRate: {
    monthlyRate: number;
    dailyRate: number;
    hourlyRate: number;
  };
  workDays: {
    regularDays: number;
    absentDays: number;
    minsLate: number;
    totalHoursWorked: number;
    undertimeMinutes: number;
  };
  pay: {
    basicPay: number;
  };
  grossSalary: {
    grossSalary: number;
    nonTaxableAllowance: number;
    performanceBonus: number;
  };
  totalDeductions: {
    totalDeductions: number;
    sssEmployeeShare: number;
    wisp: number;
    hdmfEmployeeShare: number;
    taxableIncome: number;
    hdmfLoan: number;
  };
  grandtotal: {
    grandtotal: number;
  };
  status: string;
  sentAt: string;
  createdAt: string;
}

const PayslipPage: React.FC = () => {
  const { user } = useAuth();
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchPayslips = async () => {
      if (!user?.userId) return;
      
      try {
        setLoading(true);
        const response = await payrollAPI.getEmployeePayslips(user.userId);
        setPayslips(response.data.payslips || []);
      } catch (error) {
        console.error('Error fetching payslips:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayslips();
  }, [user?.userId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const handleViewPayslip = (payslip: Payslip) => {
    setSelectedPayslip(payslip);
    setShowModal(true);
  };

  const handleDownloadPayslip = (payslip: Payslip) => {
    // TODO: Implement PDF download functionality
    console.log('Download payslip:', payslip._id);
    alert('PDF download functionality will be implemented soon!');
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading payslips...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Payslips</h1>
        <p className="text-gray-600 mt-2">View your salary history and payslips</p>
      </div>

      {payslips.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Payslips Found</h3>
            <p className="text-gray-600">
              You don't have any payslips yet. Payslips will appear here once they are sent by HR.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {payslips.map((payslip) => (
            <Card key={payslip._id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      Payslip - {formatDate(payslip.sentAt)}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Sent on {formatDate(payslip.sentAt)}
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {payslip.status.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Monthly Rate</p>
                    <p className="text-lg font-semibold">
                      {formatCurrency(payslip.payrollRate.monthlyRate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Hours Worked</p>
                    <p className="text-lg font-semibold">
                      {payslip.workDays.totalHoursWorked.toFixed(2)} hrs
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Net Pay</p>
                    <p className="text-lg font-semibold text-green-600">
                      {formatCurrency(payslip.grandtotal.grandtotal)}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewPayslip(payslip)}
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    View Details
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadPayslip(payslip)}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Payslip Detail Modal */}
      {showModal && selectedPayslip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Payslip Details</h2>
                <Button
                  variant="outline"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Employee Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Employee Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Name</p>
                      <p className="font-semibold">{selectedPayslip.employee.fullName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Position</p>
                      <p className="font-semibold">{selectedPayslip.employee.position}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Email</p>
                      <p className="font-semibold">{selectedPayslip.employee.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pay Period</p>
                      <p className="font-semibold">{formatDate(selectedPayslip.sentAt)}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Payroll Rates */}
                <Card>
                  <CardHeader>
                    <CardTitle>Payroll Rates</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Monthly Rate</p>
                      <p className="font-semibold">{formatCurrency(selectedPayslip.payrollRate.monthlyRate)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Daily Rate</p>
                      <p className="font-semibold">{formatCurrency(selectedPayslip.payrollRate.dailyRate)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Hourly Rate</p>
                      <p className="font-semibold">{formatCurrency(selectedPayslip.payrollRate.hourlyRate)}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Work Days */}
                <Card>
                  <CardHeader>
                    <CardTitle>Work Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Hours Worked</p>
                      <p className="font-semibold">{selectedPayslip.workDays.totalHoursWorked.toFixed(2)} hrs</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Regular Days</p>
                      <p className="font-semibold">{selectedPayslip.workDays.regularDays} days</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Absent Days</p>
                      <p className="font-semibold">{selectedPayslip.workDays.absentDays} days</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Late Minutes</p>
                      <p className="font-semibold">{selectedPayslip.workDays.minsLate} mins</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Undertime Minutes</p>
                      <p className="font-semibold">{selectedPayslip.workDays.undertimeMinutes} mins</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Deductions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Deductions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-gray-600">SSS</p>
                      <p className="font-semibold">{formatCurrency(selectedPayslip.totalDeductions.sssEmployeeShare)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">WISP</p>
                      <p className="font-semibold">{formatCurrency(selectedPayslip.totalDeductions.wisp)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">PAG-IBIG</p>
                      <p className="font-semibold">{formatCurrency(selectedPayslip.totalDeductions.hdmfEmployeeShare)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Taxable Income</p>
                      <p className="font-semibold">{formatCurrency(selectedPayslip.totalDeductions.taxableIncome)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">HDMF Loan</p>
                      <p className="font-semibold">{formatCurrency(selectedPayslip.totalDeductions.hdmfLoan)}</p>
                    </div>
                    <div className="border-t pt-2">
                      <p className="text-sm font-medium text-gray-600">Total Deductions</p>
                      <p className="font-semibold text-red-600">{formatCurrency(selectedPayslip.totalDeductions.totalDeductions)}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Summary */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Pay Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Basic Pay</p>
                      <p className="text-lg font-semibold">{formatCurrency(selectedPayslip.pay.basicPay)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Gross Salary</p>
                      <p className="text-lg font-semibold">{formatCurrency(selectedPayslip.grossSalary.grossSalary)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Net Pay</p>
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(selectedPayslip.grandtotal.grandtotal)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayslipPage;
