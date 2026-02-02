"use client";

import { CopilotKit, useCopilotAction } from "@copilotkit/react-core";
import { CopilotKitCSSProperties, CopilotSidebar } from "@copilotkit/react-ui";
import { Select } from "antd";
import { useMemo, useState } from "react";

import { CoverLetterView } from "./components/CoverLetterView";
import { StarterAgentView } from "./components/StarterAgentView";

type AgentOption = "starterAgent" | "coverLetterAgent";

const agentLabels: Record<AgentOption, string> = {
  starterAgent: "Starter Agent",
  coverLetterAgent: "Create Cover Letter",
};

export default function CopilotKitPage() {
  const [activeAgent, setActiveAgent] = useState<AgentOption>("starterAgent");

  return (
    <CopilotKit runtimeUrl="/api/copilotkit" agent={activeAgent}>
      <CopilotWorkspace
        activeAgent={activeAgent}
        onAgentChange={setActiveAgent}
      />
    </CopilotKit>
  );
}

function CopilotWorkspace({
  activeAgent,
  onAgentChange,
}: {
  activeAgent: AgentOption;
  onAgentChange: (agent: AgentOption) => void;
}) {
  const [themeColor, setThemeColor] = useState("#6366f1");
  const agentOptions = useMemo(
    () =>
      Object.entries(agentLabels).map(([value, label]) => ({
        value,
        label,
      })),
    [],
  );

  useCopilotAction({
    name: "setThemeColor",
    description: "Set the theme color of the page.",
    parameters: [{
      name: "themeColor",
      description: "The theme color to set. Make sure to pick nice colors.",
      required: true,
    }],
    handler({ themeColor }) {
      setThemeColor(themeColor);
    },
  });

  const sidebarLabels = useMemo(() => {
    if (activeAgent === "coverLetterAgent") {
      return {
        title: "Cover Letter Assistant",
        initial:
          "Hi! I can craft tailored cover letters. Start by pasting the job spec and telling me the company and role.",
      };
    }
    return {
      title: "Popup Assistant",
      initial:
        "👋 Hi, there! You're chatting with an agent. This agent comes with a few tools to get you started.\n\nFor example you can try:\n- **Frontend Tools**: \"Set the theme to orange\"\n- **Shared State**: \"Write a proverb about AI\"\n- **Generative UI**: \"Get the weather in SF\"\n\nAs you interact with the agent, you'll see the UI update in real-time to reflect the agent's **state**, **tool calls**, and **progress**.",
    };
  }, [activeAgent]);

  return (
    <main
      style={{ "--copilot-kit-primary-color": themeColor } as CopilotKitCSSProperties}
      className="app-shell"
    >
      <header className="app-header">
        <div className="app-header-inner">
          <div className="app-toolbar">
            <span className="app-brand">
              <span className="app-logo">
                <svg viewBox="0 0 24 24" aria-hidden className="app-logo-icon">
                  <path
                    fill="currentColor"
                    d="M4 6.5C4 5.12 5.12 4 6.5 4h7c1.38 0 2.5 1.12 2.5 2.5v3.1l2.2 2.2a1 1 0 0 1 0 1.4l-2.2 2.2V17.5c0 1.38-1.12 2.5-2.5 2.5h-7C5.12 20 4 18.88 4 17.5zm2.5-.5a.5.5 0 0 0-.5.5v11a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5v-11a.5.5 0 0 0-.5-.5zM9 8h2v2H9zm0 4h2v2H9z"
                  />
                </svg>
              </span>
              <span className="app-title">CopilotKit</span>
            </span>
            <div className="app-toolbar">
              <label className="app-label" htmlFor="agent-select">
                Agent / Task
              </label>
              <Select
                id="agent-select"
                value={activeAgent}
                options={agentOptions}
                style={{ width: 220 }}
                onChange={(value) => onAgentChange(value as AgentOption)}
              />
            </div>
          </div>
          <div className="app-header-tagline">OmniTech Custom Agents</div>
        </div>
      </header>

      <div className="app-content">
        {activeAgent === "coverLetterAgent" ? (
          <CoverLetterView />
        ) : (
          <StarterAgentView themeColor={themeColor} />
        )}
      </div>

      <CopilotSidebar
        clickOutsideToClose={false}
        defaultOpen={true}
        labels={sidebarLabels}
      />
    </main>
  );
}
