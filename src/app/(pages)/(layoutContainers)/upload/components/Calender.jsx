import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  format,
  isToday,
} from "date-fns";
import { ArrowRightCircle, ArrowLeftCircle } from "lucide-react";
import { useState } from "react";

const CustomCalendar = ({ selectedDate, onDateSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const renderHeader = () => (
    <div className="flex justify-between items-center px-4 py-2 text-white bg-primary rounded-t-md">
      <button
        onClick={() => setCurrentMonth((prev) => subMonths(prev, 1))}
        className="px-2 py-1 rounded hover:bg-secondary"
      >
        <ArrowLeftCircle />
      </button>
      <div className="font-semibold">{format(currentMonth, "MMMM yyyy")}</div>
      <button
        onClick={() => setCurrentMonth((prev) => addMonths(prev, 1))}
        className="px-2 py-1 rounded hover:bg-secondary"
      >
        <ArrowRightCircle />
      </button>
    </div>
  );

  const renderDaysOfWeek = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return (
      <div className="grid grid-cols-7 text-sm font-medium text-center text-white bg-primary">
        {days.map((day) => (
          <div key={day} className="py-2">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderDates = () => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    const dateMatrix = [];
    let day = start;

    while (day <= end) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        const thisDay = day;
        const isCurrentMonth = isSameMonth(thisDay, currentMonth);
        const isSelected = selectedDate && isSameDay(thisDay, selectedDate);
        const today = isToday(thisDay);

        week.push(
          <div
            key={thisDay}
            className={`flex py-2.5 items-center justify-center text-sm cursor-pointer rounded-md select-none transition 
              ${!isCurrentMonth ? "text-gray-400" : ""}
              ${today ? "border border-white" : ""}
              ${
                isSelected
                  ? "bg-white text-black font-semibold"
                  : "hover:bg-secondary hover:text-white"
              }
            `}
            onClick={() => isCurrentMonth && onDateSelect(thisDay)}
          >
            {format(thisDay, "d")}
          </div>
        );

        day = addDays(day, 1);
      }
      dateMatrix.push(
        <div key={day} className="grid grid-cols-7">
          {week}
        </div>
      );
    }

    return <div>{dateMatrix}</div>;
  };

  return (
    <div className="bg-primary text-white rounded-md w-full max-w-md mx-auto shadow-lg overflow-hidden">
      {renderHeader()}
      {renderDaysOfWeek()}
      {renderDates()}
    </div>
  );
};

export default CustomCalendar;
