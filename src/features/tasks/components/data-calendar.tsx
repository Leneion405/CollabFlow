import { useState, useEffect } from "react";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, Grid, List } from "lucide-react";
import {
  format,
  getDay,
  parse,
  startOfWeek,
  addMonths,
  subMonths,
  isValid,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { enUS } from "date-fns/locale";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EventCard } from "./event-card";
import { Task } from "../types";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "./data-calendar.css";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Define proper types for calendar events
type CalendarEvent = {
  start: Date;
  end: Date;
  title: string;
  project: any; // You can replace with proper project type
  assignee: any; // You can replace with proper assignee type
  status: any; // You can replace with proper status type
  id: string;
};

interface CustomToolbarProps {
  date: Date;
  onNavigate: (action: "PREV" | "NEXT" | "TODAY") => void;
  isMobile?: boolean;
}

const CustomToolbar = ({ date, onNavigate, isMobile = false }: CustomToolbarProps) => {
  return (
    <div className={`flex mb-4 gap-x-2 items-center w-full ${
      isMobile ? 'justify-between' : 'lg:w-auto justify-center lg:justify-start'
    }`}>
      <Button
        onClick={() => onNavigate("PREV")}
        variant="secondary"
        size={isMobile ? "sm" : "icon"}
        className={isMobile ? "h-9 px-3" : ""}
      >
        <ChevronLeftIcon className="size-4" />
        {isMobile && <span className="ml-1 hidden sm:inline">Prev</span>}
      </Button>
      
      <div className={`flex items-center border border-input rounded-md px-3 py-2 ${
        isMobile ? 'h-9 flex-1 justify-center mx-2' : 'h-8 justify-center w-full lg:w-auto'
      }`}>
        <CalendarIcon className="size-4 mr-2" />
        <p className={`${isMobile ? 'text-sm font-medium' : 'text-sm'}`}>
          {format(date, isMobile ? "MMM yyyy" : "MMMM yyyy")}
        </p>
      </div>
      
      <Button
        onClick={() => onNavigate("NEXT")}
        variant="secondary"
        size={isMobile ? "sm" : "icon"}
        className={isMobile ? "h-9 px-3" : ""}
      >
        {isMobile && <span className="mr-1 hidden sm:inline">Next</span>}
        <ChevronRightIcon className="size-4" />
      </Button>
    </div>
  );
};

