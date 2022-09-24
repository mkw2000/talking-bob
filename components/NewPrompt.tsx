import { useEffect, useState } from "react";
import { PromptType } from "../types";
import { supabase } from "../utils/supabaseClient";

type Props = {
  refresh: any;
};

export function NewPrompt({ refresh }: Props) {
  const [input, setInput] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);

  async function createPrompt() {
    try {
      setLoading(true);
      const user = await getCurrentUser();

      const { data, error } = await supabase
        .from("prompts")
        .insert([{ user_id: user.id, input, answer }]);

      if (error) {
        throw error;
      }

      refresh();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function getCurrentUser() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      throw error;
    }

    if (!session?.user) {
      throw new Error("User not logged in");
    }

    return session.user;
  }

  return (
    <>
      new prompt
      <div>
        <label htmlFor="prompt">Input</label>
        <input
          id="input"
          type="text"
          defaultValue={input || ""}
          onChange={(e: any) => setInput(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="answer">Answer</label>
        <input
          id="answer"
          type="answer"
          defaultValue={answer || ""}
          onChange={(e: any) => setAnswer(e.target.value)}
        />
      </div>
      <div
        className="buttons"
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexDirection: "column",
        }}
      >
        <button onClick={createPrompt}>create</button>
      </div>
    </>
  );
}
