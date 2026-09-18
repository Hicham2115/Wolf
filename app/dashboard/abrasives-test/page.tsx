import { Sparkles } from "lucide-react";

const steps = [
  { code: "P180", name: "Graduated mixing cup", ratio: "0.54 × 20.75 €", time: "4.2 min" },
  { code: "P400", name: "Paint cup for compressed…", ratio: "0.46 × 100.16 €", time: "5 min" },
  { code: "P800", name: "Paint strainers 125 μ / 2…", ratio: "1.09 × 66.92 €", time: "6.9 min" },
];

export default function Page() {
  return <div className="mx-auto max-w-[1500px]">
    <div className="mb-10 flex items-center gap-3 text-base font-semibold"><span>Central procurement</span><span className="border border-cyan-800 bg-cyan-950/45 px-2 py-1 text-sm text-muted-foreground">Global</span><span className="text-muted-foreground">⌃</span></div>
    <section className="overflow-hidden border border-border bg-card">
      <div className="p-6 md:p-8">
        <h1 className="text-xl font-bold tracking-wide text-[#ff7900]">ABRASIVES TEST — SYSTEM COMPARISON</h1>
        <p className="mt-2 text-base text-muted-foreground">Not product vs. product but sanding system vs. sanding system per repair case, each brand following its own process guide</p>
        <div className="my-6 h-1 bg-[#ff7900]" />
        <div className="grid gap-6 xl:grid-cols-[2fr_.65fr_1.1fr_1.1fr] xl:items-end">
          <div><p className="mb-2 text-sm text-muted-foreground">Repair case</p><div className="grid grid-cols-3 rounded-sm border border-border p-1 text-center text-sm font-semibold"><button className="bg-[#203a35] px-3 py-3">Prepare a new part</button><button className="px-3 py-3 text-muted-foreground">Sand a primed surface</button><button className="px-3 py-3 text-muted-foreground">Refinish a surface</button></div></div>
          <div><p className="mb-2 text-sm text-muted-foreground">Price basis</p><div className="inline-flex rounded-sm border border-border p-1 text-sm font-medium"><span className="bg-[#203a35] px-2 py-2">Austria</span><span className="px-2 py-2 text-muted-foreground">Portugal</span></div></div>
          <Range label={<>Jobs per Year: <strong>24,000</strong></>} percent="15%" />
          <Range label={<>Hourly labour rate: <strong>74 €/h</strong><br />(Assumption)</>} percent="50%" />
        </div>
      </div>
      <div className="border-t border-border p-6 md:p-8">
        <h2 className="text-base font-medium text-muted-foreground">Synthetic standardized repair scenario</h2><p className="mt-1 text-sm text-muted-foreground/75">Fictional annual volume for scenario comparison.</p>
        <div className="mt-10 flex flex-wrap items-center gap-2 text-base"><span className="size-4 rounded bg-amber-400" /><strong className="mr-3 text-lg">3M · 3M demo process 1</strong><Tag>Synthetic process assumption</Tag><Tag color="green">Instructions received</Tag><Tag>Products promised</Tag><Tag color="amber">Test Synthetic pilot 09/2026</Tag><Tag>Setup time ~5 min</Tag></div>
        <div className="mt-4 grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-start">
          <div><div className="flex items-center gap-2">{steps.map((step, index) => <div className="contents" key={step.code}><article className="relative min-w-0 flex-1 border border-[#31514a] border-t-4 border-t-amber-400 bg-[#12332e] p-3"><div className="flex justify-between gap-3"><strong className="text-lg text-amber-400">{step.code}</strong><span className="text-sm text-muted-foreground">{step.time}</span></div><p className="mt-1 truncate text-sm text-muted-foreground">{step.name}</p><p className="mt-2 text-sm font-semibold">{step.ratio}</p><span className="absolute bottom-4 right-4 size-2 rounded-full bg-green-600" /></article>{index < steps.length - 1 && <span className="hidden h-0.5 w-7 shrink-0 bg-[#34514b] md:block" />}</div>)}</div><p className="mt-4 text-sm text-muted-foreground/70">Not a manufacturer instruction. Technically validate before real use.</p></div>
          <aside className="border border-border p-6"><div className="flex items-end gap-3"><strong className="text-3xl font-medium">150.08 €</strong><span className="pb-1 text-sm text-muted-foreground">per Repair</span><b className="pb-1 text-sm text-red-500">+120 %</b></div><p className="mt-2 text-sm text-muted-foreground">Material 130.22 € · Labour time 16.1 min = 19.86 €</p><p className="mt-5 text-lg font-bold">3.6 €m p.a.</p><p className="mt-1 text-sm leading-7 text-muted-foreground">at 24,000 jobs/year · Additional cost 1.97 €m versus cheapest</p></aside>
        </div>
      </div>
    </section>
    <button aria-label="Open assistant" className="fixed bottom-6 right-7 grid size-16 place-items-center rounded-full bg-[#ff8a00] text-white shadow-lg"><Sparkles className="size-8 fill-white" /></button>
  </div>;
}

function Tag({ children, color }: { children: React.ReactNode; color?: "green" | "amber" }) {
  const colorClass = color === "green" ? "border-green-500 text-green-500" : color === "amber" ? "border-amber-500 text-amber-400" : "border-[#4a615b] text-foreground";
  return <span className={`rounded-xl border px-2 py-1 text-sm font-medium ${colorClass}`}>{children}</span>;
}

function Range({ label, percent }: { label: React.ReactNode; percent: string }) {
  return <div><p className="mb-3 text-sm leading-5 text-muted-foreground">{label}</p><div className="relative h-2 rounded bg-[#1d3833]"><span className="absolute inset-y-0 left-0 rounded bg-[#ff7900]" style={{ width: percent }} /><i className="absolute -top-1.5 size-5 rounded-full border-2 border-slate-300 bg-white" style={{ left: `calc(${percent} - 10px)` }} /></div></div>;
}