// Mobile Calendar Day Component
const MobileDayCard = ({ 
  date, 
  events, 
  isCurrentMonth, 
  isSelected, 
  onSelect 
}: {
  date: Date;
  events: CalendarEvent[];
  isCurrentMonth: boolean;
  isSelected: boolean;
  onSelect: (date: Date) => void;
}) => {
  const dayEvents = events.filter(event => 
    isSameDay(new Date(event.start), date)
  );

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect(date);
  };

  return (
    <Card 
      className={`cursor-pointer transition-all touch-manipulation ${
        isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md active:scale-95'
      } ${!isCurrentMonth ? 'opacity-50' : ''}`}
      onClick={handleClick}
    >
      <CardContent className="p-2">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm font-medium ${
            isToday(date) ? 'text-blue-600' : 
            isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
          }`}>
            {format(date, 'd')}
          </span>
          {dayEvents.length > 0 && (
            <Badge variant="secondary" className="text-xs h-4 w-4 p-0 flex items-center justify-center">
              {dayEvents.length}
            </Badge>
          )}
        </div>
        
        <div className="space-y-1">
          {dayEvents.slice(0, 3).map((event, index) => (
            <div key={index} className="text-xs">
              <EventCard
                id={event.id}
                title={event.title}
                assignee={event.assignee}
                project={event.project}
                status={event.status}
                compact={true}
              />
            </div>
          ))}
        </div>
        
        {dayEvents.length > 3 && (
          <div className="text-xs text-muted-foreground mt-1 text-center">
            +{dayEvents.length - 3} more
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Mobile List View Component
const MobileListView = ({ events, selectedDate }: { events: CalendarEvent[]; selectedDate: Date }) => {
  const dayEvents = events.filter(event => 
    isSameDay(new Date(event.start), selectedDate)
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <CalendarIcon className="size-5 text-blue-600" />
        <h3 className="text-lg font-semibold">
          {format(selectedDate, "EEEE, MMMM d, yyyy")}
        </h3>
      </div>
      
      {dayEvents.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <CalendarIcon className="size-12 mx-auto mb-3 opacity-50" />
          <p>No tasks scheduled for this day</p>
        </div>
      ) : (
        <div className="space-y-2">
          {dayEvents.map((event, index) => (
            <EventCard
              key={index}
              id={event.id}
              title={event.title}
              assignee={event.assignee}
              project={event.project}
              status={event.status}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface DataCalendarProps {
  data: Task[];
}

export const DataCalendar = ({ data }: DataCalendarProps) => {
  const [isMobile, setIsMobile] = useState(false);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Only use a valid date for initial value
  const initialDate =
    data.length > 0 && data[0].dueDate && isValid(new Date(data[0].dueDate))
      ? new Date(data[0].dueDate)
      : new Date();

  const [value, setValue] = useState(initialDate);

  // Only add events with valid due dates - Fixed type
  const events: CalendarEvent[] = data
    .filter((task) => task.dueDate && isValid(new Date(task.dueDate)))
    .map((task) => ({
      start: new Date(task.dueDate!),
      end: new Date(task.dueDate!),
      title: task.name,
      project: task.project,
      assignee: task.assignee,
      status: task.status,
      id: task.$id,
    }));

  const handleNavigate = (action: "PREV" | "NEXT" | "TODAY") => {
    if (action === "PREV") {
      setValue(subMonths(value, 1));
    } else if (action === "NEXT") {
      setValue(addMonths(value, 1));
    } else if (action === "TODAY") {
      setValue(new Date());
      setSelectedDate(new Date());
    }
  };

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    
    // Auto-switch to list view when date is selected on mobile
    if (isMobile && viewMode === 'calendar') {
      setViewMode('list');
    }
  };

  // Generate calendar days for mobile grid view
  const monthStart = startOfMonth(value);
  const monthEnd = endOfMonth(value);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = startOfWeek(monthEnd, { weekStartsOn: 6 });
  
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  });

  return (
    <div className="h-full flex flex-col">
      {/* View Mode Toggle - Mobile Only */}
      {isMobile && (
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant={viewMode === 'calendar' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('calendar')}
            className="flex-1"
          >
            <Grid className="size-4 mr-2" />
            Calendar
          </Button>
          <Button
            variant={viewMode === 'list' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="flex-1"
          >
            <List className="size-4 mr-2" />
            List
          </Button>

        </div>
      )}

      {/* Desktop Calendar View - UPDATED WITH MULTIPLE TASKS SUPPORT */}
      {!isMobile && (
        <div className="h-[700px]">
          <Calendar
            localizer={localizer}
            date={value}
            events={events}
            views={["month"]}
            defaultView="month"
            toolbar
            showAllEvents={false} // Enable "show more" functionality
            popup={true} // Enable popup for overflow events
            popupOffset={30} // Offset for popup
            step={60} // 60 minute steps
            timeslots={1} // 1 slot per hour
            className="h-full"
            max={new Date(new Date().setFullYear(new Date().getFullYear() + 1))}
            formats={{
              weekdayFormat: (date, culture, localizer) =>
                localizer?.format(date, "EEE", culture) ?? "",
            }}
            components={{
              eventWrapper: ({ event }) => (
                <EventCard
                  id={event.id}
                  title={event.title}
                  assignee={event.assignee}
                  project={event.project}
                  status={event.status}
                />
              ),
              toolbar: () => (
                <CustomToolbar date={value} onNavigate={handleNavigate} />
              ),
            }}
            onShowMore={(events, date) => {
              // Handle show more click - you can open a modal or navigate
              console.log('Show more events for date:', date, events);
              // Optional: Set selected date and show in a modal
              setSelectedDate(date);
            }}
          />
        </div>
      )}

      {/* Mobile Views */}
      {isMobile && (
        <>
          <CustomToolbar date={value} onNavigate={handleNavigate} isMobile={true} />
          
          {viewMode === 'calendar' ? (
            // Mobile Calendar Grid View
            <div className="flex-1 overflow-auto">
              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2 px-1">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 px-1">
                {calendarDays.map((date, index) => (
                  <MobileDayCard
                    key={`${date.getTime()}-${index}`}
                    date={date}
                    events={events}
                    isCurrentMonth={isSameMonth(date, value)}
                    isSelected={isSameDay(date, selectedDate)}
                    onSelect={handleDateSelect}
                  />
                ))}
              </div>
            </div>
          ) : (
            // Mobile List View
            <div className="flex-1 overflow-auto px-4">
              <MobileListView events={events} selectedDate={selectedDate} />
            </div>
          )}
        </>
      )}
    </div>
  );
};
