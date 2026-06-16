"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ChartPoint = Record<string, string | number | null>;

function EmptyChart({ title }: { title: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid h-56 place-items-center rounded-xl border border-gold-500/20 bg-ivory-50 text-sm text-navy-800/60">
          Upload marks to generate this graph.
        </div>
      </CardContent>
    </Card>
  );
}

const tooltip = {
  background: "#06152b",
  border: "1px solid rgba(214,162,44,0.35)",
  borderRadius: 10,
  color: "#fff"
};

export function PerformanceGraphs({
  weekly,
  monthly,
  subjects,
  readiness,
  movement
}: {
  weekly: ChartPoint[];
  monthly: ChartPoint[];
  subjects: ChartPoint[];
  readiness: ChartPoint[];
  movement: ChartPoint[];
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {weekly.length ? (
        <Card>
          <CardHeader><CardTitle>Weekly Tests</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weekly}>
                <CartesianGrid stroke="rgba(6,21,43,0.1)" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "#0d2a50", fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fill: "#0d2a50", fontSize: 12 }} />
                <Tooltip contentStyle={tooltip} />
                <Line type="monotone" dataKey="score" stroke="#ca911f" strokeWidth={3} />
                <Line type="monotone" dataKey="movingAverage" stroke="#0d2a50" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ) : <EmptyChart title="Weekly Tests" />}

      {monthly.length ? (
        <Card>
          <CardHeader><CardTitle>Monthly Tests</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly}>
                <CartesianGrid stroke="rgba(6,21,43,0.1)" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "#0d2a50", fontSize: 12 }} />
                <YAxis tick={{ fill: "#0d2a50", fontSize: 12 }} />
                <Tooltip contentStyle={tooltip} />
                <Area type="monotone" dataKey="score" stroke="#ca911f" fill="#d6a22c55" />
                <Line type="monotone" dataKey="rank" stroke="#0d2a50" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ) : <EmptyChart title="Monthly Tests" />}

      {subjects.length ? (
        <Card>
          <CardHeader><CardTitle>Subject Wise</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjects}>
                <CartesianGrid stroke="rgba(6,21,43,0.1)" vertical={false} />
                <XAxis dataKey="subject" tick={{ fill: "#0d2a50", fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fill: "#0d2a50", fontSize: 12 }} />
                <Tooltip contentStyle={tooltip} />
                <Bar dataKey="score" fill="#ca911f" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ) : <EmptyChart title="Subject Wise" />}

      {readiness.length ? (
        <Card>
          <CardHeader><CardTitle>CET Readiness</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={readiness}>
                <CartesianGrid stroke="rgba(6,21,43,0.1)" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "#0d2a50", fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fill: "#0d2a50", fontSize: 12 }} />
                <Tooltip contentStyle={tooltip} />
                <Area type="monotone" dataKey="readiness" stroke="#0d2a50" fill="#0d2a5050" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ) : <EmptyChart title="CET Readiness" />}

      {movement.length ? (
        <Card className="xl:col-span-2">
          <CardHeader><CardTitle>Leaderboard Movement</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={movement}>
                <CartesianGrid stroke="rgba(6,21,43,0.1)" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "#0d2a50", fontSize: 12 }} />
                <YAxis tick={{ fill: "#0d2a50", fontSize: 12 }} />
                <Tooltip contentStyle={tooltip} />
                <Bar dataKey="movement" fill="#d6a22c" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ) : <EmptyChart title="Leaderboard Movement" />}
    </div>
  );
}
