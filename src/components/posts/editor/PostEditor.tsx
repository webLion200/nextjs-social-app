"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import { EditorContent, useEditor } from "@tiptap/react";
import Placeholder from "@tiptap/extension-placeholder";
import UserAvatar from "@/components/UserAvatar";
import StarterKit from "@tiptap/starter-kit";
import { Button } from "@/components/ui/button";
import { submitPost } from "./actions";
import "./styles.css";

export default function PostEditor() {
  const { user } = useSession();
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bold: false,
        italic: false,
      }),
      Placeholder.configure({
        placeholder: "Write something …",
      }),
    ],
    immediatelyRender: false,
  });

  const input =
    editor?.getText({
      blockSeparator: "\n",
    }) || "";

  async function onSubmit() {
    if (!input) {
      return;
    }
    await submitPost(input);
    editor?.commands.clearContent();
  }

  return (
    <div className="p-3">
      <div className="flex gap-5">
        <UserAvatar avatarUrl={user.avatarUrl} className="hidden sm:inline" />
        <EditorContent
          editor={editor}
          className="pa-5 max-h-[20rem] w-full overflow-y-auto rounded-2xl py-3"
        />
      </div>
      <div className="flex justify-end">
        <Button
          onClick={onSubmit}
          className="rounded-sm bg-green-500 text-white hover:bg-green-400"
        >
          Post
        </Button>
      </div>
    </div>
  );
}
