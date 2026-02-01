const mongoose = require('mongoose');
const { autoUpdatePayrollFromTimeTracker } = require('./controllers/payrollController');

// Test data setup
const testUserId = '507f1f77bcf86cd799439011'; 
const testStartDate = '01/01/2024';
const testEndDate = '31/01/2024';

async function testAutoCalculation() {
    try {
        console.log('Testing payroll auto-calculation...');
        
        // Connect to MongoDB (adjust connection string as needed)
        await mongoose.connect('mongodb://localhost:27017/your-database-name');
        console.log('Connected to MongoDB');
        
        // Test the auto-calculation function
        const result = await autoUpdatePayrollFromTimeTracker(testUserId, testStartDate, testEndDate);
        
        console.log('Auto-calculation result:', {
            monthlySalary: result.payrollRate?.monthlyRate,
            dailyRate: result.payrollRate?.dailyRate,
            hourlyRate: result.payrollRate?.hourlyRate,
            totalHoursWorked: result.workDays?.totalHoursWorked,
            totalLateMinutes: result.workDays?.minsLate,
            totalUndertimeMinutes: result.workDays?.undertimeMinutes,
            regularDays: result.workDays?.regularDays,
            absentDays: result.workDays?.absentDays
        });
        
        console.log('Auto-calculation test completed successfully!');
        
    } catch (error) {
        console.error('Auto-calculation test failed:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

testAutoCalculation();
