import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { DashboardGrid, Widget } from '@/components/dashboard/DashboardGrid'
import { ScholarshipTreeWidget } from '@/components/dashboard/widgets/ScholarshipTreeWidget'
import { ProfileCompletionWidget } from '@/components/dashboard/widgets/ProfileCompletionWidget'
import { UpcomingDeadlinesWidget } from '@/components/dashboard/widgets/UpcomingDeadlinesWidget'
import { MatchScoreWidget } from '@/components/dashboard/widgets/MatchScoreWidget'
import { AIRecommendationsWidget } from '@/components/dashboard/widgets/AIRecommendationsWidget'
import { RoadmapWidget } from '@/components/dashboard/widgets/RoadmapWidget'
import { RecentActivityWidget } from '@/components/dashboard/widgets/RecentActivityWidget'

export default async function DashboardPage() {
  const headerList = await headers()
  const userId = headerList.get('x-user-id')

  let resolvedUserId = userId
  if (!resolvedUserId) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      redirect('/auth/login')
    }
    resolvedUserId = user?.id
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!resolvedUserId || !uuidRegex.test(resolvedUserId)) {
    redirect('/onboarding')
  }

  let dbUser = null
  try {
    dbUser = await prisma.user.findUnique({
      where: { id: resolvedUserId },
      include: {
        profile: true,
      }
    })
  } catch (error) {
    console.error('Database access error in DashboardPage:', error)
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-xl text-center">
          <h1 className="text-2xl font-bold mb-4">Service temporarily unavailable</h1>
          <p className="text-muted-foreground">We couldn't reach the database. Please check your network or try again later.</p>
        </div>
      </div>
    )
  }

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

        {/* Middle Row: AI Suggestions (Bigger) & Roadmap */}
        <Widget colSpan={4}>
          <UpcomingDeadlinesWidget />
        </Widget>
        <Widget colSpan={4}>
          <AIRecommendationsWidget />
        </Widget>
        <Widget colSpan={4}>
          <ScholarshipTreeWidget />
        </Widget>


        {/* Bottom Row: Upcoming Deadlines (Bigger) & Recent Activity */}
        <Widget colSpan={6}>
          <RoadmapWidget />
        </Widget>
        <Widget colSpan={6}>
          <RecentActivityWidget />
        </Widget>
        {/* Top Row: Key stats & Your Journey (Smaller) */}
        <Widget colSpan={4}>
          <ProfileCompletionWidget />
        </Widget>
        <Widget colSpan={4}>
          <MatchScoreWidget />
        </Widget>
      </DashboardGrid>
    </div>
  )
}
