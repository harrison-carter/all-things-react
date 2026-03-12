import { FormContextProvider } from "./form-context";
import { ContextNetworkStatus } from "./network-status";

export default function ContextLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FormContextProvider>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Approach 1: Context Provider</h1>
            <p className="text-sm text-zinc-500">
              FormContextProvider wraps the entire sub-tree at this layout level
            </p>
          </div>
          <ContextNetworkStatus />
        </div>
        <div className="rounded-lg border border-zinc-800 p-6">{children}</div>
      </div>
    </FormContextProvider>
  );
}
