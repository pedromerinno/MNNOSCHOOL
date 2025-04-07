
import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const challenges = [
  {
    id: 1,
    title: "SoftWare Course",
    image: "https://placehold.co/400x200/e0e7ff/4f46e5?text=Software+Development",
    description: "Beginner's Guide To Becoming A Professional Gaming Software Developer",
    date: "March 29, 2024",
    time: "09:00 - 11:00",
    attendees: [
      { id: 1, avatar: "https://i.pravatar.cc/32?img=1" },
      { id: 2, avatar: "https://i.pravatar.cc/32?img=2" },
      { id: 3, avatar: "https://i.pravatar.cc/32?img=3" },
      { id: 4, avatar: "https://i.pravatar.cc/32?img=4" },
    ],
    spots: "48+"
  },
  {
    id: 2,
    title: "Design Architecture Course",
    image: "https://placehold.co/400x200/dbeafe/3b82f6?text=Design+Architecture",
    description: "Beginner's Guide To Becoming A Professional Gaming Software Developer",
    date: "March 29, 2024",
    time: "09:00 - 11:00",
    attendees: [
      { id: 1, avatar: "https://i.pravatar.cc/32?img=5" },
      { id: 2, avatar: "https://i.pravatar.cc/32?img=6" },
      { id: 3, avatar: "https://i.pravatar.cc/32?img=7" },
      { id: 4, avatar: "https://i.pravatar.cc/32?img=8" },
    ],
    spots: "32+"
  },
  {
    id: 3,
    title: "SoftWare Architecture Course",
    image: "https://placehold.co/400x200/dbeafe/3b82f6?text=Software+Architecture",
    description: "Beginner's Guide To Becoming A Professional Gaming Software Developer",
    date: "March 29, 2024",
    time: "09:00 - 11:00",
    attendees: [
      { id: 1, avatar: "https://i.pravatar.cc/32?img=9" },
      { id: 2, avatar: "https://i.pravatar.cc/32?img=10" },
      { id: 3, avatar: "https://i.pravatar.cc/32?img=11" },
      { id: 4, avatar: "https://i.pravatar.cc/32?img=12" },
    ],
    spots: "64+"
  },
  {
    id: 4,
    title: "3D Character Design Course",
    image: "https://placehold.co/400x200/fef3c7/d97706?text=3D+Character+Design",
    description: "Beginner's Guide To Becoming A Professional Gaming Software Developer",
    date: "March 29, 2024",
    time: "09:00 - 11:00",
    attendees: [
      { id: 1, avatar: "https://i.pravatar.cc/32?img=13" },
      { id: 2, avatar: "https://i.pravatar.cc/32?img=14" },
      { id: 3, avatar: "https://i.pravatar.cc/32?img=15" },
      { id: 4, avatar: "https://i.pravatar.cc/32?img=16" },
    ],
    spots: "28+"
  },
  {
    id: 5,
    title: "Backend Course",
    image: "https://placehold.co/400x200/dcfce7/16a34a?text=Backend+Development",
    description: "Beginner's Guide To Becoming A Professional Gaming Software Developer",
    date: "March 29, 2024",
    time: "09:00 - 11:00",
    attendees: [
      { id: 1, avatar: "https://i.pravatar.cc/32?img=17" },
      { id: 2, avatar: "https://i.pravatar.cc/32?img=18" },
      { id: 3, avatar: "https://i.pravatar.cc/32?img=19" },
      { id: 4, avatar: "https://i.pravatar.cc/32?img=20" },
    ],
    spots: "52+"
  }
];

export const DashboardChallenges = () => {
  const [visibleCards, setVisibleCards] = useState(0);
  const cardsPerView = 4;
  const maxIndex = challenges.length - cardsPerView;

  const handlePrevious = () => {
    setVisibleCards(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setVisibleCards(prev => Math.min(maxIndex, prev + 1));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Upcoming Challenges</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Ready to grow? Discover new tasks and seize the opportunity!
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handlePrevious}
            disabled={visibleCards === 0}
            className="rounded-full"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleNext}
            disabled={visibleCards >= maxIndex}
            className="rounded-full"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-hidden">
        {challenges.slice(visibleCards, visibleCards + cardsPerView).map((challenge) => (
          <Card key={challenge.id} className="overflow-hidden flex flex-col h-full">
            <div className="aspect-[16/9] overflow-hidden">
              <img 
                src={challenge.image} 
                alt={challenge.title} 
                className="h-full w-full object-cover"
              />
            </div>
            <CardHeader className="p-4 pb-0">
              <CardTitle className="text-lg">{challenge.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2 flex-grow">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {challenge.description}
              </p>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                <Clock className="h-4 w-4 mr-2" />
                <span>{challenge.date} | {challenge.time}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {challenge.attendees.map((attendee) => (
                    <img 
                      key={attendee.id} 
                      src={attendee.avatar} 
                      alt="Attendee" 
                      className="h-6 w-6 rounded-full border-2 border-white dark:border-gray-800"
                    />
                  ))}
                  <span className="flex items-center justify-center h-6 w-6 rounded-full border-2 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700 text-xs font-medium">
                    {challenge.spots}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">Join Now</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};
