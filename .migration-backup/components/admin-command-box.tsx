"use client";

import { useMemo, useState } from "react";
import { WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { parseAdminCommand } from "@/lib/admin-parser";

export function AdminCommandBox() {
  const [command, setCommand] = useState("Update Rahul with 58% in Unit test 4, weak in Rotational Dynamics and Electrostatics, send monthly WhatsApp summary");
  const parsed = useMemo(() => parseAdminCommand(command), [command]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <WandSparkles className="size-4 text-gold-600" />
          Prompt to structured update
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <textarea
          value={command}
          onChange={(event) => setCommand(event.target.value)}
          className="min-h-24 w-full resize-none rounded-xl border border-gold-500/25 bg-ivory-50 p-3 text-sm text-navy-950 outline-none ring-gold-400/40 focus:ring-2"
        />
        <div className="grid gap-3 rounded-xl border border-gold-500/20 bg-ivory-100 p-3 text-sm md:grid-cols-2">
          <p><span className="text-navy-800/60">Student:</span> {parsed.studentName}</p>
          <p><span className="text-navy-800/60">Test:</span> {parsed.testName}</p>
          <p><span className="text-navy-800/60">Score:</span> {parsed.percentage ?? "Needs entry"}%</p>
          <p><span className="text-navy-800/60">WhatsApp:</span> {parsed.createWhatsappDraft ? "Draft required" : "Not requested"}</p>
          <div className="md:col-span-2 flex flex-wrap gap-2">
            {parsed.weakChapters.map((chapter) => <Badge key={chapter} tone="red">{chapter}</Badge>)}
          </div>
        </div>
        <Button type="button">Confirm preview</Button>
      </CardContent>
    </Card>
  );
}
