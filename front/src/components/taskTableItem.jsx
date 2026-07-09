import { Calendar, Flag } from "lucide-react";

const TaskTableItem = ({ task }) => {
    const categoryColors = {
        "Prostor": "bg-blue-100 text-blue-800",
        "Glazba": "bg-green-100 text-green-800",
        "Ugostiteljstvo": "bg-purple-100 text-purple-800",
        "Dekoracije": "bg-yellow-100 text-yellow-800",
        "Fotograf": "bg-red-100 text-red-800",
        "Administracija": "bg-gray-100 text-gray-800",
        "Ostalo": "bg-pink-100 text-pink-800",
    };

    return (
        <div className="border border-gray-200 rounded-lg flex items-center hover:shadow-md transition-all bg-white">
            <button
                className={`w-6 h-6 ml-6 mr-2 border-2 rounded shrink-0 transition-colors ${
                    task.completed ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300'
                }`}
                onClick={() => {
                    // Handle task completion toggle here
                }}
            />
            
            <div className="p-4 gap-2 flex flex-col w-full">
                <div className="flex justify-between items-center">
                    <h3 className={`font-semibold text-gray-700 ${task.completed ? 'line-through text-gray-400' : ''}`}>
                        {task.task_name}
                    </h3>
                </div>
                <div className="flex justify-start items-center gap-4">
                    <div className={`px-2 py-0.5 rounded text-xs font-medium ${categoryColors[task.category] || 'bg-gray-100 text-gray-600'}`}>
                        {task.category}
                    </div>
                    <div className="flex gap-1 items-center">
                        <Flag className="w-3.5 h-3.5 text-gray-400" />
                        <p className="text-gray-500 text-xs">{task.priority}</p>
                    </div>
                    <div className="flex gap-1 items-center">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <p className="text-gray-500 text-xs">{task.due_date}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskTableItem;