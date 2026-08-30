import type { UserAchievement } from '@/lib/authClient'

export default function AchievementTile({ achievement }: { achievement: UserAchievement }) {
  return (
    <div
      className={`border p-4 ${achievement.unlocked ? 'border-[#FF7A33]/40 bg-[#17181B]' : 'border-white/10 bg-[#17181B] opacity-40'}`}
      title={achievement.unlockedAt ? `Unlocked ${new Date(achievement.unlockedAt).toLocaleDateString()}` : undefined}
    >
      <p className={`text-sm font-semibold ${achievement.unlocked ? 'text-white' : 'text-[#90939A]'}`}>{achievement.title}</p>
      <p className="mt-1 text-xs text-[#90939A]">{achievement.description}</p>
    </div>
  )
}
