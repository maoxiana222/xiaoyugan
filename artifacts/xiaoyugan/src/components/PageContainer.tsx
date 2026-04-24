import type { ReactNode } from "react";
import { BottomTabBar } from "./BottomTabBar";

interface Props {
  children: ReactNode;
  withTabs?: boolean;
  className?: string;
}

export function PageContainer({ children, withTabs = true, className = "" }: Props) {
  return (
    <div className="min-h-screen w-full bg-[#F5F5F0] flex justify-center">
      <div className={`relative w-full max-w-[480px] min-h-screen ${withTabs ? "pb-20" : ""} ${className}`}>
        {children}
        {withTabs && <BottomTabBar />}
      </div>
    </div>
  );
}
