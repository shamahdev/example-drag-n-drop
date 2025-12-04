import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { createFileRoute, Link } from "@tanstack/react-router";
import { HeartIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Draggable } from "@/components/draggable-trash";
import { Droppable } from "@/components/droppable";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function computeResult({
  items,
  assignments,
  elapsedSeconds,
  lives,
}: {
  items: readonly { id: string; type: string }[];
  assignments: Record<string, string | null>;
  elapsedSeconds: number;
  lives: number;
}) {
  const totalCorrect = items.filter(
    (item) => assignments[item.id] === item.type,
  ).length;

  // Score focuses on correctness first, then time, then remaining lives.
  // - Up to 70 points from accuracy (all correct = 70)
  // - Up to 20 points from time (20 - elapsedSeconds, minimum 0)
  // - Up to 10 points from remaining lives (each life = +3.33)
  // - If there are 0 correct answers, the score is always 0
  let score = 0;
  if (totalCorrect > 0) {
    const accuracyScore = (totalCorrect / items.length) * 70;
    const timeScore = Math.max(0, 20 - elapsedSeconds);
    const livesScore = Math.min(lives, 3) * (10 / 3);
    score = Math.round(accuracyScore + timeScore + livesScore);
  }

  return {
    correct: totalCorrect,
    score,
  };
}

export const Route = createFileRoute("/game/")({
  component: RouteComponent,
});

