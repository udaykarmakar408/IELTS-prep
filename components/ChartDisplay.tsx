import React from "react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from "recharts";

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export const ChartDisplay = ({ type, data }: { type: string; data: any[] }) => {
  if (type === "line") {
    const keys = Object.keys(data[0]).filter(k => k !== 'year' && k !== 'month');
    return (
      <div className="h-[300px] w-full mt-4 bg-bg-1 p-4 rounded-2xl border border-border/50">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey={data[0].year ? 'year' : 'month'} stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
              itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
            />
            <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
            {keys.map((key, i) => (
              <Line key={key} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]} strokeWidth={3} dot={{ r: 4, fill: COLORS[i % COLORS.length], strokeWidth: 0 }} activeDot={{ r: 6 }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }
  
  if (type === "bar") {
    const keys = Object.keys(data[0]).filter(k => k !== 'area' && k !== 'category' && k !== 'sport' && k !== 'country');
    return (
      <div className="h-[300px] w-full mt-4 bg-bg-1 p-4 rounded-2xl border border-border/50">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey={data[0].area ? 'area' : data[0].category ? 'category' : data[0].sport ? 'sport' : 'country'} stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
              itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
            />
            <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
            {keys.map((key, i) => (
              <Bar key={key} dataKey={key} fill={COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === "pie") {
    return (
      <div className="h-[300px] w-full mt-4 bg-bg-1 p-4 rounded-2xl border border-border/50">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
              itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
            />
            <Legend verticalAlign="bottom" height={36}/>
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === "table") {
    const headers = Object.keys(data[0]);
    return (
      <div className="mt-4 overflow-x-auto rounded-2xl border border-border/50">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-bg-2 text-text-muted">
            <tr>
              {headers.map(h => <th key={h} className="px-6 py-3 font-bold">{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {data.map((row, i) => (
              <tr key={i} className="bg-bg-1 hover:bg-bg-2 transition-colors">
                {headers.map(h => <td key={h} className="px-6 py-4 font-medium text-text-primary">{row[h]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (type === "diagram") {
    return (
      <div className="mt-4 p-6 bg-bg-1 rounded-2xl border border-border/50">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {data.map((step, i) => (
            <div key={i} className="relative p-4 bg-bg-2 rounded-xl border border-border/30 flex flex-col items-center text-center group hover:border-blue-primary transition-all">
              <div className="w-8 h-8 rounded-full bg-blue-primary text-white flex items-center justify-center font-bold mb-3 shadow-lg shadow-blue-primary/20">
                {i + 1}
              </div>
              <div className="text-xs font-bold text-text-primary leading-tight">{step.label}</div>
              {i < data.length - 1 && (
                <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-blue-primary/30">
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};
