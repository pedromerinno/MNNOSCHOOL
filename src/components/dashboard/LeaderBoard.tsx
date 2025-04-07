
import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronDown, MessageSquare, MoreHorizontal, Trophy, UserPlus } from "lucide-react";

const leaderboardData = [
  {
    rank: 1,
    name: "Ishak Erdogan",
    avatar: "https://i.pravatar.cc/40?img=3",
    spentTime: "120 Hours",
    taskComplete: 192,
    score: "1400 (+84)",
    status: "Active"
  },
  {
    rank: 2,
    name: "Frodo Baggins",
    avatar: "https://i.pravatar.cc/40?img=13",
    spentTime: "119 Hours",
    taskComplete: 180,
    score: "1200 (+84)",
    status: "Offline"
  }
];

export const LeaderBoard = () => {
  const [timeFrame, setTimeFrame] = useState("Weekly");

  return (
    <Card className="border border-gray-100 dark:border-gray-800 shadow-sm">
      <CardHeader className="p-6 flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Leader Board</CardTitle>
        <div className="flex items-center space-x-2">
          <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full">
            • Live data
          </span>
          <Button variant="outline" size="sm" className="ml-auto">
            {timeFrame} <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-gray-50 dark:bg-gray-800/50">
            <TableRow>
              <TableHead className="w-[80px]">Rank</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Spent Time</TableHead>
              <TableHead>Task Complete</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaderboardData.map((item) => (
              <TableRow key={item.rank}>
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    {item.rank === 1 ? (
                      <Trophy className="h-5 w-5 text-yellow-500 mr-1" />
                    ) : (
                      <span className="h-5 w-5 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full text-sm mr-1">
                        {item.rank}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <img src={item.avatar} alt={item.name} className="h-8 w-8 rounded-full mr-2" />
                    <span>{item.name}</span>
                  </div>
                </TableCell>
                <TableCell>{item.spentTime}</TableCell>
                <TableCell>{item.taskComplete}</TableCell>
                <TableCell>{item.score}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                    item.status === "Active" 
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
                      : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                  }`}>
                    • {item.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <UserPlus className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
