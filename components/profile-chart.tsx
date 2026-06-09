"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function ProfileChart({ data }: { data: Array<{ name: string; score: number; batch: number }> }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: -16, right: 8, top: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="score" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#e7c56d" stopOpacity={0.45} />
              <stop offset="95%" stopColor="#e7c56d" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} domain={[40, 100]} />
          <Tooltip
            contentStyle={{
              background: "#0a1729",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 12,
              color: "#fff"
            }}
          />
          <Area type="monotone" dataKey="batch" stroke="#64748b" strokeWidth={2} fill="transparent" name="Batch avg" />
          <Area type="monotone" dataKey="score" stroke="#e7c56d" strokeWidth={3} fill="url(#score)" name="Student score" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
