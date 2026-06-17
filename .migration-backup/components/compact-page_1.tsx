import { AppShell, PageHeader } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CompactPage({
  active,
  eyebrow,
  title,
  lead,
  items
}: {
  active: string;
  eyebrow: string;
  title: string;
  lead: string;
  items: Array<{ title: string; body: string; badge?: string }>;
}) {
  return (
    <AppShell active={active}>
      <PageHeader eyebrow={eyebrow} title={title} />
      <Card>
        <CardContent className="p-5 text-sm leading-6 text-navy-800/75">{lead}</CardContent>
      </Card>
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <Card key={item.title}>
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-navy-800/75">{item.body}</p>
              {item.badge ? <Badge tone="gold" className="mt-4">{item.badge}</Badge> : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
