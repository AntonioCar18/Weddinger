import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const TasksGraph = ({ totalTasks, completedTasks }) => {

    const b = Number(totalTasks) || 0;
    const u = Number(completedTasks) || 0;
    const remaining = Math.max(0, b - u);
    const percent = b > 0 ? Math.round((u / b) * 100) : 0;
    const data = [
        { value: u > 0 ? u : 0, color: '#B8926A' },
        { value: b > 0 ? remaining : 1, color: '#f1ece3' },
    ];

    return (
        <div className="flex items-center gap-8 w-full">
            <div className="relative w-35 h-35 shrink-0 outline-none">
                <ResponsiveContainer width="100%" height="100%" className="outline-none">
                    <PieChart className="outline-none border-none">
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={44}
                            outerRadius={56}
                            paddingAngle={0}
                            cornerRadius={6}
                            dataKey="value"
                            stroke="none"
                            startAngle={90}
                            endAngle={-270}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="font-sans font-extrabold text-xl text-[#2D2A26]">{percent}%</span>
                </div>
            </div>
            <div className="flex flex-col justify-center">
                <p className="text-sm text-[#8a8378] mb-1">Ukupan napredak</p>
                <p className="font-display text-[16px] lg:text-[18px] text-[#2D2A26] mb-1 font-semibold">
                    {percent >= 100 ? "Sve je spremno!" : percent >= 50 ? "Odlično napredujete" : "Krenimo s planiranjem"}
                </p>
                <p className="text-[12px] lg:text-sm text-[#8a8378]">{u} od {b} zadataka dovršeno</p>
            </div>
        </div>
    );
};

export default TasksGraph;