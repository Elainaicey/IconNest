"use client";

import type { ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";
import { CollectionDialog } from "./collection-dialog";
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
  } = useLibrary();

  return (
    <div className="app-shell">
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
        <main className="main-content">{children}</main>
      </div>
      <DetailDrawer />
      <CollectionDialog />
      <input
        ref={uploadInputRef}
        className="visually-hidden"
        type="file"
        accept=".svg,image/svg+xml"
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
        className={`toast ${toast ? "visible" : ""}`}
        role="status"
        aria-live="polite"
      >
        <CheckCircle2 size={17} />
        {toast}
      </div>
    </div>
  );
}
