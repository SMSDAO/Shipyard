import React from 'react';

const AGENTS = ['Planner', 'Designer', 'Coder', 'Reviewer', 'Deployer'] as const;

/** Shows which agent is working, from the build step string ("Coder: generating the app"). */
export function BuildTimeline({ step }: { step: string | null }) {
  const active = AGENTS.findIndex((a) => step?.toLowerCase().startsWith(a.toLowerCase()));

  return (
    <ol className="flex flex-wrap items-center gap-1.5 text-xs" aria-label="Build progress">
      {AGENTS.map((a, i) => {
        const state = active === -1 ? 'idle' : i < active ? 'done' : i === active ? 'active' : 'idle';
        return (
          <li
            key={a}
            className="chip transition-all duration-200"
            style={{ opacity: state === 'idle' ? 0.45 : 1 }}
            aria-current={state === 'active' ? 'step' : undefined}
          >
            {state === 'done' ? (
              <span className="font-bold text-brand-600 dark:text-brand-400 mr-0.5">✓ </span>
            ) : state === 'active' ? (
              <span className="pulse-dot mr-1 inline-block h-1.5 w-1.5 rounded-full bg-brand-500" />
            ) : null}
            {a}
          </li>
        );
      })}
    </ol>
  );
}

export default BuildTimeline;
