"use client";

import { useCoAgent, useCopilotChatInternal } from "@copilotkit/react-core";
import { useCallback, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { jsPDF } from "jspdf";
import { withTheme } from "@rjsf/core";
import { Theme as AntdTheme } from "@rjsf/antd";
import type { RJSFSchema, UiSchema } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import { Button, Upload } from "antd";
import type { UploadProps } from "antd";
import { CopyOutlined, FilePdfOutlined, FileWordOutlined } from "@ant-design/icons";

const Form = withTheme(AntdTheme);

// Reference: https://github.com/CopilotKit/CopilotKit
type UploadedFile = {
  name: string;
  content: string;
  type: string;
  size: number;
};

type CoverLetterState = {
  companyName: string;
  roleTitle: string;
  jobSpec: string;
  relatedDocuments: string;
  uploadedFiles: UploadedFile[];
};

const emptyState: CoverLetterState = {
  companyName: "",
  roleTitle: "",
  jobSpec: "",
  relatedDocuments: "",
  uploadedFiles: [],
};

const allowedTypes = new Set([
  "text/plain",
  "application/pdf",
]);

const allowedExtensions = [".txt", ".pdf"];

export function CoverLetterView() {
  const { state, setState } = useCoAgent<CoverLetterState>({
    name: "coverLetterAgent",
    initialState: emptyState,
  });
  const { sendMessage, isLoading, messages, agent, threadId } = useCopilotChatInternal();

  const formState = useMemo(() => ({ ...emptyState, ...(state || {}) }), [state]);
  const formData = useMemo(
    () => ({
      companyName: formState.companyName,
      roleTitle: formState.roleTitle,
      jobSpec: formState.jobSpec,
      relatedDocuments: formState.relatedDocuments,
    }),
    [
      formState.companyName,
      formState.roleTitle,
      formState.jobSpec,
      formState.relatedDocuments,
    ],
  );

  const handleFiles = useCallback(
    async (files: FileList | File[] | null | undefined) => {
      if (!files || files.length === 0) {
        return;
      }

      const parsedFiles = await Promise.all(
        Array.from(files).map(async (file) => {
          const dotIndex = file.name.lastIndexOf(".");
          const extension = dotIndex >= 0 ? file.name.slice(dotIndex).toLowerCase() : "";
          const isAllowedType = allowedTypes.has(file.type);
          const isAllowedExtension = allowedExtensions.includes(extension);

          if (!isAllowedType && !isAllowedExtension) {
            return {
              name: file.name,
              content: "[Unsupported file type. Please upload .txt or .pdf files only.]",
              type: file.type,
              size: file.size,
            };
          }

          if (extension === ".pdf" || file.type === "application/pdf") {
            try {
              const response = await fetch("/api/parse-pdf", {
                method: "POST",
                body: await file.arrayBuffer(),
              });
              if (!response.ok) {
                return {
                  name: file.name,
                  content: "[Unable to parse PDF.]",
                  type: file.type,
                  size: file.size,
                };
              }
              const json = await response.json();
              return {
                name: file.name,
                content: json.text || "[PDF parsed with no text output.]",
                type: file.type,
                size: file.size,
              };
            } catch (error) {
              return {
                name: file.name,
                content: "[Unable to parse PDF.]",
                type: file.type,
                size: file.size,
              };
            }
          }

          try {
            const content = await file.text();
            return { name: file.name, content, type: file.type, size: file.size };
          } catch (error) {
            return {
              name: file.name,
              content: "[Unable to read file as text.]",
              type: file.type,
              size: file.size,
            };
          }
        }),
      );

      setState((prev) => ({
        ...prev,
        uploadedFiles: [...(prev?.uploadedFiles || []), ...parsedFiles],
      }));
    },
    [setState],
  );

  const removeFile = useCallback(
    (name: string) => {
      setState((prev) => ({
        ...prev,
        uploadedFiles: (prev?.uploadedFiles || []).filter((file) => file.name !== name),
      }));
    },
    [setState],
  );

  const resetContext = useCallback(() => {
    setState(emptyState);
  }, [setState]);

  const handleGenerate = useCallback(async () => {
    await sendMessage({
      id: globalThis.crypto?.randomUUID?.() ?? `msg-${Date.now()}`,
      role: "user",
      content: "Generate cover letters now.",
    });
  }, [sendMessage]);

  const canGenerate = Boolean(
    formState.companyName.trim() &&
      formState.roleTitle.trim() &&
      formState.jobSpec.trim(),
  );

  const schema: RJSFSchema = useMemo(
    () => ({
      type: "object",
      required: ["companyName", "roleTitle", "jobSpec"],
      properties: {
        companyName: {
          type: "string",
          title: "Company name",
        },
        roleTitle: {
          type: "string",
          title: "Role title",
        },
        jobSpec: {
          type: "string",
          title: "Full job specification",
        },
        relatedDocuments: {
          type: "string",
          title: "Related documents or links",
        },
      },
    }),
    [],
  );

  const uiSchema: UiSchema = useMemo(
    () => ({
      jobSpec: {
        "ui:widget": "textarea",
        "ui:options": { rows: 6 },
      },
      relatedDocuments: {
        "ui:widget": "textarea",
        "ui:options": { rows: 4 },
      },
    }),
    [],
  );

  const latestAssistantMessage = useMemo(() => {
    if (!messages?.length) {
      return "";
    }
    const last = [...messages].reverse().find((msg: any) => msg?.role === "assistant");
    if (!last) {
      return "";
    }
    if (typeof last.content === "string") {
      return last.content;
    }
    return JSON.stringify(last.content ?? "", null, 2);
  }, [messages]);

  const versions = useMemo(() => {
    if (!latestAssistantMessage) {
      return [];
    }

    try {
      const parsed = JSON.parse(latestAssistantMessage);
      if (parsed?.versions?.length) {
        return parsed.versions.map((version: any, index: number) => ({
          id: `version-${index}`,
          title: `${version.label} – ${version.wordCount} words`,
          body: version.body ?? "",
        }));
      }
    } catch (error) {
      // fall through to text parsing
    }

    const sections = latestAssistantMessage
      .split(/(?=Version\s+[ABC]\s*[–-]\s*\d+\s*words)/i)
      .map((section) => section.trim())
      .filter(Boolean);

    if (sections.length === 0) {
      return [];
    }
    return sections.map((section, index) => ({
      id: `version-${index}`,
      title: section.split("\n")[0] || `Version ${String.fromCharCode(65 + index)}`,
      body: section,
    }));
  }, [latestAssistantMessage]);

  const handleCopy = useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text);
  }, []);

  const handleDownloadPdf = useCallback(() => {
    if (!versions.length) {
      return;
    }
    const doc = new jsPDF();
    const margin = 12;
    const maxWidth = 180;
    let cursorY = 14;
    versions.forEach((version, index) => {
      const lines = doc.splitTextToSize(version.body, maxWidth);
      doc.text(lines, margin, cursorY);
      cursorY += lines.length * 6 + 8;
      if (index < versions.length - 1 && cursorY > 260) {
        doc.addPage();
        cursorY = 14;
      }
    });
    doc.save("cover-letters.pdf");
  }, [versions]);

  const handleDownloadDocx = useCallback(async () => {
    if (!versions.length) {
      return;
    }
    const sections = versions.map((version) => ({
      children: [
        new Paragraph({
          children: [new TextRun({ text: version.title, bold: true })],
        }),
        ...version.body.split("\n").map((line) =>
          new Paragraph({
            children: [new TextRun({ text: line })],
          }),
        ),
      ],
    }));
    const doc = new Document({ sections });
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "cover-letters.docx";
    link.click();
    URL.revokeObjectURL(url);
  }, [versions]);

  const uploadProps: UploadProps = useMemo(
    () => ({
      multiple: true,
      accept: ".txt,.pdf,text/plain,application/pdf",
      showUploadList: false,
      customRequest: ({ file, onSuccess, onError }) => {
        if (!file) {
          onError?.(new Error("No file selected."));
          return;
        }
        handleFiles([file as File])
          .then(() => onSuccess?.("ok"))
          .catch((error) => onError?.(error as Error));
      },
    }),
    [handleFiles],
  );

  return (
    <section className="section-stack">
      <div className="card">
        <div className="card-header">
          <div>
            <h1 className="card-title">Create Cover Letter</h1>
            <p className="card-subtitle">
              Provide role details and upload supporting documents to guide the cover letter agent.
            </p>
          </div>
          <Button onClick={resetContext}>Reset</Button>
        </div>
      </div>

      <div className="section-stack">
        <div className="card">
          <Form
            schema={schema}
            uiSchema={uiSchema}
            formData={formData}
            validator={validator}
            onChange={(event) => {
              const data = event.formData as Partial<CoverLetterState>;
              setState((prev) => ({
                ...prev,
                companyName: data.companyName ?? "",
                roleTitle: data.roleTitle ?? "",
                jobSpec: data.jobSpec ?? "",
                relatedDocuments: data.relatedDocuments ?? "",
              }));
            }}
            noHtml5Validate
            showErrorList={false}
          >
            <div />
          </Form>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Supporting files</h2>
              <p className="small-muted">
                Upload text files, resumes, or project notes. Files are stored as text in the agent context.
              </p>
            </div>
          </div>

          <div>
            <label className="sr-only" htmlFor="supportingFiles">
              Supporting files
            </label>
            <Upload {...uploadProps}>
              <Button id="supportingFiles" type="default">
                Choose files
              </Button>
            </Upload>
          </div>

          <div className="file-list">
            {(formState.uploadedFiles || []).length === 0 && (
              <p className="small-muted">No files uploaded yet.</p>
            )}
            {formState.uploadedFiles.map((file) => (
              <div
                key={file.name}
                className="file-row"
              >
                <span>{file.name}</span>
                <button
                  type="button"
                  className="file-remove"
                  onClick={() => removeFile(file.name)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div className="action-row">
            <Button
              type="primary"
              onClick={handleGenerate}
              disabled={isLoading || !canGenerate}
            >
              Generate cover letters now
            </Button>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Generated output</h2>
              <p className="small-muted">
                Output appears here after the agent responds. Each version renders as a markdown-highlighted code block.
              </p>
            </div>
            <div />
          </div>

          {isLoading && (
            <div className="loader-card">
              <div className="loader-row">
                <span className="loader-dot" />
                <span>Generating…</span>
              </div>
              <div className="small-muted">
                {threadId ? `Thread: ${threadId}` : "Waiting for agent response."}
              </div>
              {agent?.isRunning ? (
                <div className="small-muted">Status: running</div>
              ) : null}
            </div>
          )}

          {!isLoading && versions.length < 3 ? (
            <p className="small-muted">
              No complete cover letter set yet. Generate to see Version A, B, and C.
            </p>
          ) : null}

          {!isLoading && versions.length >= 3 ? (
            <div className="output-grid">
              {versions.map((version) => {
                const markdown = `\`\`\`markdown\n${version.body}\n\`\`\``;
                return (
                  <div key={version.id} className="output-card">
                    <div className="output-header">
                      <h3 className="output-title">{version.title}</h3>
                      <Button size="small" icon={<CopyOutlined />} onClick={() => handleCopy(version.body)}>
                        Copy
                      </Button>
                    </div>
                    <div className="markdown-output">
                      <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                        {markdown}
                      </ReactMarkdown>
                    </div>
                    <div className="output-actions">
                      <Button size="small" icon={<FilePdfOutlined />} onClick={handleDownloadPdf}>
                        Download PDF
                      </Button>
                      <Button size="small" icon={<FileWordOutlined />} onClick={handleDownloadDocx}>
                        Download Word
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
