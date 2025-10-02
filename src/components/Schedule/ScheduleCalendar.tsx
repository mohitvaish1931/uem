import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import AddScheduleModal from './AddScheduleModal';
import { User, Schedule } from '../../types';
import { scheduleService } from '../../services/scheduleService';

interface ScheduleCalendarProps {
  user: User;
}

const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({ user }) => {
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return isNaN(now.getTime()) ? new Date(2025, 9, 1) : now; // Oct 1, 2025 as fallback
  });
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return isNaN(now.getTime()) ? new Date(2025, 9, 1) : now; // Oct 1, 2025 as fallback
  });
  const [isAddScheduleModalOpen, setIsAddScheduleModalOpen] = useState(false);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleScheduleAdded = (newSchedule: Schedule) => {
    setSchedules(prev => [...prev, newSchedule]);
    fetchSchedules(); // Refresh schedules after adding
  };

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching schedules from API...');
      const response = await scheduleService.getSchedules();
      const rawScheduleData = response.schedules || [];
      
      console.log(`API returned ${rawScheduleData.length} schedules`);
      
      // Debug: Log the first few raw schedules to see their structure
      if (rawScheduleData.length > 0) {
        console.log('Sample raw schedule:', rawScheduleData[0]);
        console.log('All raw schedule keys:', Object.keys(rawScheduleData[0]));
      }
      
      // Ultra-robust validation and sanitization
      const validSchedules: Schedule[] = [];
      
      rawScheduleData.forEach((schedule, index) => {
        try {
          // Check if schedule is an object
          if (!schedule || typeof schedule !== 'object') {
            console.warn(`Schedule ${index} is not an object:`, schedule);
            return;
          }
          
          // Debug: log the entire schedule object to see what fields are available
          console.log(`Debug schedule ${index}:`, schedule);
          
          // Check required fields exist - be more flexible about the date field
          if (!schedule.departureTime || !schedule.arrivalTime) {
            console.warn(`Schedule ${index} missing time fields:`, {
              id: schedule.id || (schedule as any)._id || 'no-id',
              hasDepTime: !!schedule.departureTime,
              hasArrTime: !!schedule.arrivalTime,
              hasDate: !!schedule.date,
              hasCreatedAt: !!(schedule as any).createdAt,
              allFields: Object.keys(schedule)
            });
            return;
          }
          
          // Test date creation with detailed logging
          let depDate: Date, arrDate: Date, schedDate: Date;
          
          try {
            depDate = new Date(schedule.departureTime);
            if (isNaN(depDate.getTime())) {
              console.warn(`Schedule ${index} has invalid departure time:`, schedule.departureTime);
              return;
            }
          } catch (e) {
            console.warn(`Schedule ${index} departure time parsing failed:`, schedule.departureTime, e);
            return;
          }
          
          try {
            arrDate = new Date(schedule.arrivalTime);
            if (isNaN(arrDate.getTime())) {
              console.warn(`Schedule ${index} has invalid arrival time:`, schedule.arrivalTime);
              return;
            }
          } catch (e) {
            console.warn(`Schedule ${index} arrival time parsing failed:`, schedule.arrivalTime, e);
            return;
          }
          
          try {
            // Try multiple ways to get a date from the schedule
            let dateValue = schedule.date || 
                           (schedule as any).createdAt || 
                           schedule.departureTime;
            
            // If we have departure time, extract just the date part and create a proper date
            if (!schedule.date && schedule.departureTime) {
              const depDate = new Date(schedule.departureTime);
              if (!isNaN(depDate.getTime())) {
                // Create a new date using local date components to avoid timezone issues
                dateValue = new Date(depDate.getFullYear(), depDate.getMonth(), depDate.getDate()).toISOString();
              }
            }
            
            schedDate = new Date(dateValue);
            if (isNaN(schedDate.getTime())) {
              console.warn(`Schedule ${index} has invalid date:`, {
                originalDate: schedule.date,
                createdAt: (schedule as any).createdAt,
                departureTime: schedule.departureTime,
                extractedDate: dateValue
              });
              return;
            }
          } catch (e) {
            console.warn(`Schedule ${index} date parsing failed:`, {
              originalDate: schedule.date,
              error: e
            });
            return;
          }
          
          // Validate logical order
          if (arrDate <= depDate) {
            console.warn(`Schedule ${index} has arrival before departure:`, {
              departure: depDate,
              arrival: arrDate
            });
            return;
          }
          
          // Create sanitized schedule object
          const sanitizedSchedule: Schedule = {
            id: schedule.id || (schedule as any)._id || `temp-${index}`,
            routeId: typeof schedule.route === 'string' ? schedule.route : 
                     (schedule.route?.name || schedule.routeId || 'Unknown'),
            busId: typeof schedule.bus === 'string' ? schedule.bus : 
                   (schedule.bus?.busNumber || schedule.busId || 'Unknown'),
            date: schedDate.toISOString(), // Use ISO string format for consistency
            departureTime: depDate.toISOString(),
            arrivalTime: arrDate.toISOString(),
            status: (schedule.status as any) || 'scheduled',
            passengerCount: schedule.passengerCount || 0,
            route: typeof schedule.route === 'object' ? schedule.route : 
                   { name: typeof schedule.route === 'string' ? schedule.route : 'Unknown' },
            bus: typeof schedule.bus === 'object' ? schedule.bus : 
                 { busNumber: typeof schedule.bus === 'string' ? schedule.bus : 'Unknown' }
          };
          
          validSchedules.push(sanitizedSchedule);
          console.log(`✓ Successfully processed schedule ${index}:`, {
            id: sanitizedSchedule.id,
            date: sanitizedSchedule.date,
            departureTime: sanitizedSchedule.departureTime,
            route: sanitizedSchedule.routeId,
            bus: sanitizedSchedule.busId
          });
          
        } catch (error) {
          console.warn(`Unexpected error processing schedule ${index}:`, error, schedule);
        }
      });
      
      console.log(`Successfully processed ${validSchedules.length} valid schedules`);
      setSchedules(validSchedules);
      
      if (validSchedules.length === 0 && rawScheduleData.length > 0) {
        setError('All schedule data was invalid. Please check the database.');
      }
      
    } catch (err: any) {
      console.error('Failed to fetch schedules:', err);
      setError('Failed to load schedules: ' + (err.message || 'Unknown error'));
      setSchedules([]); // Ensure we have an empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  // Get schedules for a specific date
  const getSchedulesForDate = (date: Date) => {
    try {
      // First validate the input date parameter
      if (!date || isNaN(date.getTime())) {
        console.warn('Invalid date parameter passed to getSchedulesForDate:', date);
        return [];
      }
      
      // Use local date strings to avoid timezone issues
      const targetYear = date.getFullYear();
      const targetMonth = date.getMonth(); // 0-based
      const targetDay = date.getDate();
      
      console.log(`Looking for schedules on date: ${targetYear}-${targetMonth + 1}-${targetDay}, total schedules: ${schedules.length}`);
      
      return schedules.filter(schedule => {
        try {
          // Handle multiple ways to get the date from a schedule
          let scheduleDate: Date;
          
          if (schedule.date) {
            scheduleDate = new Date(schedule.date);
          } else if (schedule.departureTime) {
            // Extract date from departure time if no explicit date field
            scheduleDate = new Date(schedule.departureTime);
          } else {
            console.warn('Schedule has no date or departureTime:', schedule);
            return false;
          }
          
          // Check if the date is valid
          if (isNaN(scheduleDate.getTime())) {
            console.warn('Invalid schedule date:', schedule.date, 'for schedule:', schedule);
            return false;
          }
          
          // Compare using local date components to avoid timezone issues
          const scheduleYear = scheduleDate.getFullYear();
          const scheduleMonth = scheduleDate.getMonth(); // 0-based
          const scheduleDay = scheduleDate.getDate();
          
          const matches = targetYear === scheduleYear && 
                         targetMonth === scheduleMonth && 
                         targetDay === scheduleDay;
          
          console.log(`Date comparison:`, {
            target: `${targetYear}-${targetMonth + 1}-${targetDay}`,
            schedule: `${scheduleYear}-${scheduleMonth + 1}-${scheduleDay}`,
            matches,
            originalScheduleDate: schedule.date,
            scheduleId: schedule.id || (schedule as any)._id
          });
          
          return matches;
        } catch (error) {
          console.warn('Error processing schedule date:', schedule.date, error);
          return false;
        }
      });
    } catch (error) {
      console.warn('Error in getSchedulesForDate:', error);
      return [];
    }
  };

  // Check if a date has schedules
  const hasSchedulesOnDate = (date: Date) => {
    try {
      // Extra safety check for the date parameter
      if (!date || isNaN(date.getTime())) {
        return false;
      }
      return getSchedulesForDate(date).length > 0;
    } catch (error) {
      console.warn('Error checking schedules for date:', date, error);
      return false;
    }
  };
  
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const timeSlots = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  const selectedDateSchedules = React.useMemo(() => {
    try {
      // Validate selectedDate before processing
      if (!selectedDate || isNaN(selectedDate.getTime())) {
        console.warn('Invalid selectedDate:', selectedDate);
        return [];
      }
      
      const dateSchedules = getSchedulesForDate(selectedDate) || [];
      console.log(`Found ${dateSchedules.length} schedules for selected date ${selectedDate.toDateString()}:`, dateSchedules);
      
      return dateSchedules;
    } catch (error) {
      console.warn('Error getting schedules for selected date:', selectedDate, error);
      return [];
    }
  }, [schedules, selectedDate]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    try {
      const newDate = new Date(currentDate);
      if (isNaN(newDate.getTime())) {
        console.warn('Invalid currentDate for navigation:', currentDate);
        return;
      }
      
      if (direction === 'prev') {
        newDate.setMonth(currentDate.getMonth() - 1);
      } else {
        newDate.setMonth(currentDate.getMonth() + 1);
      }
      
      if (isNaN(newDate.getTime())) {
        console.warn('Navigation resulted in invalid date:', newDate);
        return;
      }
      
      setCurrentDate(newDate);
      // Refresh schedules when navigating to a new month
      fetchSchedules();
    } catch (error) {
      console.error('Error in navigateMonth:', error);
    }
  };

  const getDaysInMonth = () => {
    try {
      if (!currentDate || isNaN(currentDate.getTime())) {
        console.warn('Invalid currentDate in getDaysInMonth:', currentDate);
        return [];
      }
      
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      
      if (isNaN(firstDay.getTime()) || isNaN(lastDay.getTime())) {
        console.warn('Invalid dates generated in getDaysInMonth:', { firstDay, lastDay });
        return [];
      }
      
      const daysInMonth = lastDay.getDate();
      const startingDayOfWeek = firstDay.getDay();

      const days = [];
      
      // Add empty cells for days before the first day of the month
      for (let i = 0; i < startingDayOfWeek; i++) {
        days.push(null);
      }
      
      // Add days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        const dayDate = new Date(year, month, day);
        if (!isNaN(dayDate.getTime())) {
          days.push(dayDate);
        } else {
          console.warn('Invalid day date generated:', { year, month, day });
          days.push(null);
        }
      }
      
      return days;
    } catch (error) {
      console.error('Error in getDaysInMonth:', error);
      return [];
    }
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSameDay = (date1: Date | null, date2: Date) => {
    if (!date1) return false;
    return date1.toDateString() === date2.toDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Schedule Calendar</h1>
          <p className="text-gray-600 mt-1">Manage bus schedules across 365 days with 24-hour coverage</p>
        </div>
        {user.role !== 'viewer' && (
          <div className="flex space-x-2">
            <button 
              onClick={() => setIsAddScheduleModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add Schedule</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {schedules.length} total schedule{schedules.length !== 1 ? 's' : ''} this month
              </p>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                title="Previous month"
              >
                <ChevronLeft className="w-5 h-5 group-hover:text-blue-600" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Go to current month"
              >
                Today
              </button>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                title="Next month"
              >
                <ChevronRight className="w-5 h-5 group-hover:text-blue-600" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {getDaysInMonth().map((date, index) => {
              const hasSchedules = date && hasSchedulesOnDate(date);
              const schedulesCount = date ? getSchedulesForDate(date).length : 0;
              const isSelected = date && isSameDay(date, selectedDate);
              const isTodayDate = date && isToday(date);
              
              return (
                <button
                  key={index}
                  onClick={() => {
                    if (date && !isNaN(date.getTime())) {
                      setSelectedDate(date);
                      console.log(`📅 Selected date: ${date.toDateString()}, Schedules: ${schedulesCount}`);
                    } else {
                      console.warn('Attempted to set invalid date:', date);
                    }
                  }}
                  className={`
                    group aspect-square flex flex-col items-center justify-center text-sm rounded-lg transition-all duration-200 relative
                    ${!date ? 'invisible' : ''}
                    ${isTodayDate ? 'bg-blue-600 text-white font-semibold shadow-lg' : ''}
                    ${isSelected && !isTodayDate ? 'bg-blue-100 text-blue-700 font-semibold border-2 border-blue-300 shadow-md' : ''}
                    ${!isTodayDate && !isSelected ? 'hover:bg-gray-100 hover:shadow-sm' : ''}
                    ${hasSchedules && !isTodayDate && !isSelected ? 'bg-blue-50' : ''}
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
                  `}
                  disabled={!date}
                  title={date ? `${date.toDateString()}${hasSchedules ? ` - ${schedulesCount} schedule${schedulesCount !== 1 ? 's' : ''}` : ' - No schedules'}` : ''}
                >
                  <span className="relative z-10">{date?.getDate()}</span>
                  {hasSchedules && (
                    <div className="flex items-center justify-center mt-0.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        isTodayDate ? 'bg-white' : isSelected ? 'bg-blue-600' : 'bg-blue-500'
                      }`} />
                      {schedulesCount > 1 && (
                        <span className={`text-xs ml-1 font-medium ${
                          isTodayDate ? 'text-white' : isSelected ? 'text-blue-700' : 'text-blue-600'
                        }`}>
                          {schedulesCount}
                        </span>
                      )}
                    </div>
                  )}
                  {isSelected && (
                    <div className="absolute inset-0 bg-blue-200 rounded-lg opacity-20 pointer-events-none" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Schedule for selected date */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long',
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </h3>
            </div>
            <div className="text-sm text-gray-500">
              {selectedDateSchedules.length} schedule{selectedDateSchedules.length !== 1 ? 's' : ''}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading schedules...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
              <button 
                onClick={fetchSchedules}
                className="text-blue-600 hover:text-blue-700 mt-2"
              >
                Try again
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {selectedDateSchedules
                .sort((a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime())
                .map((schedule, index) => {
                let departureTime = 'Invalid Time';
                let arrivalTime = 'Invalid Time';
                let duration = '';
                
                try {
                  const depDate = new Date(schedule.departureTime);
                  const arrDate = new Date(schedule.arrivalTime);
                  
                  if (!isNaN(depDate.getTime())) {
                    departureTime = depDate.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    });
                  }
                  
                  if (!isNaN(arrDate.getTime())) {
                    arrivalTime = arrDate.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit', 
                      hour12: true
                    });
                    
                    // Calculate duration
                    const diffMs = arrDate.getTime() - depDate.getTime();
                    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                    duration = `${diffHours}h ${diffMinutes}m`;
                  }
                } catch (error) {
                  console.warn('Error parsing schedule times:', schedule, error);
                }
                
                return (
                  <div key={schedule.id || index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 hover:border-blue-300 transition-all duration-200 cursor-pointer group">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="font-semibold text-gray-900 text-base">
                          {departureTime}
                        </span>
                        <span className="text-gray-400">→</span>
                        <span className="font-semibold text-gray-900 text-base">
                          {arrivalTime}
                        </span>
                        {duration && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {duration}
                          </span>
                        )}
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                        schedule.status === 'scheduled' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                        schedule.status === 'in-progress' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                        schedule.status === 'completed' ? 'bg-green-100 text-green-700 border border-green-200' :
                        schedule.status === 'cancelled' ? 'bg-red-100 text-red-700 border border-red-200' :
                        'bg-gray-100 text-gray-700 border border-gray-200'
                      }`}>
                        {schedule.status?.charAt(0).toUpperCase() + schedule.status?.slice(1)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-green-100 rounded flex items-center justify-center">
                          <div className="w-2 h-2 bg-green-600 rounded"></div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Bus</p>
                          <p className="text-sm font-medium text-gray-900">
                            {schedule.bus?.busNumber || schedule.busId || 'Unknown'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-purple-100 rounded flex items-center justify-center">
                          <div className="w-2 h-2 bg-purple-600 rounded"></div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Route</p>
                          <p className="text-sm font-medium text-gray-900">
                            {schedule.route?.name || schedule.routeId || 'Unknown'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {schedule.passengerCount !== undefined && (
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <span className="text-xs text-gray-500">Passengers</span>
                        <span className="text-sm font-medium text-gray-700">
                          {schedule.passengerCount}
                        </span>
                      </div>
                    )}
                    
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-2">
                      <div className="text-xs text-gray-400">
                        Click for more details
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {selectedDateSchedules.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium mb-2">
                    No schedules for {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                  </p>
                  <p className="text-gray-400 text-sm mb-4">
                    This date is available for new schedules
                  </p>
                  {user.role !== 'viewer' && (
                    <button
                      onClick={() => setIsAddScheduleModalOpen(true)}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Schedule
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 24-Hour Timeline View */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">24-Hour Timeline View</h3>
        <div className="overflow-x-auto">
          <div className="flex space-x-4 min-w-max">
            {timeSlots.map((time) => {
              const schedulesInSlot = selectedDateSchedules.filter(schedule => {
                try {
                  const depDate = new Date(schedule.departureTime);
                  if (isNaN(depDate.getTime())) {
                    return false;
                  }
                  
                  const depTime = depDate.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                  });
                  return depTime.startsWith(time.split(':')[0]);
                } catch (error) {
                  console.warn('Error parsing departure time for timeline:', schedule, error);
                  return false;
                }
              });
              
              return (
                <div key={time} className="flex-shrink-0 w-24">
                  <div className="text-center text-sm font-medium text-gray-600 mb-2">
                    {time}
                  </div>
                  <div className={`h-16 rounded-lg border-2 border-dashed ${
                    schedulesInSlot.length > 0
                      ? 'bg-blue-100 border-blue-300' 
                      : 'bg-gray-50 border-gray-300'
                  } flex items-center justify-center p-1`}>
                    {schedulesInSlot.length > 0 && (
                      <div className="text-center">
                        <div className="text-xs font-semibold text-blue-600">
                          {schedulesInSlot[0].bus?.busNumber || schedulesInSlot[0].busId}
                        </div>
                        {schedulesInSlot.length > 1 && (
                          <div className="text-xs text-blue-500">
                            +{schedulesInSlot.length - 1} more
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <AddScheduleModal
        isOpen={isAddScheduleModalOpen}
        onClose={() => setIsAddScheduleModalOpen(false)}
        selectedDate={selectedDate}
        onScheduleAdded={handleScheduleAdded}
      />
    </div>
  );
};

export default ScheduleCalendar;