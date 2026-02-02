"use client";

import { useCoAgent, useCopilotAction } from "@copilotkit/react-core";

import { WeatherCard } from "./WeatherCard";

// State of the agent, make sure this aligns with your agent's state.
type AgentState = {
  proverbs: string[];
};

export function StarterAgentView({ themeColor }: { themeColor: string }) {
  const { state, setState } = useCoAgent<AgentState>({
    name: "starterAgent",
    initialState: {
      proverbs: [
        "CopilotKit may be new, but its the best thing since sliced bread.",
      ],
    },
  });

  useCopilotAction({
    name: "addProverb",
    description: "Add a proverb to the list.",
    parameters: [{
      name: "proverb",
      description: "The proverb to add. Make it witty, short and concise.",
      required: true,
    }],
    handler: ({ proverb }) => {
      setState((prevState) => ({
        ...prevState,
        proverbs: [...(prevState?.proverbs || []), proverb],
      }));
    },
  }, [setState]);

  useCopilotAction({
    name: "getWeather",
    description: "Get the weather for a given location.",
    available: "disabled",
    parameters: [
      { name: "location", type: "string", required: true },
    ],
    render: ({ args }) => {
      return <WeatherCard location={args.location} themeColor={themeColor} />;
    },
  });

  return (
    <div
      style={{ backgroundColor: themeColor }}
      className="starter-shell"
    >
      <div className="starter-card">
        <h1 className="starter-title">Proverbs</h1>
        <p className="starter-subtitle">
          This is a demonstrative page, but it could be anything you want! 🪁
        </p>
        <hr className="starter-divider" />
        <div className="starter-list">
          {state.proverbs?.map((proverb, index) => (
            <div
              key={index}
              className="starter-item"
            >
              <p>{proverb}</p>
              <button
                onClick={() => setState({
                  ...state,
                  proverbs: state.proverbs?.filter((_, i) => i !== index),
                })}
                className="starter-remove"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        {state.proverbs?.length === 0 && (
          <p className="starter-empty">
            No proverbs yet. Ask the assistant to add some!
          </p>
        )}
      </div>
    </div>
  );
}
