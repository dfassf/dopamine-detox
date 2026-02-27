import { Outlet } from "react-router";
import TabBar from "./TabBar";

export default function Layout() {
  return (
    <div className="screen screen--gray">
      <div className="screen-content">
        <Outlet />
      </div>
      <TabBar />
    </div>
  );
}
