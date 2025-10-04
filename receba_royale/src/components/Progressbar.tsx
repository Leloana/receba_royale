export function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="w-full rounded-full bg-gray-300 dark:bg-gray-800">
      <div
        className="h-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 transition-all"
        style={{ width: `${progress.toFixed(1)}%` }}
      ></div>
    </div>
  );
}
