/**
 * Cover letter agent with a structured, high-precision prompt.
 */

import { RunnableConfig } from "@langchain/core/runnables";
import { SystemMessage } from "@langchain/core/messages";
import { MemorySaver, START, StateGraph } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import {
  CopilotKitStateAnnotation,
} from "@copilotkit/sdk-js/langgraph";
import { Annotation } from "@langchain/langgraph";

const AgentStateAnnotation = Annotation.Root({
  ...CopilotKitStateAnnotation.spec,
  companyName: Annotation<string | null>,
  roleTitle: Annotation<string | null>,
  jobSpec: Annotation<string | null>,
  relatedDocuments: Annotation<string | null>,
  uploadedFiles: Annotation<Array<{ name: string; content: string }>>,
});

export type CoverLetterAgentState = typeof AgentStateAnnotation.State;

function resolveModelConfig() {
  const baseURL =
    process.env.OPENAI_BASE_URL ?? process.env.LM_STUDIO_BASE_URL ?? undefined;
  const apiKey =
    process.env.OPENAI_API_KEY ?? process.env.LM_STUDIO_API_KEY ?? undefined;
  const model =
    process.env.OPENAI_MODEL ?? process.env.LLM_MODEL ?? "gpt-4o";

  const useLocalFallbackKey =
    !apiKey && !!baseURL && baseURL.includes("localhost");

  return {
    apiKey: apiKey ?? (useLocalFallbackKey ? "lm-studio" : undefined),
    baseURL,
    model,
  };
}

function formatCoverLetterContext(state: CoverLetterAgentState) {
  return JSON.stringify(
    {
      companyName: state.companyName ?? "",
      roleTitle: state.roleTitle ?? "",
      jobSpec: state.jobSpec ?? "",
      relatedDocuments: state.relatedDocuments ?? "",
      uploadedFiles: state.uploadedFiles ?? [],
    },
    null,
    2,
  );
}

export function buildCoverLetterSystemPrompt(state: CoverLetterAgentState) {
  return [
    "You are an expert Cover Letter Assistant. You must follow ALL requirements below.",
    "",
    "Information Gathering:",
    "- Ask targeted questions for any missing or ambiguous details: company name, role title, full job specification, related documents.",
    "- Confirm gathered details succinctly BEFORE generating cover letters.",
    "",
    "Cover Letter Requirements:",
    "- British English, formal, professional, concise.",
    "- Produce THREE versions, each <= 150 words.",
    "- Version A ~150 words, Version B ~125 words, Version C ~100 words.",
    "- Bold key phrases/keywords.",
    "- Structure:",
    "  1) First line: Dear [Company Name] Leadership Team",
    "  2) Paragraph 1 (Intro): <= 50 words, role + enthusiasm + company fit",
    "  3) Paragraph 2 (Fitness): <= 60 words, 2-3 strengths, leadership/collaboration/technical, cultural fit",
    "  4) Paragraph 3 (What I bring): <= 80 words, 2-3 projects/experiences, bold names/outcomes",
    "  5) Paragraph 4 (Closing): <= 30 words, forward-looking",
    "  6) Signature exactly:",
    "     Best regards,",
    "     Desmond O’Leary",
    "     desoleary@gmail.com | (403) 971-3401",
    "",
    "Best Practices:",
    "- Use metrics/outcomes where possible.",
    "- No time-based experience claims (avoid '10+ years').",
    "- Reflect job spec terminology.",
    "",
    "Output:",
    "- Respond ONLY as JSON (no markdown fences) in this exact shape:",
    "  {\"versions\":[{\"label\":\"Version A\",\"wordCount\":149,\"body\":\"...\"},{\"label\":\"Version B\",\"wordCount\":125,\"body\":\"...\"},{\"label\":\"Version C\",\"wordCount\":100,\"body\":\"...\"}]}",
    "- Use \\n for line breaks in body. Keep the required cover letter structure inside each body.",
    "- No commentary outside the JSON.",
    "",
    "Use this structured context (may be empty):",
    formatCoverLetterContext(state),
  ].join("\n");
}

async function chat_node(state: CoverLetterAgentState, config: RunnableConfig) {
  const { apiKey, baseURL, model } = resolveModelConfig();
  const modelClient = new ChatOpenAI({
    temperature: 0.2,
    model,
    apiKey,
    configuration: baseURL ? { baseURL } : undefined,
  });

  const systemMessage = new SystemMessage({
    content: buildCoverLetterSystemPrompt(state),
  });

  const response = await modelClient.invoke(
    [systemMessage, ...state.messages],
    config,
  );

  return { messages: response };
}

const workflow = new StateGraph(AgentStateAnnotation)
  .addNode("chat_node", chat_node)
  .addEdge(START, "chat_node")
  .addConditionalEdges("chat_node", () => "__end__");

const memory = new MemorySaver();

export const graph = workflow.compile({
  checkpointer: memory,
});
