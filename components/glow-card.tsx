"use client";

import BorderGlow from "@/components/ui/border-glow";

interface GlowCardProps {
  title: string;
  description: string;
  icon?: string;
  badge?: string;
  children?: React.ReactNode;
  glowColor?: "gold" | "blue" | "pink";
  animated?: boolean;
}

const colorMap = {
  gold: { colors: ["#D4AF37", "#F7E7A1", "#0A2342"], glow: "40 80 80" },
  blue: { colors: ["#38bdf8", "#0ea5e9", "#06b6d4"], glow: "192 100 50" },
  pink: { colors: ["#f472b6", "#ec4899", "#be185d"], glow: "330 81 60" }
};

export function GlowCard({
  title,
  description,
  icon,
  badge,
  children,
  glowColor = "gold",
  animated = false
}: GlowCardProps) {
  const colors = colorMap[glowColor].colors;
  const glow = colorMap[glowColor].glow;

  return (
    <BorderGlow
      colors={colors}
      glowColor={glow}
      backgroundColor="#0F1A2E"
      borderRadius={12}
      animated={animated}
      edgeSensitivity={25}
      fillOpacity={0.3}
      className="h-full overflow-hidden"
    >
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            {icon && <div className="text-3xl mb-2">{icon}</div>}
            <h3 className="font-serif text-lg font-semibold text-ivory-50">
              {title}
            </h3>
          </div>
          {badge && (
            <span className="inline-block px-2.5 py-1 text-xs font-medium rounded-full bg-gold-400/20 text-gold-300 border border-gold-400/40 whitespace-nowrap">
              {badge}
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-ivory-300/80 leading-relaxed">
          {description}
        </p>

        {/* Custom content */}
        {children && (
          <div className="pt-2 border-t border-gold-400/20">
            {children}
          </div>
        )}
      </div>
    </BorderGlow>
  );
}

export function BatchCard({
  name,
  subject,
  students,
  schedule,
  glowColor = "gold"
}: {
  name: string;
  subject: string;
  students: number;
  schedule: string;
  glowColor?: "gold" | "blue" | "pink";
}) {
  return (
    <GlowCard
      title={name}
      description={subject}
      icon="📚"
      badge={`${students} students`}
      glowColor={glowColor}
    >
      <div className="space-y-2 text-xs text-ivory-300/70">
        <div className="flex items-center gap-2">
          <span className="text-gold-400">📅</span>
          <span>{schedule}</span>
        </div>
      </div>
    </GlowCard>
  );
}

export function TeacherCard({
  name,
  subject,
  students,
  rating,
  glowColor = "gold"
}: {
  name: string;
  subject: string;
  students: number;
  rating: number;
  glowColor?: "gold" | "blue" | "pink";
}) {
  return (
    <GlowCard
      title={name}
      description={subject}
      icon="👨‍🏫"
      badge={`${rating}⭐`}
      glowColor={glowColor}
    >
      <div className="space-y-2 text-xs text-ivory-300/70">
        <div className="flex items-center gap-2">
          <span className="text-gold-400">👥</span>
          <span>{students} students</span>
        </div>
      </div>
    </GlowCard>
  );
}

export function FeatureCard({
  title,
  description,
  icon,
  glowColor = "blue"
}: {
  title: string;
  description: string;
  icon: string;
  glowColor?: "gold" | "blue" | "pink";
}) {
  return (
    <GlowCard
      title={title}
      description={description}
      icon={icon}
      glowColor={glowColor}
      animated={true}
    />
  );
}
