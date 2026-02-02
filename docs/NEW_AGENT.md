# Creating a New Agent (LangGraph + CopilotKit)

This repo already includes a second agent (Cover Letter) in uncommitted changes. Use the same pattern below to add another agent cleanly.

## 1) Create the agent graph (apps/agent)

1. Create a new file: `apps/agent/src/<agentName>.ts`.
2. Define state with CopilotKit state + any custom fields:
   - `Annotation.Root({ ...CopilotKitStateAnnotation.spec, myField: Annotation<string | null>, ... })`
3. Implement your nodes and graph, then export a compiled graph:
   - `export const graph = workflow.compile({ checkpointer: memory })`
4. If you add new dependencies, update `apps/agent/package.json`.
5. (Recommended) Add tests in `apps/agent/src/__tests__/` similar to
   `apps/agent/src/__tests__/coverLetterAgent.test.ts`.

## 2) Register the graph with LangGraph (apps/agent/langgraph.json)

Add your graph ID so the runtime can load it:

```json
{
  "graphs": {
    "starterAgent": "./src/agent.ts:graph",
    "coverLetterAgent": "./src/coverLetterAgent.ts:graph",
    "myNewAgent": "./src/myNewAgent.ts:graph"
  }
}
```

The key (`myNewAgent`) is the `graphId` you will use in the runtime.

## 3) Register the agent in the runtime (apps/web)

Add a `LangGraphAgent` to the Copilot runtime in
`apps/web/src/app/api/copilotkit/route.ts`:

```ts
agents: {
  starterAgent: new LangGraphAgent({ graphId: "starterAgent", ... }),
  coverLetterAgent: new LangGraphAgent({ graphId: "coverLetterAgent", ... }),
  myNewAgent: new LangGraphAgent({ graphId: "myNewAgent", ... }),
}
```

The `graphId` must match the key you added in `langgraph.json`.

## 4) Add a UI entry and view (apps/web)

1. Create a view component in `apps/web/src/app/components/`
   (for example, `MyNewAgentView.tsx`).
2. Wire it into the agent switcher in
   `apps/web/src/app/page.tsx`:
   - Add to the `AgentOption` union.
   - Add to `agentLabels`.
   - Add to the view switch in the page body.
3. If you need custom backend endpoints (e.g. file parsing),
   create a route under `apps/web/src/app/api/`.

## 5) If you use RJSF + Ant Design forms

When using `@rjsf/antd`, always provide the validator to avoid runtime errors:

```ts
import { withTheme } from "@rjsf/core";
import { Theme as AntdTheme } from "@rjsf/antd";
import validator from "@rjsf/validator-ajv8";

const Form = withTheme(AntdTheme);

<Form schema={schema} uiSchema={uiSchema} formData={formData} validator={validator} />
```

Ant Design’s theme styles already include form styling; no custom CSS is required.

## 6) Update tests (recommended)

- Update the page test to include the new agent switch:
  `apps/web/src/app/__tests__/page.test.tsx`
- Add agent prompt or logic tests in `apps/agent/src/__tests__/`.

## 7) Run and verify

```bash
pnpm dev
```

Confirm:
- The dropdown shows the new agent.
- Switching agents renders the correct view.
- The runtime connects to the correct `graphId`.
