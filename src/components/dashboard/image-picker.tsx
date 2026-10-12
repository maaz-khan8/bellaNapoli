"use client";

/* eslint-disable @next/next/no-img-element -- previews may be user-uploaded data URLs */
import { useId, useRef, useState } from "react";
import { Check, ImageUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { IMAGE_LIBRARY } from "@/lib/images";
import { fileToCompressedDataUrl } from "@/lib/image-upload";
import { cn } from "@/lib/utils";

export function ImagePicker({
  value,
  onChange,
  label = "Image",
  round = false,
  maxSize,
  library = true,
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  round?: boolean;
  maxSize?: number;
  library?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const id = useId();

  const onFile = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    try {
      onChange(await fileToCompressedDataUrl(file, maxSize));
      toast.success("Image uploaded", { description: "Stored locally for this demo." });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <div className={cn("relative size-20 shrink-0 overflow-hidden bg-muted ring-1 ring-border", round ? "rounded-full" : "rounded-xl")}>
          {value ? <img src={value} alt={`${label} preview`} className="size-full object-cover" /> : <span className="flex size-full items-center justify-center text-xs text-muted-foreground">None</span>}
        </div>
        <div className="space-y-1.5">
          <input ref={inputRef} id={id} type="file" accept="image/*" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
          <Button type="button" variant="outline" className="h-9" disabled={busy} onClick={() => inputRef.current?.click()}>
            {busy ? <Loader2 className="animate-spin" /> : <ImageUp />} Upload {label.toLowerCase()}
          </Button>
          {value && <Button type="button" variant="ghost" className="h-8 px-2 text-xs text-muted-foreground" onClick={() => onChange("")}>Remove</Button>}
          <p className="text-xs text-muted-foreground">JPG, PNG or WebP. Resized automatically.</p>
        </div>
      </div>
      {library && (
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Or choose from the photo library</p>
          <div role="radiogroup" aria-label={`${label} library`} className="grid max-h-44 grid-cols-6 gap-2 overflow-y-auto pr-1 sm:grid-cols-8">
            {IMAGE_LIBRARY.map((img) => {
              const selected = value === img.url;
              return (
                <button
                  key={img.url}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={img.label}
                  title={img.label}
                  onClick={() => onChange(img.url)}
                  className={cn("relative aspect-square overflow-hidden rounded-lg ring-2 transition", selected ? "ring-primary" : "ring-transparent hover:ring-primary/40")}
                >
                  <img src={img.url.replace("w=900", "w=120").replace("w=1400", "w=120").replace("w=1600", "w=120")} alt="" loading="lazy" className="size-full object-cover" />
                  {selected && <span className="absolute inset-0 flex items-center justify-center bg-primary/40 text-white"><Check className="size-4" /></span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
