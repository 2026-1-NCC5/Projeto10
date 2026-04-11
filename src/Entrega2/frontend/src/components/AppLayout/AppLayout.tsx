import { Outlet } from "react-router-dom";

import BackgroundGlow from "../BackgroundGlow/BackgroundGlow";
import Sidebar from "../Sidebar/Sidebar";
import { LayoutRoot, MainContent } from "./styles";


function AppLayout() {
  return (
    <LayoutRoot>
      <BackgroundGlow />
      <Sidebar />
      <MainContent>
        <Outlet />
      </MainContent>
    </LayoutRoot>
  );
}

export default AppLayout;
