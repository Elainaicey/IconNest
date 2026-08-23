"use client";

import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { AmbientParticles } from "@/components/ui/ambient-particles";
import { CollectionDialog } from "./collection-dialog";
import { CollectionManagerDialog } from "./collection-manager-dialog";
import { CommandMenu } from "./command-menu";
import { DetailDrawer } from "./detail-drawer";
import { LibraryProvider, useLibrary } from "./library-provider";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export function WorkspaceShell({ children }: { children: ReactNode }) {
  return (
    <LibraryProvider>
      <WorkspaceFrame>{children}</WorkspaceFrame>
    </LibraryProvider>
  );
}

function WorkspaceFrame({ children }: { children: ReactNode }) {
  const {
    mobileMenuOpen,
    setMobileMenuOpen,
    handleUpload,
    handleBackupImport,
    uploadInputRef,
    backupInputRef,
    toast,
    sidebarCollapsed,
  } = useLibrary();
  const toastIsError = /失败|异常|错误|无效|无法/.test(toast);

  return (
    <div className={`app-shell ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <a className="skip-link" href="#workspace-main">跳到主要内容</a>
      <div className="workspace-atmosphere" aria-hidden="true">
        <AmbientParticles />
        <span className="atmosphere-orb atmosphere-orb-iris" />
        <span className="atmosphere-orb atmosphere-orb-sky" />
        <span className="atmosphere-orb atmosphere-orb-rose" />
        <span className="atmosphere-grain" />
      </div>
      <button
        className={`mobile-overlay ${mobileMenuOpen ? "visible" : ""}`}
        onClick={() => setMobileMenuOpen(false)}
        aria-label="关闭导航"
        aria-hidden={!mobileMenuOpen}
        tabIndex={mobileMenuOpen ? 0 : -1}
      />
      <Sidebar />
      <div className="content-shell">
        <Topbar />
        <main className="main-content" id="workspace-main" tabIndex={-1}>{children}</main>
      </div>
      <DetailDrawer />
      <CollectionDialog />
      <CollectionManagerDialog />
      <CommandMenu />
      <input
        ref={uploadInputRef}
        className="visually-hidden"
        type="file"
        accept=".svg,image/svg+xml"
        multiple
        onChange={handleUpload}
      />
      <input
        ref={backupInputRef}
        className="visually-hidden"
        type="file"
        accept=".json,application/json"
        onChange={handleBackupImport}
      />
      <div
        className={`toast ${toast ? "visible" : ""} ${toastIsError ? "error" : ""}`}
        role={toastIsError ? "alert" : "status"}
        aria-live={toastIsError ? "assertive" : "polite"}
      >
        {toastIsError ? <AlertCircle size={17} /> : <CheckCircle2 size={17} />}
        {toast}
      </div>
    </div>
  );
}
