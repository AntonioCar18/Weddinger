import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const BudgetGraph = ({ budget, used }) => {
    
    const b = Number(budget) || 0;
    const u = Number(used) || 0;
    const remaining = Math.max(0, b - u);
    const data = [
        { value: u > 0 ? u : 0, color: '#B8926A' },
        { value: b > 0 ? remaining : 1, color: '#E5E7EB' },
    ];

    return (
        <div className="flex flex-col p-8 bg-white shadow rounded-xl">
            <h2 className="text-2xl font-semibold items-center justify-center flex">Pregled stanja budžeta</h2>
            
            <div className="relative w-full h-75 min-h-75 outline-none">
                <ResponsiveContainer width="100%" height="100%" className="outline-none">
                    <PieChart className="outline-none border-none">
                        <Pie
                            data={data}
                            cx="50%" 
                            cy="50%"
                            innerRadius={100}
                            outerRadius={110}
                            paddingAngle={0}
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
                
                <div className='absolute inset-0 flex flex-col items-center justify-center pointer-events-none'>
                    <span className='text-4xl font-bold'>€ {u.toLocaleString()}</span>
                    <span>od € {b.toLocaleString()}</span>
                </div>
            </div>

            <div className='flex flex-col'>
                <div className='flex justify-between'> 
                    <span className='font-bold'>Preostalo za platiti:</span>
                    <span className='font-bold'>€ {remaining.toLocaleString()}</span>
                </div>
                <div className='w-full h-2 mt-4 bg-gray-200 rounded-full overflow-hidden'>
                    <div 
                        className='h-full bg-[#B8926A]'
                        style={{ width: `${Math.min(100, (u / b) * 100)}%` }}    
                    />
                </div>
            </div>
        </div>
    );
};

export default BudgetGraph;