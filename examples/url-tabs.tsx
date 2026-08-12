'use client';

import { useQueryState } from 'next-query-sync';

const tabs = ['overview', 'activity', 'settings'] as const;
type Tab = (typeof tabs)[number];

export function UrlTabs() {
  const [tab, setTab] = useQueryState('tab', 'overview', { history: 'push' });
  const activeTab: Tab = tabs.includes(tab as Tab) ? (tab as Tab) : 'overview';

  return (
    <div>
      <nav aria-label="Project sections">
        {tabs.map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={activeTab === value}
            onClick={() => setTab(value)}
          >
            {value}
          </button>
        ))}
      </nav>

      <p>Current tab: {activeTab}</p>
    </div>
  );
}

// Selecting Activity produces ?tab=activity.
// Selecting Overview removes the param because "overview" is the primitive default.
// `push` makes Back/Forward traverse meaningful tab navigation.
