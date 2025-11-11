import React, { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

const API_URL = "http://localhost:8000/api/ai";

function App() {
  const [loading, setLoading] = useState(false);
  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p>Highlight text and use AI tools…</p>",
  });

  const getSelectedText = () => {
    const { state } = editor;
    const { from, to } = state.selection;
    if (from === to) return null;
    return state.doc.textBetween(from, to, " ");
  };

  const callAI = async (action) => {
    const text = getSelectedText();
    if (!text) {
      alert("Please select text first.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, text }),
      });
      const data = await res.json();
      if (data.result) {
        editor.chain().focus().insertContent(data.result).run();
      } else {
        alert("No result from AI");
      }
    } catch (err) {
      console.error(err);
      alert("Error calling backend");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Tiptap + Gemini AI (FastAPI)</h1>
      <div style={{ marginBottom: 10 }}>
        <button onClick={() => callAI("rewrite")} disabled={loading}>
          Rewrite
        </button>
        <button onClick={() => callAI("summarize")} disabled={loading}>
          Summarize
        </button>
        <button onClick={() => callAI("grammar")} disabled={loading}>
          Fix Grammar
        </button>
        {loading && <span style={{ marginLeft: 10 }}>Processing...</span>}
      </div>

      <div style={{ border: "1px solid #ccc", minHeight: 200, padding: 10 }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

export default App;
