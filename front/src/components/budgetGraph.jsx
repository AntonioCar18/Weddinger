import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { PiggyBank } from 'lucide-react';

const BudgetGraph = ({ budget, used }) => {

    const b = Number(budget) || 0;
    const u = Number(used) || 0;
    const remaining = Math.max(0, b - u);
    const percentage = b > 0 ? Math.min(100, (u / b) * 100) : 0;
    const data = [
        { value: u > 0 ? u : 0, color: 'url(#budgetGradient)' },
        { value: b > 0 ? remaining : 1, color: '#F1EEE8' },
    ];

    return (
        <div className="flex flex-col p-8 bg-white rounded-2xl border border-[#efe9e0] shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-[#B8926A]/10 rounded-xl text-[#8B6B47]">
                    <PiggyBank size={20} strokeWidth={2.5} />
                </div>
                <h2 className="font-display text-xl font-bold text-gray-800">Pregled stanja budžeta</h2>
            </div>

            <div className="relative w-full h-65 min-h-65">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <defs>
                            <linearGradient id="budgetGradient" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#c39d76" />
                                <stop offset="100%" stopColor="#8B6B47" />
                            </linearGradient>
                        </defs>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={92}
                            outerRadius={108}
                            paddingAngle={u > 0 && remaining > 0 ? 2 : 0}
                            cornerRadius={8}
                            dataKey="value"
                            stroke="none"
                            startAngle={90}
                            endAngle={-270}
                            isAnimationActive={true}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-1.5">
                    <span className="text-[11px] font-bold tracking-wide uppercase text-[#8B6B47] bg-[#B8926A]/10 px-3 py-1 rounded-full">
                        {percentage.toFixed(0)}% iskorišteno
                    </span>
                    <span className="text-3xl md:text-4xl font-extrabold text-gray-800 leading-none mt-1">
                        € {u.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-400">od € {b.toLocaleString()}</span>
                </div>
            </div>

            <div className="flex flex-col gap-4 mt-2">
                <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2.5 rounded-xl bg-[#faf7f2] border border-[#efe9e0] px-4 py-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-linear-to-br from-[#c39d76] to-[#8B6B47] shrink-0" />
                        <div className="flex flex-col min-w-0">
                            <span className="text-[11px] text-gray-400 uppercase tracking-wide">Potrošeno</span>
                            <span className="text-sm font-bold text-gray-800 truncate">€ {u.toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2.5 rounded-xl bg-[#faf7f2] border border-[#efe9e0] px-4 py-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-gray-300 shrink-0" />
                        <div className="flex flex-col min-w-0">
                            <span className="text-[11px] text-gray-400 uppercase tracking-wide">Preostalo</span>
                            <span className="text-sm font-bold text-gray-800 truncate">€ {remaining.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-linear-to-r from-[#c39d76] to-[#8B6B47] rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

export default BudgetGraph;