function RouteComponent() {
  const containers = ["Organic", "Inorganic", "Hazardous"];
  const items = [
    { id: "banana-peel", label: "Banana Peel", type: "Organic" },
    { id: "plastic-bottle", label: "Plastic Bottle", type: "Inorganic" },
    { id: "glass-shard", label: "Glass Shard", type: "Inorganic" },
    { id: "battery", label: "Battery", type: "Hazardous" },
  ] as const;

  const [assignments, setAssignments] = useState<Record<string, string | null>>(
    () =>
      items.reduce(
        (acc, item) => {
          acc[item.id] = null;
          return acc;
        },
        {} as Record<string, string | null>,
      ),
  );

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState<{
    correct: number;
    score: number;
  } | null>(null);
  const [lives, setLives] = useState(3);
  const [isDamaged, setIsDamaged] = useState(false);
  const lastDamageTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (isSubmitted) return;

    const intervalId = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isSubmitted]);

  const unassignedItems = items.filter((item) => assignments[item.id] === null);

  const allPlaced = items.every((item) => assignments[item.id] !== null);

  useEffect(() => {
    if (isSubmitted || lives <= 0 || !allPlaced) return;

    const nextResult = computeResult({
      items,
      assignments,
      elapsedSeconds,
      lives,
    });

    setResult(nextResult);
    setIsSubmitted(true);
  }, [allPlaced, assignments, elapsedSeconds, isSubmitted, lives, items]);

  return (
    <main className="flex min-h-screen w-full items-center justify-center px-4">
      <Card
        className={`w-full max-w-lg bg-white ${isDamaged ? "damage-flash" : ""}`}
        onAnimationEnd={() => setIsDamaged(false)}
      >
        <CardHeader>
          <h2 className="font-bold text-2xl">Drag & Drop Game</h2>
          <p className="text-muted-foreground text-sm">
            Drag each trash item into the correct bin.
          </p>
        </CardHeader>
        <CardContent className="flex h-full flex-col gap-8">
          <div className="flex items-center justify-between text-muted-foreground text-sm">
            <span>
              Timer: <span className="font-semibold">{elapsedSeconds}s</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="mr-1 text-xs uppercase tracking-wide">
                Lives
              </span>
              {Array.from({ length: 3 }).map((_, index) => {
                const heartNumber = index + 1;
                const isActive = lives >= heartNumber;
                return (
                  <HeartIcon
                    key={heartNumber}
                    className={cn(
                      "h-4 w-4",
                      isActive
                        ? "fill-red-500 text-red-500"
                        : "fill-transparent text-muted-foreground",
                    )}
                    aria-hidden="true"
                  />
                );
              })}
            </span>
          </div>

          <DndContext onDragEnd={handleDragEnd}>
            <section className="flex flex-wrap gap-3 rounded-md border bg-muted/40 p-4">
              {unassignedItems.length > 0 ? (
                unassignedItems.map((item) => (
                  <Draggable key={item.id} id={item.id}>
                    <span className="inline-flex items-center rounded-md bg-primary px-3 py-1 font-medium text-primary-foreground text-sm shadow-sm">
                      {item.label}
                    </span>
                  </Draggable>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">
                  All items have been placed in a bin.
                </p>
              )}
            </section>

            {containers.map((id) => (
              <Droppable key={id} id={id}>
                <div className="rounded-sm bg-muted px-4 py-2">
                  <p className="font-medium text-muted-foreground text-sm">
                    {id}
                  </p>
                </div>
                <div className="w-full rounded-lg rounded-t-none border-2 border-t-0 border-dashed p-4">
                  <div className="flex min-h-[45px] w-full flex-wrap items-center justify-center gap-3 md:min-h-[100px]">
                    {items
                      .filter((item) => assignments[item.id] === id)
                      .map((item) => (
                        <Draggable key={item.id} id={item.id}>
                          <span className="inline-flex items-center rounded-md bg-card px-3 py-1 font-medium text-foreground text-sm shadow-sm">
                            {item.label}
                          </span>
                        </Draggable>
                      ))}
                    {items.every((item) => assignments[item.id] !== id) && (
                      <p className="text-muted-foreground text-sm">Drop here</p>
                    )}
                  </div>
                </div>
              </Droppable>
            ))}
          </DndContext>
        </CardContent>
      </Card>

      {isSubmitted && result ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-3">
          <div className="w-full max-w-sm rounded-xl bg-background p-6 shadow-xl">
            <h3 className="font-semibold text-lg">Great job!</h3>
            <p className="mt-1 text-muted-foreground text-sm">
              Here&apos;s how you did in this round.
            </p>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Time</span>
                <span className="font-semibold">{elapsedSeconds}s</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Correct</span>
                <span className="font-semibold">
                  {result.correct}/{items.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Score</span>
                <span className="font-semibold">{result.score}</span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <Button size="sm" variant="secondary" onClick={handleReset}>
                Play again
              </Button>
              <Link
                to="/"
                className={buttonVariants({ size: "sm", variant: "outline" })}
              >
                Go home
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );

  function handleDragEnd(event: DragEndEvent) {
    if (isSubmitted || lives <= 0) return;

    const { active, over } = event;
    const activeId = String(active.id);
    const item = items.find((it) => it.id === activeId);

    // If dropped over a container, assign that container.
    // Otherwise, send the item back to the unassigned pool.
    if (!over) {
      setAssignments((prev) => ({
        ...prev,
        [activeId]: null,
      }));
      return;
    }

    const containerId = String(over.id);
    const isCorrectPlacement = item ? item.type === containerId : false;

    setAssignments((prev) => {
      const nextAssignments = {
        ...prev,
        [activeId]: isCorrectPlacement ? containerId : null,
      };

      if (!isCorrectPlacement && item) {
        const now = Date.now();
        // Guard against duplicate drag-end events firing in quick succession
        if (
          lastDamageTimeRef.current &&
          now - lastDamageTimeRef.current < 100
        ) {
          return nextAssignments;
        }

        lastDamageTimeRef.current = now;

        // Wrong bin: send item back to initial pool, lose a life, and trigger damage effect
        setIsDamaged(true);
        setLives((prevLives) => {
          const nextLives = Math.max(prevLives - 1, 0);

          if (nextLives <= 0) {
            const nextResult = computeResult({
              items,
              assignments: nextAssignments,
              elapsedSeconds,
              lives: nextLives,
            });
            setResult(nextResult);
            setIsSubmitted(true);
          }

          return nextLives;
        });
      }

      return nextAssignments;
    });
  }

  function handleReset() {
    setAssignments(
      items.reduce(
        (acc, item) => {
          acc[item.id] = null;
          return acc;
        },
        {} as Record<string, string | null>,
      ),
    );
    setElapsedSeconds(0);
    setIsSubmitted(false);
    setLives(3);
    setResult(null);
  }
}
