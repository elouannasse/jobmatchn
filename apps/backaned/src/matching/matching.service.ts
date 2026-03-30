import { Injectable } from '@nestjs/common';

export interface MatchingCandidate {
  skills?: string[] | null;
  title?: string | null;
  location?: string | null;
  summary?: string | null;
  user?: {
    firstName?: string | null;
    lastName?: string | null;
  } | null;
}

export interface MatchingJob {
  skills?: string[] | null;
  title?: string | null;
  location?: string | null;
  description?: string | null;
}

@Injectable()
export class MatchingService {
  /**
   * Calcule un score global pondéré entre un candidat et une offre d'emploi.
   */
  calculateComprehensiveScore(
    candidate: MatchingCandidate,
    job: MatchingJob,
  ): number {
    const weights = {
      skills: 0.6,
      title: 0.2,
      location: 0.1,
      summary: 0.1,
    };

    console.log(`[MatchingService] CALCULATION START for candidate:`, {
      skills: candidate.skills,
      title: candidate.title,
    });
    console.log(`[MatchingService] job:`, {
      title: job.title,
      skills: job.skills,
    });

    const scores = {
      skills: this.calculateSkillsScore(
        candidate.skills || [],
        job.skills || [],
      ),
      title: this.calculateTitleScore(candidate.title || '', job.title || ''),
      location: this.calculateLocationScore(
        candidate.location || '',
        job.location || '',
      ),
      summary: this.calculateSummaryScore(
        candidate.summary || '',
        job.description || '',
      ),
    };

    const finalScore =
      scores.skills * weights.skills +
      scores.title * weights.title +
      scores.location * weights.location +
      scores.summary * weights.summary;

    console.log(`[MatchingService] CALCULATION END. Breakdowns:`, scores);
    console.log(`[MatchingService] Final Score:`, finalScore);

    return Math.round(finalScore);
  }

  /**
   * Score des compétences (60%)
   */
  calculateSkillsScore(candidateSkills: string[], jobSkills: string[]): number {
    if (!jobSkills || jobSkills.length === 0) return 100;
    if (!candidateSkills || candidateSkills.length === 0) return 0;

    const normalizedCandidate = candidateSkills.map((s) =>
      s.toLowerCase().trim(),
    );
    const normalizedJob = jobSkills.map((s) => s.toLowerCase().trim());

    const matches = normalizedJob.filter((skill) =>
      normalizedCandidate.includes(skill),
    );

    // Formula: (matchingSkills / totalRequiredSkills) * 100
    const score = (matches.length / normalizedJob.length) * 100;

    console.log(
      `[MatchingService] Skill match: ${matches.length}/${normalizedJob.length} -> ${score}%`,
    );
    return score;
  }

  /**
   * Score du titre (20%)
   * Compare le titre du profil et le titre du job (overlap de mots-clés)
   */
  calculateTitleScore(candidateTitle: string, jobTitle: string): number {
    const cTitle = (candidateTitle || '').toLowerCase().trim();
    const jTitle = (jobTitle || '').toLowerCase().trim();

    if (!cTitle || !jTitle) return 0;
    if (cTitle === jTitle) return 100;

    const words1 = this.extractKeywords(cTitle);
    const words2 = this.extractKeywords(jTitle);

    if (words2.length === 0) return 0; // Au lieu de 100, pour éviter les faux positifs sur titres vides/courts

    const matches = words2.filter((w) => words1.includes(w));
    return (matches.length / words2.length) * 100;
  }

  /**
   * Score de localisation (10%)
   */
  calculateLocationScore(candidateLoc: string, jobLoc: string): number {
    if (
      !jobLoc ||
      jobLoc.toLowerCase().includes('télétravail') ||
      jobLoc.toLowerCase().includes('remote')
    )
      return 100;
    if (!candidateLoc) return 0;

    const cLoc = candidateLoc.toLowerCase().trim();
    const jLoc = jobLoc.toLowerCase().trim();

    if (cLoc === jLoc) return 100;
    if (cLoc.includes(jLoc) || jLoc.includes(cLoc)) return 80;

    return 0;
  }

  /**
   * Score résumé/description (10%)
   */
  calculateSummaryScore(summary: string, description: string): number {
    if (!description) return 100;
    if (!summary) return 0;

    const summaryKeywords = this.extractKeywords(summary);
    const descKeywords = this.extractKeywords(description);

    if (descKeywords.length === 0) return 100;

    const matches = descKeywords.filter((w) => summaryKeywords.includes(w));
    // On limite à 100% même si beaucoup de mots matchent
    const score = (matches.length / Math.min(descKeywords.length, 20)) * 100;

    return Math.min(score, 100);
  }

  private extractKeywords(text: string): string[] {
    if (!text) return [];

    // Stop words simples (FR/EN)
    const stopWords = new Set([
      'le',
      'la',
      'les',
      'de',
      'du',
      'des',
      'un',
      'une',
      'et',
      'en',
      'pour',
      'avec',
      'par',
      'sur',
      'dans',
      'the',
      'and',
      'for',
      'with',
      'is',
      'at',
      'on',
      'in',
      'to',
      'a',
      'of',
    ]);

    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Supprimer ponctuation
      .split(/\s+/)
      .filter((w) => w.length >= 2 && !stopWords.has(w)); // Admet "AI", "JS", "Go"
  }

  /**
   * Compatibilité ascendante ou helper
   */
  calculateScore(candidateSkills: string[], jobSkills: string[]): number {
    return this.calculateSkillsScore(candidateSkills, jobSkills);
  }

  getMatchedSkills(candidateSkills: string[], jobSkills: string[]): string[] {
    if (!candidateSkills || !jobSkills) return [];
    const normalizedCandidate = candidateSkills.map((s) =>
      s.toLowerCase().trim(),
    );
    return jobSkills.filter((s) =>
      normalizedCandidate.includes(s.toLowerCase().trim()),
    );
  }
}
