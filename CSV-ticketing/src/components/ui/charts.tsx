import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";
import React, { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Ticket {
  department: string;
  status: string;
  // Add other ticket properties as needed
}

interface ChartDataItem {
  department: string;
  open: number;
  "In Progress": number;
  closed: number;
}

interface ChartProps {
  tickets: Ticket[];
}

const chartConfig = {
  views: {
    label: "Tickets",
  },
  IT: {
    label: "IT Department",
    color: "#659cfb",
  },
  HR: {
    label: "HR Department",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

type DepartmentKey = keyof typeof chartConfig;

const Chart: React.FC<ChartProps> = ({ tickets }) => {
  const [activeChart, setActiveChart] = useState<DepartmentKey>("IT");

  const chartData = useMemo<ChartDataItem[]>(() => {
    const data: Record<
      string,
      { open: number; "In Progress": number; closed: number }
    > = {
      IT: { open: 0, "In Progress": 0, closed: 0 },
      HR: { open: 0, "In Progress": 0, closed: 0 },
    };

    tickets.forEach((ticket) => {
      if (data[ticket.department]) {
        const statusKey =
          ticket.status === "open"
            ? "open"
            : ticket.status === "In Progress"
            ? "In Progress"
            : "closed"; // includes closed, Approved, Rejected

        data[ticket.department][statusKey] += 1;
      }
    });

    return Object.entries(data).map(([department, statuses]) => ({
      department,
      ...statuses,
    }));
  }, [tickets]);

  const total = useMemo(() => {
    return {
      IT: chartData.find((d) => d.department === "IT")
        ? Object.values(
            chartData.find((d) => d.department === "IT") as ChartDataItem
          ).reduce(
            (acc, curr) => acc + (typeof curr === "number" ? curr : 0),
            0
          ) - 0
        : 0,
      HR: chartData.find((d) => d.department === "HR")
        ? Object.values(
            chartData.find((d) => d.department === "HR") as ChartDataItem
          ).reduce(
            (acc, curr) => acc + (typeof curr === "number" ? curr : 0),
            0
          ) - 0
        : 0,
    };
  }, [chartData]);

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Bar Chart - All Tickets</CardTitle>
          <CardDescription>
            Showing total Tickets by department and status
          </CardDescription>
        </div>
        <div className="flex relative z-0 ">
          {(Object.keys(chartConfig) as Array<DepartmentKey>)
            .filter((key) => key !== "views")
            .map((key) => (
              <button
                key={key}
                data-active={activeChart === key}
                className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                onClick={() => setActiveChart(key)}
              >
                <span className="text-xs text-muted-foreground">
                  {chartConfig[key].label}
                </span>
                <span className="text-lg font-bold leading-none sm:text-3xl">
                  {total[key].toLocaleString()}
                </span>
              </button>
            ))}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="department" />
            <YAxis />
            <Tooltip content={<ChartTooltipContent />} />
            <Legend />
            <Bar dataKey="open" stackId="a" fill="#8884d8" />
            <Bar dataKey="In Progress" stackId="a" fill="#82ca9d" />
            <Bar dataKey="closed" stackId="a" fill="#ffc658" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default Chart;
