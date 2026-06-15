import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { DashboardGrid, Widget } from '@/components/dashboard/DashboardGrid'
import { ScholarshipTreeWidget } from '@/components/dashboard/widgets/ScholarshipTreeWidget'
import { ProfileCompletionWidget } from '@/components/dashboard/widgets/ProfileCompletionWidget'
import { UpcomingDeadlinesWidget } from '@/components/dashboard/widgets/UpcomingDeadlinesWidget'
import { MatchScoreWidget } from '@/components/dashboard/widgets/MatchScoreWidget'
import { AIRecommendationsWidget } from '@/components/dashboard/widgets/AIRecommendationsWidget'
import { RoadmapWidget } from '@/components/dashboard/widgets/RoadmapWidget'
import { RecentActivityWidget } from '@/components/dashboard/widgets/RecentActivityWidget'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      profile: true,
    }
  })

  if (!dbUser?.profile) {
    redirect('/onboarding')
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-8">
      <div>
        <h1 className="text-3xl font-heading font-bold tracking-tight">
          Welcome back, {dbUser.name?.split(' ')[0] || 'Scholar'}!
        </h1>
        <p className="text-muted-foreground mt-2">
          Your dashboard is ready. Keep growing your scholarship tree!
        </p>
      </div>

      <DashboardGrid>
        {/* Top Row: Tree + Key Stats */}
        <Widget colSpan={8}>
          <ScholarshipTreeWidget />
        </Widget>
        <Widget colSpan={4} className="space-y-6">
          <div className="h-[calc(50%-12px)]">
            <ProfileCompletionWidget />
          </div>
          <div className="h-[calc(50%-12px)]">
            <MatchScoreWidget />
          </div>
        </Widget>

        {/* Middle Row: AI & Deadlines */}
        <Widget colSpan={6}>
          <AIRecommendationsWidget />
        </Widget>
        <Widget colSpan={6}>
          <UpcomingDeadlinesWidget />
        </Widget>

        {/* Bottom Row: Roadmap & Activity */}
        <Widget colSpan={6}>
          <RoadmapWidget />
        </Widget>
        <Widget colSpan={6}>
          <RecentActivityWidget />
        </Widget>
      </DashboardGrid>
    </div>
  )
}
