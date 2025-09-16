# Payroll Auto-Calculation Implementation

## Overview
This implementation provides automatic calculation of payroll details based on time tracker and schedule data, eliminating the need for manual input of hours worked, late minutes, daily rate, and hourly rate.

## Features Implemented

### 1. Auto-Calculation Logic
- **Hours Worked**: Calculated from time tracker data, adjusted for schedule constraints
- **Late Minutes**: Calculated by comparing actual time-in with scheduled start time
- **Undertime Minutes**: Calculated by comparing actual time-out with scheduled end time
- **Daily Rate**: Auto-calculated from monthly salary divided by work days in month
- **Hourly Rate**: Auto-calculated from daily rate divided by 8 hours

### 2. Time Adjustment Rules
- **Time In Adjustment**: If employee time-in is earlier than scheduled start, use scheduled start time
- **Time Out Adjustment**: If employee time-out is earlier than scheduled end, count as undertime
- **Lunch Break**: System never calculates or deducts lunch break time (as specified)

### 3. Database Schema Updates

#### UserProfile Model
- Added `monthlySalary` field to store employee's monthly salary

#### Payroll Model
- Added `undertimeMinutes` field to track undertime
- Enhanced `workDays` schema with calculated fields

### 4. API Endpoints

#### New Endpoint: Auto-Calculate Payroll
```
POST /api/payroll/auto-calculate/:userId
Body: {
  startDate: string,
  endDate: string
}
```

### 5. Frontend Updates

#### Payroll Modal
- Added "Auto-Calculate" button
- Disabled fields for auto-calculated values (daily rate, hourly rate, hours worked, late minutes, undertime minutes)
- Visual distinction for auto-calculated fields (gray background, disabled state)

#### Payroll Update Modal
- Only monthly salary is editable
- All other calculated fields are disabled
- Automatic recalculation when monthly salary changes

## Implementation Details

### Backend Functions

#### `calculatePayrollData(userId, startDate, endDate)`
- Fetches time tracker data for the specified period
- Retrieves employee schedule data
- Calculates hours worked, late minutes, and undertime
- Computes daily and hourly rates from monthly salary

#### `autoUpdatePayrollFromTimeTracker(userId, startDate, endDate)`
- Creates or updates payroll record with auto-calculated data
- Triggers automatic recalculation of all payroll components

#### `computePayroll(payroll)`
- Updated to use auto-calculated hours worked for basic pay calculation
- Maintains existing calculation logic for other components

### Frontend Components

#### Auto-Calculate Button
- Triggers API call to auto-calculate payroll data
- Updates form fields with calculated values
- Provides user feedback on success/failure

#### Disabled Fields
- Visual indication that fields are auto-calculated
- Prevents manual editing of calculated values
- Maintains data integrity

## Usage Instructions

### For HR/Admin Users

1. **Creating New Payroll**:
   - Select employee from dropdown
   - Click "Auto-Calculate" button to fetch time tracker data
   - Review auto-calculated values (shown as disabled fields)
   - Manually enter overtime, deductions, and other non-calculated fields
   - Save payroll

2. **Updating Existing Payroll**:
   - Open payroll update modal
   - Only monthly salary field is editable
   - Daily and hourly rates update automatically when monthly salary changes
   - All time-based calculations remain disabled

### For System Integration

1. **Automatic Updates**:
   - Payroll automatically updates when employee time-out is recorded
   - System triggers recalculation for current month data

2. **API Integration**:
   - Use `/api/payroll/auto-calculate/:userId` endpoint for programmatic updates
   - Provide start and end dates for calculation period

## Data Flow

1. **Time Tracker Data** → EmployeeTime Model
2. **Schedule Data** → ScheduleEntry Model  
3. **Employee Salary** → UserProfile Model
4. **Auto-Calculation** → Payroll Controller
5. **Updated Payroll** → Payroll Model
6. **Frontend Display** → Disabled calculated fields

## Error Handling

- Graceful fallback to manual data if auto-calculation fails
- User-friendly error messages for missing data
- Validation for required fields (time tracker, schedule, salary data)

## Testing

Use the provided test script `test_auto_calculation.js` to verify functionality:

```bash
node test_auto_calculation.js
```

## Benefits

1. **Eliminates Manual Data Entry**: No need to manually input hours, late minutes, or rates
2. **Ensures Accuracy**: Calculations based on actual time tracker data
3. **Saves Time**: Automated process reduces payroll processing time
4. **Maintains Consistency**: Standardized calculation logic across all employees
5. **Real-time Updates**: Payroll updates automatically when time data changes

## Future Enhancements

1. **Overtime Calculation**: Extend to auto-calculate overtime hours
2. **Holiday Pay**: Auto-calculate holiday pay based on schedule
3. **Night Differential**: Auto-calculate night shift differentials
4. **Reporting**: Generate reports on auto-calculated vs manual payroll data
