import PostEditor from "@/components/components/posts/editor/PostEditor";

export default function Home() {
  return (
    <main className="h-[200vh] w-full bg-red-50">
      <div className="w-full text-red-600">
        <PostEditor />
      </div>
    </main>
  );
}
