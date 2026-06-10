"use client";

import dynamic from "next/dynamic";
import React from "react";

const ProfileChart = dynamic(() => import("./profile-chart").then((mod) => mod.ProfileChart), { ssr: false });

export function ProfileChartClient(props: { data: Array<{ name: string; score: number; batch: number }> }) {
  return <ProfileChart {...props} />;
}
