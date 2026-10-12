"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Copy, ExternalLink, MoreHorizontal, Pencil, Pizza, Plus, Search, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/dashboard/primitives";
import { ProductFormDialog } from "@/components/dashboard/product-form-dialog";
import { OptionManager } from "@/components/dashboard/option-manager";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { useDataStore } from "@/store/data-store";
import { startingPrice } from "@/lib/pricing";
import { formatCurrency, uid } from "@/lib/format";
import { cn } from "@/lib/utils";

function ProductsTab() {
  const products = useDataStore((s) => s.products);
  const categories = useDataStore((s) => s.categories);
  const patchProduct = useDataStore((s) => s.patchProduct);
  const saveProduct = useDataStore((s) => s.saveProduct);
  const deleteProduct = useDataStore((s) => s.deleteProduct);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [editing, setEditing] = useState<Product | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<Product | null>(null);

  const catName = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories]);
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const order = new Map(categories.map((c) => [c.id, c.sortOrder]));
    return products
      .filter((p) => (category === "all" || p.categoryId === category) && (!q || p.name.toLowerCase().includes(q)))
      .sort((a, b) => (order.get(a.categoryId) ?? 99) - (order.get(b.categoryId) ?? 99) || a.name.localeCompare(b.name));
  }, [products, categories, query, category]);

  const open = (p: Product | null) => {
    setEditing(p);
    setFormOpen(true);
  };

  const duplicate = (p: Product) => {
    const copy: Product = { ...p, id: uid("prd"), slug: `${p.slug}-copy-${Math.random().toString(36).slice(2, 5)}`, name: `${p.name} (copy)`, featured: false, reviewCount: 0 };
    saveProduct(copy);
    toast.success(`Duplicated ${p.name}`);
  };

  return (
    <div className="rounded-2xl bg-card shadow-xs ring-1 ring-border">
      <div className="flex flex-col gap-2 border-b p-4 sm:flex-row">
        <div className="relative flex-1">
          <label htmlFor="product-search" className="sr-only">Search products</label>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input id="product-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products" className="h-10 rounded-xl pl-9" />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="h-10 min-w-48 rounded-xl" aria-label="Filter by category"><SelectValue /></SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button className="h-10 rounded-xl" onClick={() => open(null)}><Plus /> Add product</Button>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={Pizza} title="No products found" description="Try another search or add a new product." />
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-5">Product</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="hidden sm:table-cell">Featured</TableHead>
                <TableHead>Available</TableHead>
                <TableHead className="pr-5 text-right"><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((p) => (
                <TableRow key={p.id} className={cn(!p.available && "opacity-70")}>
                  <TableCell className="pl-5">
                    <div className="flex items-center gap-3">
                      <div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-muted">
                        <Image src={p.image} alt="" fill sizes="44px" className="object-cover" />
                      </div>
                      <div className="min-w-0">
                        <button onClick={() => open(p)} className="block max-w-56 truncate text-left font-semibold hover:text-primary">{p.name}</button>
                        <p className="text-xs text-muted-foreground">{p.kind === "pizza" ? `${p.sizes.length} sizes · ${p.toppingIds.length} toppings` : "Fixed price"}{p.bestSeller && " · Bestseller"}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">{catName.get(p.categoryId) ?? "—"}</TableCell>
                  <TableCell className="tabular font-medium">{p.kind === "pizza" && "from "}{formatCurrency(startingPrice(p))}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <button
                      onClick={() => { patchProduct(p.id, { featured: !p.featured }); toast.success(p.featured ? `${p.name} removed from homepage` : `${p.name} featured on homepage`); }}
                      className="flex size-9 items-center justify-center rounded-lg hover:bg-muted"
                      aria-pressed={p.featured}
                      aria-label={`Feature ${p.name} on homepage`}
                    >
                      <Star className={cn("size-[18px]", p.featured ? "fill-gold-500 text-gold-500" : "text-muted-foreground")} />
                    </button>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={p.available}
                      aria-label={`${p.name} available`}
                      onCheckedChange={(v) => { patchProduct(p.id, { available: v }); toast.success(`${p.name} ${v ? "back in stock" : "marked sold out"}`); }}
                    />
                  </TableCell>
                  <TableCell className="pr-5 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-lg" className="size-9" aria-label={`Actions for ${p.name}`}><MoreHorizontal /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => open(p)}><Pencil /> Edit</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => duplicate(p)}><Copy /> Duplicate</DropdownMenuItem>
                        <DropdownMenuItem asChild><Link href={`/menu/${p.slug}`} target="_blank"><ExternalLink /> View on site</Link></DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onSelect={() => setDeleting(p)}><Trash2 /> Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ProductFormDialog product={editing} open={formOpen} onOpenChange={setFormOpen} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Delete ${deleting?.name}?`}
        description="It will disappear from the customer menu. Past orders keep their record."
        confirmLabel="Delete product"
        destructive
        onConfirm={() => {
          if (!deleting) return;
          deleteProduct(deleting.id);
          toast.success(`${deleting.name} deleted`);
          setDeleting(null);
        }}
      />
    </div>
  );
}

export default function ManagerMenuPage() {
  const products = useDataStore((s) => s.products);
  const toppings = useDataStore((s) => s.toppings);
  const addons = useDataStore((s) => s.addons);
  const saveTopping = useDataStore((s) => s.saveTopping);
  const deleteTopping = useDataStore((s) => s.deleteTopping);
  const saveAddon = useDataStore((s) => s.saveAddon);
  const deleteAddon = useDataStore((s) => s.deleteAddon);
  const soldOut = products.filter((p) => !p.available).length;

  return (
    <>
      <PageHeader
        title="Menu management"
        description={`${products.length} products · ${soldOut} sold out · changes go live on the customer website instantly`}
        actions={<Button asChild variant="outline" className="h-10 rounded-xl"><Link href="/menu" target="_blank"><ExternalLink /> Preview menu</Link></Button>}
      />
      <Tabs defaultValue="products" className="gap-4">
        <TabsList className="h-10">
          <TabsTrigger value="products" className="px-4">Products</TabsTrigger>
          <TabsTrigger value="toppings" className="px-4">Toppings ({toppings.length})</TabsTrigger>
          <TabsTrigger value="addons" className="px-4">Add-ons ({addons.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="products"><ProductsTab /></TabsContent>
        <TabsContent value="toppings">
          <OptionManager noun="Topping" rows={toppings} showVeg usage={(id) => products.filter((p) => p.toppingIds.includes(id)).length} onSave={saveTopping} onDelete={deleteTopping} />
        </TabsContent>
        <TabsContent value="addons">
          <OptionManager noun="Add-on" rows={addons} usage={(id) => products.filter((p) => p.addonIds.includes(id)).length} onSave={saveAddon} onDelete={deleteAddon} />
        </TabsContent>
      </Tabs>
    </>
  );
}
