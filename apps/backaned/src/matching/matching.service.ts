import { Injectable } from '@nestjs/common';

@Injectable()
export class MatchingService {
  /**
   * Calcule le score de compatibilité entre les compétences d'un candidat et les compétences requises.
   * @param candidateSkills Liste des compétences du candidat
   * @param jobSkills Liste des compétences requises pour le job
   * @returns Un score entre 0 et 100
   */
  calculateScore(candidateSkills: string[], jobSkills: string[]): number {
    if (!jobSkills || jobSkills.length === 0) {
      return 100; // Si aucune compétence n'est requise, le candidat est 100% "compatible" par défaut
    }

    if (!candidateSkills || candidateSkills.length === 0) {
      return 0;
    }

    // Normalisation (minuscules + suppression des espaces)
    const normalizedCandidateSkills = candidateSkills.map((s) =>
      s.toLowerCase().trim(),
    );
    const normalizedJobSkills = jobSkills.map((s) => s.toLowerCase().trim());

    // Calculer les correspondances
    const matches = normalizedJobSkills.filter((skill) =>
      normalizedCandidateSkills.includes(skill),
    );

    // Score = (nombre de matchs / nombre de skills requis) * 100
    const score = (matches.length / normalizedJobSkills.length) * 100;

    return Math.round(score);
  }

  /**
   * Retourne la liste des compétences qui correspondent.
   */
  getMatchedSkills(candidateSkills: string[], jobSkills: string[]): string[] {
    if (!candidateSkills || !jobSkills) return [];

    const normalizedCandidateSkills = candidateSkills.map((s) =>
      s.toLowerCase().trim(),
    );

    return jobSkills.filter((originalSkill) =>
      normalizedCandidateSkills.includes(originalSkill.toLowerCase().trim()),
    );
  }
}
