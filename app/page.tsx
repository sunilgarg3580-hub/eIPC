"use client";

import React, { useEffect, useState } from "react";
import { CLIENT_TABS, ADVOCATE_TABS } from "@/lib/content";
import type { Role, LoginMode } from "@/lib/types";
import { Header } from "@/components/common/Header";
import { PortalLayout } from "@/components/common/PortalLayout";
import { LoginModal } from "@/components/auth/LoginModal";
import { GuestHome } from "@/components/guest/GuestHome";
import { ClientDashboard } from "@/components/client/ClientDashboard";
import { ClientChat } from "@/components/client/ClientChat";
import { ClientCases } from "@/components/client/ClientCases";
import { ClientDrafts } from "@/components/client/ClientDrafts";
import { CourtTracker } from "@/components/client/CourtTracker";
import { FindAdvocate } from "@/components/client/FindAdvocate";
import { AdvocateDashboard } from "@/components/advocate/AdvocateDashboard";
import { AdvocateLeads } from "@/components/advocate/AdvocateLeads";
import { AdvocateMessages } from "@/components/advocate/AdvocateMessages";
import { ReviewQueue } from "@/components/advocate/ReviewQueue";
import { AdvocateCases } from "@/components/advocate/AdvocateCases";
import { AdvocateProfile } from "@/components/advocate/AdvocateProfile";
import { getCurrentUser } from "@/lib/session";
import { logoutUser } from "@/lib/authService";
import { ClientProfile } from "@/components/client/ClientProfile";
import { EvidenceVault } from "@/components/client/EvidenceVault";

export default function Page() {
  const [role, setRole] = useState<Role>("guest");
  const [loginMode, setLoginMode] = useState<LoginMode>("none");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [initializing, setInitializing] = useState(true);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    async function restoreSession() {
      try {
        const session = await getCurrentUser();

        if (session?.profile?.role === "client") {
          setRole("client");
        } else if (session?.profile?.role === "advocate") {
          setRole("advocate");
        } else {
          setRole("guest");
        }

        setUserName(session?.profile?.full_name || "");
      } catch (err) {
        console.error("SESSION_RESTORE_ERROR:", err);
        setRole("guest");
        setUserName("");
      } finally {
        setInitializing(false);
      }
    }

    restoreSession();
  }, []);

  async function completeLogin(selectedRole: Role) {
    const session = await getCurrentUser();
    setUserName(session?.profile?.full_name || "");

    setRole(selectedRole);
    setLoginMode("none");
    setActiveTab("dashboard");
  }

  function safeSetActiveTab(tab: string) {
    if (role === "guest") {
      setActiveTab("dashboard");
      return;
    }

    const clientAllowedTabs = [
      "dashboard",
      "profile",
      "chat",
      "cases",
      "evidence",
      "drafts",
      "tracker",
      "lawyers",
    ];

    const advocateAllowedTabs = [
      "dashboard",
      "profile",
      "leads",
      "messages",
      "reviews",
      "cases",
    ];

    if (role === "client" && !clientAllowedTabs.includes(tab)) {
      setActiveTab("dashboard");
      return;
    }

    if (role === "advocate" && !advocateAllowedTabs.includes(tab)) {
      setActiveTab("dashboard");
      return;
    }

    setActiveTab(tab);
  }

  async function handleLogout() {
    try {
      await logoutUser();
    } catch (err) {
      console.error("LOGOUT_ERROR:", err);
    } finally {
      setRole("guest");
      setLoginMode("none");
      setActiveTab("dashboard");
      setUserName("");
    }
  }

  if (initializing) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="rounded-3xl bg-white px-8 py-6 shadow-xl">
          <div className="text-lg font-semibold">Loading eIPC...</div>
          <div className="mt-1 text-sm text-slate-500">
            Checking your session
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <Header
        role={role}
        userName={userName}
        setLoginMode={setLoginMode}
        setActiveTab={safeSetActiveTab}
        onLogout={handleLogout}
      />

      {loginMode !== "none" && (
        <LoginModal
          mode={loginMode}
          onClose={() => setLoginMode("none")}
          onLogin={(loggedInRole) => completeLogin(loggedInRole)}
        />
      )}

      {role === "guest" && (
        <GuestHome
          openClientLogin={() => setLoginMode("client")}
          openAdvocateLogin={() => setLoginMode("advocate")}
        />
      )}

      {role === "client" && (
        <PortalLayout
          tabs={CLIENT_TABS}
          activeTab={activeTab}
          setActiveTab={safeSetActiveTab}
        >
          {activeTab === "dashboard" && <ClientDashboard />}
          {activeTab === "profile" && <ClientProfile />}
          {activeTab === "chat" && <ClientChat />}
          {activeTab === "cases" && <ClientCases />}
          {activeTab === "evidence" && <EvidenceVault />}
          {activeTab === "drafts" && <ClientDrafts />}
          {activeTab === "tracker" && <CourtTracker />}
          {activeTab === "lawyers" && <FindAdvocate />}
        </PortalLayout>
      )}

      {role === "advocate" && (
        <PortalLayout
          tabs={ADVOCATE_TABS}
          activeTab={activeTab}
          setActiveTab={safeSetActiveTab}
        >
          {activeTab === "dashboard" && <AdvocateDashboard />}
          {activeTab === "leads" && <AdvocateLeads />}
          {activeTab === "messages" && <AdvocateMessages />}
          {activeTab === "reviews" && <ReviewQueue />}
          {activeTab === "cases" && <AdvocateCases />}
          {activeTab === "profile" && <AdvocateProfile />}
        </PortalLayout>
      )}
    </main>
  );
}