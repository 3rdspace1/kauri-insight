import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, BarChart3, Brain, Zap } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <BarChart3 className="h-6 w-6 text-primary" />
            Kauri Insight
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost">Sign In</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="container py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Adaptive surveys that learn and respond
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Kauri Insight replaces basic survey tools with an agentic system
              that adapts to responses, generates insights automatically, and
              helps you take action.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link href="/dashboard">
                <Button size="lg">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t bg-muted/50 py-24">
          <div className="container">
            <div className="mx-auto max-w-5xl">
              <h2 className="text-center text-3xl font-bold">
                Built for modern organisations
              </h2>
              <div className="mt-16 grid gap-8 md:grid-cols-3">
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mt-4 font-semibold">Adaptive Branching</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Surveys that respond to answers in real-time, asking
                    follow-up questions when needed.
                  </p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Brain className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mt-4 font-semibold">AI-Powered Insights</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Automatic analysis of responses with sentiment, themes, and
                    actionable recommendations.
                  </p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mt-4 font-semibold">Visual Reports</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Export presentation-ready reports to PDF and PowerPoint with
                    charts and insights.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container text-center text-sm text-muted-foreground">
          © 2026 Kauri Insight. Built with Next.js and Drizzle.
        </div>
      </footer>
    </div>
  )
}
