
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const CalendarWidget = () => {
  return (
    <Card className="border-0 shadow-md overflow-hidden bg-amber-700 text-white">
      <CardContent className="p-0">
        <div className="p-4 flex justify-between items-center">
          <h3 className="font-medium">Julho 2022</h3>
          <div className="flex space-x-2">
            <Button size="icon" variant="ghost" className="text-white hover:bg-white/10 h-7 w-7">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" className="text-white hover:bg-white/10 h-7 w-7">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="px-4 pb-4">
          <div className="grid grid-cols-7 text-center text-xs mb-2">
            <div>Seg</div>
            <div>Ter</div>
            <div>Qua</div>
            <div>Qui</div>
            <div>Sex</div>
            <div>Sab</div>
            <div>Dom</div>
          </div>
          
          <div className="grid grid-cols-7 gap-1 text-center">
            <div className="text-white/50 h-8 w-8 flex items-center justify-center text-sm">27</div>
            <div className="text-white/50 h-8 w-8 flex items-center justify-center text-sm">28</div>
            <div className="text-white/50 h-8 w-8 flex items-center justify-center text-sm">29</div>
            <div className="text-white/50 h-8 w-8 flex items-center justify-center text-sm">30</div>
            <div className="h-8 w-8 flex items-center justify-center text-sm">1</div>
            <div className="h-8 w-8 flex items-center justify-center text-sm">2</div>
            <div className="h-8 w-8 flex items-center justify-center text-sm">3</div>
            
            <div className="h-8 w-8 flex items-center justify-center text-sm">4</div>
            <div className="h-8 w-8 flex items-center justify-center text-sm">5</div>
            <div className="h-8 w-8 flex items-center justify-center text-sm">6</div>
            <div className="h-8 w-8 flex items-center justify-center text-sm">7</div>
            <div className="h-8 w-8 flex items-center justify-center text-sm">8</div>
            <div className="h-8 w-8 flex items-center justify-center text-sm">9</div>
            <div className="h-8 w-8 flex items-center justify-center text-sm">10</div>
            
            <div className="h-8 w-8 flex items-center justify-center text-sm">11</div>
            <div className="h-8 w-8 flex items-center justify-center text-sm">12</div>
            <div className="h-8 w-8 flex items-center justify-center text-sm">13</div>
            <div className="h-8 w-8 flex items-center justify-center text-sm">14</div>
            <div className="h-8 w-8 flex items-center justify-center text-sm">15</div>
            <div className="h-8 w-8 flex items-center justify-center text-sm">16</div>
            <div className="h-8 w-8 flex items-center justify-center text-sm">17</div>
            
            <div className="h-8 w-8 flex items-center justify-center text-sm">18</div>
            <div className="h-8 w-8 flex items-center justify-center text-sm bg-white/30 rounded-full">19</div>
            <div className="h-8 w-8 flex items-center justify-center text-sm">20</div>
            <div className="h-8 w-8 flex items-center justify-center text-sm">21</div>
            <div className="h-8 w-8 flex items-center justify-center text-sm">22</div>
            <div className="h-8 w-8 flex items-center justify-center text-sm">23</div>
            <div className="h-8 w-8 flex items-center justify-center text-sm">24</div>
            
            <div className="h-8 w-8 flex items-center justify-center text-sm">25</div>
            <div className="h-8 w-8 flex items-center justify-center text-sm">26</div>
            <div className="h-8 w-8 flex items-center justify-center text-sm">27</div>
            <div className="h-8 w-8 flex items-center justify-center text-sm">28</div>
            <div className="h-8 w-8 flex items-center justify-center text-sm">29</div>
            <div className="h-8 w-8 flex items-center justify-center text-sm">30</div>
            <div className="h-8 w-8 flex items-center justify-center text-sm">31</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
