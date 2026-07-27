import { useEffect, useRef, useState } from "react";
import { Upload, X } from "lucide-react";

import Button from "@/components/Button";
import Dialog from "@/components/Dialog";
import Input from "@/components/Input";
import { suggestLevelLabels } from "@/lib/derive";
import type { Manifest, NodeInfo } from "@/services/types";

interface IProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  manifest: Manifest | null;
  nodes: NodeInfo[];
  onSaveMeta: (id: string, version: string, subject: string, levels: string[]) => void;
  onExport: () => void;
  onImport: (yaml: string) => void;
}

/** The manifest identity editor: id/version, source subject, and taxonomy level labels + export/import. */
const MetaDialog = ({ open, onOpenChange, manifest, nodes, onSaveMeta, onExport, onImport }: IProps) => {
  const fileInput = useRef<HTMLInputElement>(null);
  const [id, setId] = useState(manifest?.id ?? "");
  const [version, setVersion] = useState(manifest?.version ?? "");
  const [subject, setSubject] = useState(manifest?.subject ?? "");
  const [levels, setLevels] = useState<string[]>(manifest?.levels ?? []);

  useEffect(() => {
    setId(manifest?.id ?? "");
    setVersion(manifest?.version ?? "");
    setSubject(manifest?.subject ?? "");
    setLevels(manifest?.levels ?? []);
  }, [manifest]);

  const folderPaths = nodes.length > 0 ? nodes.map((n) => n.path) : (manifest?.topics ?? []).map((t) => t.path);
  const suggested = suggestLevelLabels(folderPaths);

  const pickFile = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) onImport(await file.text());
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Manifest identity"
      description="Name the source, label the taxonomy levels, or export/import the manifest."
      footer={
        <>
          <Button variant="ghost" onClick={() => fileInput.current?.click()}>
            <Upload /> Import .yaml
          </Button>
          <Button variant="ghost" onClick={onExport}>
            Export .yaml
          </Button>
          <Button
            onClick={() => onSaveMeta(id.trim(), version.trim(), subject.trim(), levels.map((l) => l.trim()).filter(Boolean))}
          >
            Save identity
          </Button>
          <input
            ref={fileInput}
            type="file"
            accept=".yaml,.yml,text/yaml,application/x-yaml"
            className="hidden"
            onChange={(e) => void pickFile(e)}
          />
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-neutral-600">id</span>
          <Input value={id} onChange={(e) => setId(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-neutral-600">version</span>
          <Input value={version} onChange={(e) => setVersion(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-neutral-600">subject</span>
          <Input
            placeholder="a noun-phrase naming the domain (e.g. the ONDC protocol specifications)"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </label>

        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-neutral-600">level labels</span>
          <Button size="sm" variant="ghost" disabled={suggested.length === 0} onClick={() => setLevels(suggested)}>
            From folders
          </Button>
        </div>
        <div className="flex flex-col gap-2">
          {levels.map((l, i) => (
            <div key={i} className="flex items-center gap-1">
              <Input
                placeholder={`level ${String(i + 1)}`}
                value={l}
                onChange={(e) => setLevels(levels.map((x, j) => (j === i ? e.target.value : x)))}
              />
              <button type="button" title="Remove level" className="text-neutral-500 hover:text-error" onClick={() => setLevels(levels.filter((_, j) => j !== i))}>
                <X className="size-4" />
              </button>
            </div>
          ))}
          <Button size="sm" variant="ghost" className="self-start" onClick={() => setLevels([...levels, ""])}>
            ＋ Add level label
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default MetaDialog;
