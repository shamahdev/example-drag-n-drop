import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const Route = createFileRoute("/")({ component: App });

function App() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center px-4">
      <Card className="w-full max-w-lg bg-white">
        <CardHeader>
          <h2 className="font-bold text-2xl">Drag & Drop Game</h2>
          <p>This is a example of a drag & drop game using @dnd-kit/core.</p>
        </CardHeader>
        <CardContent className="flex h-full flex-col gap-8">
          <Button
            render={(props) => <Link {...props} to="/game" />}
            className="w-fit"
          >
            Start Game
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
