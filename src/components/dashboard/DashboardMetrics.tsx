
import { ArrowDown, ArrowUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { LineChart, Line, ResponsiveContainer } from "recharts";

const data = [
  { name: "Jan", value: 400 },
  { name: "Feb", value: 600 },
  { name: "Mar", value: 500 },
  { name: "Apr", value: 700 },
  { name: "May", value: 400 },
  { name: "Jun", value: 500 },
  { name: "Jul", value: 450 },
  { name: "Aug", value: 700 },
  { name: "Sep", value: 600 },
];

const metrics = [
  {
    title: "Completed Courses",
    value: "1,560",
    change: "+2.15%",
    isPositive: true,
    label: "From Last Month",
    showChart: true,
  },
  {
    title: "Active Learners",
    value: "961",
    change: "-1.15%",
    isPositive: false,
    label: "From Last Month",
    showChart: false,
  },
  {
    title: "Incomplete Courses",
    value: "961",
    change: "",
    label: "See All",
    isLink: true,
    showChart: false,
  },
  {
    title: "Courses I haven't attended",
    value: "192",
    change: "",
    label: "Explore Course",
    isLink: true,
    showChart: false,
  },
];

export const DashboardMetrics = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <Card key={index} className="border border-gray-100 dark:border-gray-800 shadow-sm">
          <CardContent className="p-4">
            <div className="space-y-1">
              <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {metric.title}
              </h3>
              <div className="flex justify-between items-center">
                <p className="text-2xl font-bold">{metric.value}</p>
                {metric.showChart && (
                  <div className="h-8 w-16">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data}>
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#0070f3" 
                          strokeWidth={2} 
                          dot={false} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
              {(metric.change || metric.label) && (
                <div className="mt-0.5 flex items-center gap-1 flex-wrap">
                  {metric.change && (
                    <span className={`inline-flex items-center text-xs ${metric.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                      {metric.isPositive ? <ArrowUp className="h-3 w-3 mr-0.5" /> : <ArrowDown className="h-3 w-3 mr-0.5" />}
                      {metric.change}
                    </span>
                  )}
                  {metric.label && (
                    <span className={`text-xs ${metric.isLink ? 'text-green-500 hover:underline cursor-pointer' : 'text-gray-500 dark:text-gray-400'}`}>
                      {metric.label}
                    </span>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
