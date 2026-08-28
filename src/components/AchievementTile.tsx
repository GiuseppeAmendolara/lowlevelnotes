import type { UserAchievement } from '@/lib/authClient'

export default function AchievementTile({ achievement }: { achievement: UserAchievement }) {
  return (
    <div
      className={`border p-4 ${achievement.unlocked ? 'border-[#FF8A3D]/40 bg-[#0D0D0D]' : 'border-white/10 bg-[#0D0D0D] opacity-40'}`}
      title={achievement.unlockedAt ? `Unlocked ${new Date(achievement.unlockedAt).toLocaleDateString()}` : undefined}
    >
      <p className={`text-sm font-semibold ${achievement.unlocked ? 'text-white' : 'text-[#A1A1AA]'}`}>{achievement.title}</p>
      <p className="mt-1 text-xs text-[#A1A1AA]">{achievement.description}</p>
    </div>
  )
}
