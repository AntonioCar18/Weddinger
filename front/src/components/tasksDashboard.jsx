import React from "react";
import { Dot } from "lucide-react";

const TaskDashboard = ({ taskName, category, date }) => {
  return (
    <div className="flex items-center justify-between w-full py-3.5 hover:bg-[#8B6B47]/5 hover:rounded-2xl">
      <div className="flex items-start gap-2">
        <Dot className="w-6 h-6 md:w-8 md:h-8 text-[#B8926A] hover:text-[#8B6B47] shrink-0 mt-1.5" />

        <div className="flex flex-col">
          <span className="text-xs md:text-sm font-semibold text-gray-800">
            {taskName}
          </span>
          <span className="text-xs text-gray-500">
            {category}
          </span>
        </div>
      </div>

      <div className="shrink-0 ml-4 mr-4 px-2.5 py-1 rounded-full text-xs font-semibold text-[#8B6B47] bg-[#B8926A]/10">
        {date}
      </div>
    </div>
  );
};

export default TaskDashboard;