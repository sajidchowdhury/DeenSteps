import { CheckCircle2, Clock, Star, Trophy, Target, Sparkles } from 'lucide-react'

export function ProductPreviewSection() {
  return (
    <section id="preview" className="border-t border-border bg-background py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            প্রতিদিনের অগ্রগতি, এক নজরেই
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            সহজ, সুন্দর ড্যাশবোর্ড — বাবা-মা ও সন্তান সবার জন্য।
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {/* Parent dashboard mockup */}
          <PreviewCard label="অভিভাবকের ড্যাশবোর্ড" accent="emerald">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">পরিবারের সারসংক্ষেপ</p>
                  <p className="font-display text-base font-bold text-foreground">রহমান পরিবার</p>
                </div>
                <div className="flex -space-x-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white ring-2 ring-card">জ</div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white ring-2 ring-card">ম</div>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="rounded-lg bg-emerald-soft p-2.5">
                  <p className="text-[10px] text-muted-foreground">আজ</p>
                  <p className="text-base font-bold text-foreground">৮২%</p>
                </div>
                <div className="rounded-lg bg-sky-soft p-2.5">
                  <p className="text-[10px] text-muted-foreground">রিভিউ</p>
                  <p className="text-base font-bold text-foreground">২</p>
                </div>
                <div className="rounded-lg bg-sunshine p-2.5">
                  <p className="text-[10px] text-muted-foreground">তারা</p>
                  <p className="text-base font-bold text-foreground">৯৫</p>
                </div>
              </div>
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2 rounded-lg bg-secondary/40 p-2">
                  <div className="h-6 w-6 rounded-full bg-emerald-600" />
                  <span className="flex-1 text-xs text-foreground">জাইদ · নামাজ সম্পন্ন</span>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-secondary/40 p-2">
                  <div className="h-6 w-6 rounded-full bg-amber-500" />
                  <span className="flex-1 text-xs text-foreground">মরিয়ম · কুরআন পড়া</span>
                  <Clock className="h-3.5 w-3.5 text-amber-500" />
                </div>
              </div>
            </div>
          </PreviewCard>

          {/* Child dashboard mockup */}
          <PreviewCard label="সন্তানের ড্যাশবোর্ড" accent="sky">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">জ</div>
                <div>
                  <p className="font-display text-sm font-bold text-foreground">আসসালামু আলাইকুম, জাইদ!</p>
                  <p className="text-[10px] text-muted-foreground">আজকের কাজগুলো একসঙ্গে করি</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="rounded-lg bg-sunshine p-2 text-center">
                  <Star className="mx-auto h-3.5 w-3.5 text-amber-600" />
                  <p className="mt-0.5 text-sm font-bold text-foreground">৭৯</p>
                  <p className="text-[9px] text-muted-foreground">তারা</p>
                </div>
                <div className="rounded-lg bg-emerald-soft p-2 text-center">
                  <CheckCircle2 className="mx-auto h-3.5 w-3.5 text-emerald-600" />
                  <p className="mt-0.5 text-sm font-bold text-foreground">৩/৫</p>
                  <p className="text-[9px] text-muted-foreground">আজ</p>
                </div>
                <div className="rounded-lg bg-sky-soft p-2 text-center">
                  <Trophy className="mx-auto h-3.5 w-3.5 text-sky-600" />
                  <p className="mt-0.5 text-sm font-bold text-foreground">৫</p>
                  <p className="text-[9px] text-muted-foreground">ধারা</p>
                </div>
              </div>
              <div className="mt-3 rounded-lg bg-secondary/40 p-2.5">
                <p className="text-[10px] font-medium text-foreground">আজকের অভ্যাস</p>
                <div className="mt-1.5 space-y-1.5">
                  <div className="flex items-center gap-2 text-[11px]">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    <span className="text-foreground line-through opacity-70">সকালের নামাজ</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    <span className="text-foreground line-through opacity-70">বিছানা গোছানো</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="h-3 w-3 rounded-full border-2 border-amber-400" />
                    <span className="text-foreground">কুরআন পড়া</span>
                  </div>
                </div>
              </div>
            </div>
          </PreviewCard>

          {/* Weekly progress tracker */}
          <PreviewCard label="সাপ্তাহিক অগ্রগতি" accent="amber">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <p className="font-display text-sm font-bold text-foreground">এই সপ্তাহের অগ্রগতি</p>
                <Target className="h-4 w-4 text-violet-500" />
              </div>
              <div className="mt-3 flex items-end justify-between gap-1.5">
                {[40, 65, 50, 80, 55, 90, 70].map((h, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1">
                    <div className="flex w-full items-end justify-center" style={{ height: '60px' }}>
                      <div
                        className="w-full rounded-t bg-gradient-to-t from-emerald-400 to-emerald-500"
                        style={{ height: `${h}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-muted-foreground">{['র', 'সো', 'ম', 'বু', 'বৃ', 'শু', 'শ'][i]}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 rounded-lg bg-emerald-soft p-2 text-center">
                <p className="text-[11px] font-medium text-emerald-deep">দারুণ চেষ্টা! আর একটু এগিয়ে গেলেই লক্ষ্যে।</p>
              </div>
            </div>
          </PreviewCard>

          {/* Reward progress card */}
          <PreviewCard label="পরের আনন্দের লক্ষ্য" accent="emerald">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <p className="font-display text-sm font-bold text-foreground">পরের পুরস্কার</p>
                <Trophy className="h-4 w-4 text-amber-500" />
              </div>
              <div className="mt-3 flex items-center gap-3">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-sunshine">
                  <span className="text-xl">🍕</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">বাসায় পিৎজা</p>
                  <p className="text-[10px] text-muted-foreground">৪০ তারা লাগবে</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-extrabold text-amber-600">৭৯/৪০</p>
                  <p className="text-[9px] text-emerald-600 font-medium">প্রস্তুত!</p>
                </div>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-500" style={{ width: '100%' }} />
              </div>
              <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-emerald-soft p-2">
                <Sparkles className="h-3 w-3 text-emerald-600" />
                <p className="text-[11px] text-emerald-deep">তোমার চেষ্টা সত্যিই সুন্দর!</p>
              </div>
            </div>
          </PreviewCard>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          উপরের ডেটা শুধু প্রদর্শনের জন্য — আপনার পরিবারের আসল অগ্রগতি আপনি যখন ব্যবহার শুরু করবেন তখন দেখা যাবে।
        </p>
      </div>
    </section>
  )
}

function PreviewCard({
  label,
  accent,
  children,
}: {
  label: string
  accent: 'emerald' | 'sky' | 'amber'
  children: React.ReactNode
}) {
  const accentMap = {
    emerald: 'bg-emerald-soft text-emerald-deep',
    sky: 'bg-sky-soft text-sky-deep',
    amber: 'bg-sunshine text-sunshine-deep',
  }
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className={`inline-flex h-2 w-2 rounded-full ${accentMap[accent].split(' ')[0]}`} />
        <span className={`text-xs font-semibold uppercase tracking-wide ${accentMap[accent].split(' ')[1]}`}>{label}</span>
      </div>
      {children}
    </div>
  )
}
