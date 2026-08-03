import { Calendar, Check, Flag, NotebookTabs, Trash, Trash2Icon, User2, Edit2 } from "lucide-react";
import { useState } from "react";
import EditTask from "./editTask";
import DeleteModal from "./deleteModal";

const TaskTableItem = ({ task, deleteTask, changeTaskStatus, updateTask, partners }) => {
    const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const categoryColors = {
        "Prostor": "bg-blue-100 text-blue-800",
        "Glazba": "bg-green-100 text-green-800",
        "Ugostiteljstvo": "bg-purple-100 text-purple-800",
        "Dekoracije": "bg-yellow-100 text-yellow-800",
        "Fotograf": "bg-red-100 text-red-800",
        "Administracija": "bg-gray-100 text-gray-800",
        "Ostalo": "bg-pink-100 text-pink-800",
    };

    const handleTaskCompletionToggle = () => {
        changeTaskStatus(task.task_id, !task.is_completed);
    };

    const handleTaskDeletion = () => {
        deleteTask(task.task_id);
    }

    return (
        <div className="w-full flex justify-between items-center">
            <div className="cursor-pointer border w-full border-gray-200 rounded-lg flex items-center hover:shadow-md transition-all bg-white">
                <button
                    className={`w-6 h-6 ml-6 mr-2 border-2 rounded shrink-0 transition-colors cursor-pointer ${
                        task.is_completed ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300'
                    }`}
                    onClick={handleTaskCompletionToggle}
                >
                    {task.is_completed && <Check className="w-4 h-4 text-white m-auto" />}
                    </button>
                
                <div className="p-4 gap-2 flex flex-col lg:w-full grow min-w-0">
                    <div className="flex justify-between items-center">
                        <h3 className={`font-semibold text-gray-700 ${task.is_completed ? 'line-through text-gray-400' : ''}`}>
                            {task.task_name}
                        </h3>
                    </div>
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        <div className={`px-2 py-0.5 rounded items-center text-xs font-medium w-fit ${categoryColors[task.category] || 'bg-gray-100 text-gray-600'}`}>
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
                        {task.owner && (
                            <div className="flex gap-1 items-center">
                                <User2 className="w-3.5 h-3.5 text-gray-400" />
                                <p className="text-gray-500 text-xs">{task.owner}</p>
                            </div>
                        )}
                        {task.notes && (
                            <div className="flex gap-1 items-center min-w-0 overflow-hidden">
                                <NotebookTabs className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                <p className="text-gray-500 text-xs truncate whitespace-nowrap">{task.notes}</p>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex lg:flex-row flex-col items-center justify-end gap-4 lg:gap-0 pr-4"> 
                <button
                    onClick={() => setIsEditTaskOpen(true)}
                >
                    <Edit2 className="w-5 h-5 text-[#B8926A] cursor-pointer mr-6"/>
                </button>
                {isEditTaskOpen && (
                    <EditTask
                        task={task}
                        onClose={() => setIsEditTaskOpen(false)}
                        onSave={(updateData) => {
                            updateTask(task.task_id, updateData);
                            setIsEditTaskOpen(false);
                        }}
                        partners={partners}
                    />
                )} 
                <button
                    onClick={() => {
                        setShowDeleteModal(true);
                    }}
                >
                    <Trash2Icon className="w-5 h-5 text-red-300 cursor-pointer mr-6"/>
                </button>
                </div>
                
            </div>
            {showDeleteModal && (
                <DeleteModal
                    onCancel={() => setShowDeleteModal(false)}
                    onDelete={handleTaskDeletion}
                    desc="Jeste li sigurni da želite obrisati ovaj zadatak? Ova akcija je nepovratna."
                    deleteText="Da, obriši zadatak"
                />
            )}
        </div>
    );
};

export default TaskTableItem;