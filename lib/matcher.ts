
import { supabaseAdmin } from '@/lib/db';

interface DeveloperMatch {
    developer: any;
    score: number;
    matchReasons: string[];
}

export async function findBestDevelopersForProject(projectId: string): Promise<DeveloperMatch[]> {
    // 1. Get Project Requirements
    const { data: project } = await supabaseAdmin
        .from('projects')
        .select('*, required_skills, min_experience') // Assuming these columns exist or we parse description
        .eq('id', projectId)
        .single();

    if (!project) throw new Error('Project not found');

    const requiredSkills: string[] = project.required_skills || project.description?.toLowerCase().split(' ') || []; // Fallback simple parsing if column missing

    // 2. Initial Filter: Developers with ANY matching skill (or all, depending on strictness)
    // We'll fetch all active developers for now and filter in-memory for complex ranking if dataset is small, 
    // or use strict SQL for larger sets. Given likely small refined pool:
    const { data: developers } = await supabaseAdmin
        .from('developers')
        .select('*, user:users(name, email)') // Join with user to get names
        .eq('is_blacklisted', false) // Only active devs
        .eq('kyc_status', 'approved'); // Only verified devs

    if (!developers) return [];

    // 3. Scoring Algorithm
    const scoredDevelopers = developers.map(dev => {
        let score = 0;
        const reasons: string[] = [];
        const devSkills = (dev.tech_stack || []).map((s: string) => s.toLowerCase());

        // A. Skill Match (Weight: 50%)
        const matchingSkills = requiredSkills.filter((req: string) =>
            devSkills.some((ds: string) => ds.includes(req.toLowerCase()))
        );

        if (matchingSkills.length > 0) {
            const matchRatio = matchingSkills.length / Math.max(requiredSkills.length, 1);
            score += matchRatio * 50;
            reasons.push(`${matchingSkills.length} matching skills: ${matchingSkills.join(', ')}`);
        }

        // B. Reliability Score (Weight: 30%)
        const reliability = dev.reliability_score || 50; // Default to 50 if new
        score += (reliability / 100) * 30;
        if (reliability > 80) reasons.push('High Reliability Score');

        // C. Experience Level (Weight: 20%)
        // Simple heuristic: Senior > Mid > Junior
        const expMap: Record<string, number> = { 'senior': 100, 'mid': 70, 'junior': 40 };
        const devExp = expMap[dev.experience_level?.toLowerCase()] || 40;
        score += (devExp / 100) * 20;

        // D. Availability Penalty
        if (dev.active_jobs_count > 2) {
            score -= 20;
            reasons.push('High workload penalty');
        }

        return {
            developer: dev,
            score: Math.round(score),
            matchReasons: reasons
        };
    });

    // 4. Sort by Score Descending
    return scoredDevelopers
        .filter(d => d.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5); // Return top 5
}
