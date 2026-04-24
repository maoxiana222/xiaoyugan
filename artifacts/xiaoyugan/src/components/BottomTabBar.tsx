import { Link, useLocation } from "wouter";
import { Home, MessageCircleHeart, BookOpen, User } from "lucide-react";

const TABS = [
  { path: "/", label: "主页", icon: Home },
  { path: "/tree-hole", label: "树洞", icon: MessageCircleHeart },
  { path: "/report", label: "日报", icon: BookOpen },
  { path: "/profile", label: "我的", icon: User },
] as const;

export function BottomTabBar() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 inset-x-0 mx-auto max-w-[480px] border-t border-[#E8DDD2] bg-[#FCFCF9]/95 backdrop-blur-md z-40">
      <ul className="flex items-stretch justify-around">
        {TABS.map(({ path, label, icon: Icon }) => {
          const active = location === path;
          return (
            <li key={path} className="flex-1">
              <Link
                href={path}
                className={`flex flex-col items-center justify-center gap-0.5 py-2.5 transition-colors ${
                  active
                    ? "text-[#A86A6A]"
                    : "text-[#9B8F7F] hover:text-[#A86A6A]"
                }`}
              >
                <Icon
                  size={22}
                  strokeWidth={active ? 2.4 : 1.8}
                  className={active ? "scale-110 transition-transform" : ""}
                />
                <span className="text-[11px] tracking-wider">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
