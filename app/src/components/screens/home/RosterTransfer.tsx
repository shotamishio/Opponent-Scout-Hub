import { useRef, useState } from 'react';
import { useAppDispatch, useAppState } from '@/state/AppContext';
import { MODES } from '@/data/modes';
import { parseRosterFile, serializeRoster } from '@/state/rosterStorage';

// Export / import of the opponent list.
//
// The list is saved in the browser, which means it doesn't follow the analyst
// to another machine — the published site is static, so there is no account
// to sync through. A file covers that gap: write it out here, read it in on
// the other machine. It is also the backup if browser storage is cleared, and
// a way to hand a curated list to a colleague.
//
// Lives inside edit mode ("国を追加 / 除外"), next to where the list is
// actually changed, so the normal view stays uncluttered.
export function RosterTransfer() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const fileInput = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  const handleExport = () => {
    const blob = new Blob([serializeRoster(state.roster)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    // ASCII filename, and attached to the document before clicking: Chromium
    // ignored the download attribute otherwise and saved the file as
    // "download" with no extension.
    link.download = `opponent-scout-hub-roster-${today()}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    // Revoking immediately can cancel the download in some browsers; a tick is
    // enough for the click to have been handled.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage({ text: '対戦国リストを書き出しました。', error: false });
  };

  const handleFile = async (file: File) => {
    try {
      const result = parseRosterFile(await file.text());
      dispatch({ type: 'REPLACE_ROSTER', roster: result.roster });
      const summary = result.counts
        .map(({ mode, count }) => `${MODES.find((m) => m.key === mode)?.short ?? mode} ${count}カ国`)
        .join(' / ');
      setMessage({
        text: `読み込みました（${summary}）。${result.skipped > 0 ? `※ 現在のバージョンで扱えない ${result.skipped} 件は除外しました。` : ''}`,
        error: false,
      });
    } catch (error) {
      setMessage({
        text: `読み込めませんでした（${error instanceof Error ? error.message : String(error)}）。対戦国リストは変更していません。`,
        error: true,
      });
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        flexWrap: 'wrap',
        padding: 'var(--space-3) 0 0',
      }}
    >
      <span style={{ fontSize: 12, color: 'color-mix(in srgb,var(--color-text) 55%,transparent)' }}>
        対戦国リストは、このブラウザに保存されます。別のPCへ移すときはファイルで受け渡してください。
      </span>
      <button className="btn btn-secondary" onClick={handleExport}>
        リストを書き出し
      </button>
      <button className="btn btn-secondary" onClick={() => fileInput.current?.click()}>
        リストを読み込み
      </button>
      <input
        ref={fileInput}
        type="file"
        accept="application/json,.json"
        style={{ display: 'none' }}
        onChange={(event) => {
          const file = event.target.files?.[0];
          // Reset first, so selecting the same file twice still fires onChange.
          event.target.value = '';
          if (file) void handleFile(file);
        }}
      />
      {message && (
        <span
          role="status"
          style={{
            fontSize: 12,
            color: message.error ? 'var(--color-accent-700)' : 'color-mix(in srgb,var(--color-text) 65%,transparent)',
          }}
        >
          {message.text}
        </span>
      )}
    </div>
  );
}

function today(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
}
