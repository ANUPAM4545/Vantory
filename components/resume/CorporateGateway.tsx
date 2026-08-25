"use client";

import React, { useState } from "react";
import { Send, Building2, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export function CorporateGateway() {
  const [selectedCompany, setSelectedCompany] = useState("acme");
  const [isSending, setIsSending] = useState(false);
  const [sentStatus, setSentStatus] = useState<string | null>(null);

  const companies = [
    { value: "acme", label: "Acme Corp — Software Engineer (Bengaluru)" },
    { value: "techlabs", label: "TechLabs Inc — Full Stack Developer (Remote)" },
    { value: "cloudstore", label: "CloudStoreX — Backend Developer (Delhi NCR)" },
    { value: "fintech", label: "Fintech Global — AI/ML Engineer (Hyderabad)" },
  ];

  const handleSend = () => {
    setIsSending(true);
    setSentStatus(null);

    setTimeout(() => {
      setIsSending(false);
      const companyLabel = companies.find((c) => c.value === selectedCompany)?.label || "Selected Company";
      setSentStatus(`Resume successfully dispatched to ${companyLabel.split("—")[0].trim()} HR Inbox!`);
    }, 1200);
  };

  return (
    <div className="bg-[#09090B] text-white border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <Badge variant="dark" className="bg-neutral-900 border-neutral-800 text-white mb-2">
            <Building2 className="w-3 h-3 text-white" />
            DIRECT CORPORATE GATEWAY
          </Badge>
          <h3 className="text-lg font-extrabold text-white tracking-tight">
            Apply & Send Verified Resume to Registered Companies
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Finished updating your resume? Select a target company to dispatch your Vantory resume directly to their recruiter inbox.
          </p>
        </div>
      </div>

      {sentStatus && (
        <div className="bg-neutral-900 border border-neutral-700 text-white p-3.5 rounded-xl text-xs flex items-center gap-2.5 font-medium animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
          <span>{sentStatus}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-end gap-3 pt-1">
        <div className="flex-1 w-full">
          <Select
            label="Target Company / Opening"
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            options={companies}
            className="bg-neutral-900 border-neutral-800 text-white text-xs h-10"
          />
        </div>

        <Button
          variant="primary"
          size="md"
          isLoading={isSending}
          onClick={handleSend}
          className="bg-white text-black hover:bg-neutral-200 border-white text-xs font-bold w-full sm:w-auto h-10 shrink-0"
          rightIcon={<Send className="w-3.5 h-3.5" />}
        >
          Send Resume
        </Button>
      </div>

      <div className="text-[11px] font-mono text-neutral-500 flex items-center gap-1.5 pt-1">
        <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
        <span>Verified candidate dispatch system • Direct HR Integration</span>
      </div>
    </div>
  );
}
